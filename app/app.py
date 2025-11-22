from flask import Flask, request, jsonify, render_template
import datetime

app = Flask(__name__)

mood_history = []

@app.route('/')
def intro():
    return render_template('intro.html')

@app.route('/detection')
def detection():
    return render_template('index.html')  
@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/save_mood', methods=['POST'])
def save_mood():
    try:
        data = request.get_json()
        mood_history.append({
            'emotion': data['emotion'],
            'confidence': data['confidence'],
            'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        return jsonify({'status': 'success', 'total': len(mood_history)})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/get_history')
def get_history():
    return jsonify({'moods': mood_history})

if __name__ == '__main__':
    app.run(debug=True)