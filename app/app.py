from flask import Flask, request, jsonify, send_file
import datetime

app = Flask(__name__)

mood_history = []

@app.route('/')
def intro():
    return send_file('intro.html')

@app.route('/detection')
def detection():
    return send_file('index.html')  
@app.route('/history')
def history():
    return send_file('history.html')

@app.route('/styles.css')
def serve_css():
    return send_file('styles.css')

@app.route('/script.js')
def serve_js():
    return send_file('script.js')

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