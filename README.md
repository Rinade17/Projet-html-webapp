# Mood Detector Web App

## Overview

Mood Detector is a web application that uses machine learning to analyze facial expressions in real-time via your webcam and detect your emotional state. The app is built with Flask (Python) for the backend and HTML, CSS, and JavaScript for the frontend. It recognizes five emotions: Happy, Sad, Angry, Neutral, and (optionally) others.

## Features
- **Real-time Mood Detection:** Uses a Teachable Machine model to analyze webcam input and predict your mood.
- **Mood History:** Saves detected moods with confidence scores and timestamps, viewable in a dedicated history page.
- **Modern UI:** Clean, responsive design with easy navigation.

## How It Works
1. **Home Page:** Introduction and instructions.
2. **Detection Page:** Start the camera, allow access, and let the AI analyze your mood.
3. **Submit Mood:** Save your current mood to the database.
4. **History Page:** View all previously saved moods.

## Project Structure
- `app.py` — Flask backend serving HTML, CSS, JS, and API endpoints.
- `index.html` — Mood detection interface.
- `intro.html` — Home/intro page.
- `history.html` — Mood history display.
- `script.js` — Handles webcam, model loading, prediction, and API calls.
- `styles.css` — App styling.
- `README.md` — Project documentation.

## Setup & Run
1. **Install dependencies:**
   - Python 3.x
   - Flask (`pip install flask`)
2. **Run the app:**
   ```powershell
   python app.py
   ```
3. **Open in browser:**
   - Visit `http://localhost:5000` to use the app.

## Model
- Uses a Teachable Machine image model hosted online.
- Model URL: `https://teachablemachine.withgoogle.com/models/oiYTgDJfX/`

## Author
- Created by ELAZZOUZI Rinade

## License
This project is for educational and personal use.
