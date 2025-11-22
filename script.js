const URL = "https://teachablemachine.withgoogle.com/models/oiYTgDJfX/";

let model, webcam, labelContainer, maxPredictions;
let currentHighestEmotion = '';
let currentHighestConfidence = 0;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("start").disabled = "true";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");

    document.getElementById("submit-btn").style.display = "block";

    for (let i = 0; i < maxPredictions; i++) {
        const barContainer = document.createElement("div");
        barContainer.classList.add("bar-container");

        const label = document.createElement("div");
        label.classList.add("emotion-label");
        label.innerText = "";

        const barWrapper = document.createElement("div");
        barWrapper.classList.add("bar-wrapper");

        const bar = document.createElement("div");
        bar.classList.add("emotion-bar");
        bar.style.width = "0%";

        const percent = document.createElement("div");
        percent.classList.add("percentage");
        percent.innerText = "0%";

        barWrapper.appendChild(bar);
        barContainer.appendChild(label);
        barContainer.appendChild(barWrapper);
        barContainer.appendChild(percent);

        labelContainer.appendChild(barContainer);
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function sendMoodToBackend(emotion, confidence) {
    try {
        const response = await fetch('/save_mood', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emotion: emotion,
                confidence: confidence
            })
        });
        
        const result = await response.json();
        alert('✅ Mood saved to database!');
    } catch (error) {
        alert('❌ Error saving mood. Please try again.');
    }
}

function submitCurrentMood() {
    if (currentHighestEmotion && currentHighestConfidence > 0.3) {
        sendMoodToBackend(currentHighestEmotion, currentHighestConfidence);
    } else {
        alert('Please wait for mood detection to stabilize');
    }
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let highestEmotion = '';
    let highestConfidence = 0;
    
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = prediction[i].probability;
        const percent = Math.round(probability * 100);

        if (probability > highestConfidence) {
            highestConfidence = probability;
            highestEmotion = className;
        }

        const barContainer = labelContainer.children[i];
        const label = barContainer.querySelector(".emotion-label");
        const bar = barContainer.querySelector(".emotion-bar");
        const percentText = barContainer.querySelector(".percentage");

        label.innerText = className;
        bar.style.width = `${percent}%`;
        percentText.innerText = `${percent}%`;

        bar.classList.remove("low-confidence", "medium-confidence", "high-confidence");
        if (percent >= 70) bar.classList.add("high-confidence");
        else if (percent >= 40) bar.classList.add("medium-confidence");
        else bar.classList.add("low-confidence");
    }

    currentHighestEmotion = highestEmotion;
    currentHighestConfidence = highestConfidence;

    const submitBtn = document.getElementById("submit-btn");
    if (highestConfidence > 0.3) {
        submitBtn.innerText = `✅ Submit "${highestEmotion}" (${Math.round(highestConfidence * 100)}%)`;
        submitBtn.style.background = '#27ae60';
    } else {
        submitBtn.innerText = '✅ Submit Current Mood to Database';
        submitBtn.style.background = '#95a5a6';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitCurrentMood);
    }
});