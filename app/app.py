from flask import Flask, request, jsonify, render_template
import datetime
import os

# Get the parent directory (root of the project)
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
template_dir = os.path.join(parent_dir, 'templates')
static_dir = os.path.join(parent_dir, 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

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