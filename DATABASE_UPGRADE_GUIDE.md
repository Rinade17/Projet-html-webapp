# Adding Persistent Database Storage to Mood Detector

## Overview
This guide explains how to upgrade your Mood Detector app from temporary in-memory storage to persistent SQLite database storage. This will keep your mood history even when you restart the server.

## Current Problem
Right now, when you close and reopen the server, all mood data is lost because it's stored in a Python list (`mood_history = []`) that only exists in memory.

## Solution: SQLite Database
SQLite is a lightweight database that stores data in a file on your computer. Perfect for small applications like this.

---

## Step 1: Add SQLite Import

**File:** `app/app.py`

**Find this line:**
```python
import os
```

**Change it to:**
```python
import os
import sqlite3
```

---

## Step 2: Add Database Configuration

**File:** `app/app.py`

**Find this section:**
```python
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

mood_history = []
```

**Replace with:**
```python
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# Database configuration
DB_PATH = os.path.join(parent_dir, 'mood_data.db')

def init_db():
    """Initialize the SQLite database with mood_history table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emotion TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection with row factory for easier access"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database when app starts
init_db()
```

---

## Step 3: Update save_mood Function

**File:** `app/app.py`

**Find this function:**
```python
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
```

**Replace with:**
```python
@app.route('/save_mood', methods=['POST'])
def save_mood():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert new mood data into database
        cursor.execute('''
            INSERT INTO mood_history (emotion, confidence, timestamp)
            VALUES (?, ?, ?)
        ''', (
            data['emotion'],
            data['confidence'],
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        conn.commit()
        
        # Get total count for response
        cursor.execute('SELECT COUNT(*) FROM mood_history')
        total = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({'status': 'success', 'total': total})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
```

---

## Step 4: Update get_history Function

**File:** `app/app.py`

**Find this function:**
```python
@app.route('/get_history')
def get_history():
    return jsonify({'moods': mood_history})
```

**Replace with:**
```python
@app.route('/get_history')
def get_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch all mood history, ordered by most recent first
        cursor.execute('''
            SELECT emotion, confidence, timestamp
            FROM mood_history
            ORDER BY id DESC
        ''')
        
        moods = []
        for row in cursor.fetchall():
            moods.append({
                'emotion': row['emotion'],
                'confidence': row['confidence'],
                'timestamp': row['timestamp']
            })
        
        conn.close()
        
        return jsonify({'moods': moods})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e), 'moods': []})
```

---

## Complete Updated app.py File

Here's what your complete `app/app.py` should look like after all changes:

```python
from flask import Flask, request, jsonify, render_template
import datetime
import os
import sqlite3

# Get the parent directory (root of the project)
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
template_dir = os.path.join(parent_dir, 'templates')
static_dir = os.path.join(parent_dir, 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# Database configuration
DB_PATH = os.path.join(parent_dir, 'mood_data.db')

def init_db():
    """Initialize the SQLite database with mood_history table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emotion TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection with row factory for easier access"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database when app starts
init_db()

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
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert new mood data into database
        cursor.execute('''
            INSERT INTO mood_history (emotion, confidence, timestamp)
            VALUES (?, ?, ?)
        ''', (
            data['emotion'],
            data['confidence'],
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        conn.commit()
        
        # Get total count for response
        cursor.execute('SELECT COUNT(*) FROM mood_history')
        total = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({'status': 'success', 'total': total})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/get_history')
def get_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch all mood history, ordered by most recent first
        cursor.execute('''
            SELECT emotion, confidence, timestamp
            FROM mood_history
            ORDER BY id DESC
        ''')
        
        moods = []
        for row in cursor.fetchall():
            moods.append({
                'emotion': row['emotion'],
                'confidence': row['confidence'],
                'timestamp': row['timestamp']
            })
        
        conn.close()
        
        return jsonify({'moods': moods})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e), 'moods': []})

if __name__ == '__main__':
    app.run(debug=True)
```

---

## How It Works

1. **Database File:** Creates `mood_data.db` in your project root
2. **Table Structure:** 
   - `id`: Auto-increment unique identifier
   - `emotion`: Detected emotion (Happy, Sad, etc.)
   - `confidence`: AI model confidence (0.0 to 1.0)
   - `timestamp`: When mood was saved

3. **Persistence:** Data survives server restarts
4. **Ordering:** Most recent moods show first in history

---

## Testing

1. **Apply the changes** to your `app.py` file
2. **Restart your Flask server**
3. **Test mood detection** and save some moods
4. **Stop the server** completely
5. **Restart the server** 
6. **Check history page** - your old moods should still be there!

---

## Benefits

✅ **Persistent Storage:** Data survives server restarts  
✅ **Better Performance:** Database queries are efficient  
✅ **Scalability:** Can handle thousands of mood records  
✅ **Data Integrity:** Proper data types and constraints  
✅ **Easy to Backup:** Single `mood_data.db` file contains everything

---

## Troubleshooting

**Issue:** `sqlite3` module not found  
**Solution:** SQLite3 comes built-in with Python, no installation needed

**Issue:** Permission denied creating database  
**Solution:** Make sure you have write permissions in the project folder

**Issue:** Database file not created  
**Solution:** Check that `parent_dir` path is correct

---

**Author:** Rinade ELAZZOUZI  
**Project:** Mood Detector Web Application
