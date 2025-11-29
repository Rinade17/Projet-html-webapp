# Mood Detector — Project Report

This document is a detailed technical report for the "Mood Detector" web application in this repository. It expands on the README and provides full run instructions, architecture description, routes, troubleshooting steps, and recommended improvements.

---

## 1. Project Summary

- Name: Mood Detector
- Purpose: Real-time emotion detection from webcam images using a Teachable Machine image model in the browser with a small Flask backend to record and serve detected moods.
- Tech stack: Frontend (HTML/CSS/JS, TensorFlow.js / Teachable Machine), Backend (Python 3.14, Flask), optional SQLite for persistence.

## 2. Current Project Structure (important files)

Root (project) folder: `C:\Perso\Projet html webapp`

- `app/`
  - `app.py` — main Flask application (defines routes and in-memory `mood_history` storage). The file explicitly sets `template_folder` and `static_folder` to ensure templates and static assets are found.
  - `__init__.py` — makes `app` a package (created during reorganization).
  - `__main__.py` — alternative entry point for `python -m app` (light runner).
  - `routes.py` — (may exist in some revisions) route definitions.
- `templates/`
  - `intro.html` — home page
  - `index.html` — detection UI page (loads model and camera)
  - `history.html` — page that fetches `/get_history` and displays results
- `static/`
  - `script.js` — client logic: loads Teachable Machine model, handles webcam, predicts, updates UI, POSTs to `/save_mood`, and calls `/get_history` on the history page
  - `styles.css` — styling
  - `md.jpg` — logo/image
- `.venv/` — virtual environment (created for the project)
- `mood_data.db` — present in repository but not used by current code (candidate for SQLite persistence)
- `requirements.txt` — lists `flask` (ensure this is kept updated)
- `PROJECT_REPORT.md` — this file
- `README.md` — short documentation (you may keep both README and this detailed report)


## 3. Application Routes and API

All routes are defined in `app/app.py` (or `app/routes.py` depending on layout). Current routes:

- `GET /` — renders `intro.html` (home page)
- `GET /detection` — renders `index.html` (the detection interface)
- `GET /history` — renders `history.html` (shows saved mood history)
- `POST /save_mood` — JSON endpoint. Example request body:
  ```json
  { "emotion": "happy", "confidence": 0.87 }
  ```
  Response on success:
  ```json
  { "status": "success", "total": 5 }
  ```
  On error, returns `{'status':'error', 'message': '...'}.`
- `GET /get_history` — returns JSON list of saved moods:
  ```json
  { "moods": [ { "emotion": "happy", "confidence": 0.87, "timestamp":"2025-11-22 17:00:00" }, ... ] }
  ```

Notes:
- Currently, moods are stored in-memory in `mood_history` (volatile). On server restart the history will be lost.
- `mood_data.db` exists and is a good candidate to persist data using SQLite.


## 4. Frontend Behavior & Data Flow

- `index.html` loads `static/script.js` which:
  - loads the Teachable Machine model using CDN scripts (`@teachablemachine/image` and TensorFlow.js)
  - requests camera permission and creates a webcam element
  - runs predictions in a loop and updates UI bars
  - enables a "Submit" button when prediction confidence is stable
  - when user clicks "Submit", `script.js` sends a POST to `/save_mood` with `{emotion, confidence}`

- `history.html` on load calls `/get_history` and builds a visual timeline of saved moods.


## 5. How to run the project (Windows PowerShell) — step-by-step

1. Open PowerShell and change directory to the project root (note the space in folder name):

```powershell
cd "C:\Perso\Projet html webapp"
```

2. Activate the virtual environment (if you created one):

```powershell
.\.venv\Scripts\Activate
# prompt will change to indicate activation
```

3. Install dependencies (first time only or after updating `requirements.txt`):

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If you don't have a `requirements.txt`, install Flask directly:

```powershell
.\.venv\Scripts\python.exe -m pip install flask
```

4. Start the Flask server from the project root (recommended):

```powershell
.\.venv\Scripts\python.exe app/app.py
```

Alternative: run as a package (if `__main__.py` is present):

```powershell
python -m app
```

5. Open browser to:

- `http://127.0.0.1:5000/` — home
- `http://127.0.0.1:5000/detection` — detection
- `http://127.0.0.1:5000/history` — history


## 6. How to restart/stop the server

- To stop: press `Ctrl+C` in the terminal running Flask.
- If Flask does not stop or is running in background, force-stop all Python processes (Windows):

```powershell
taskkill /f /im python.exe
```

- Restart: run the `python` (venv) command above again.


## 7. Troubleshooting (common issues & fixes)

1. `TemplateNotFound: intro.html`
   - Cause: Flask cannot find templates in its search path.
   - Fixes:
     - Ensure the `templates` directory is at the project root: `C:\Perso\Projet html webapp\templates\intro.html`.
     - Run the app from the project root, not from inside `app/` or `.venv\Scripts`.
     - Ensure `app` initialization sets the correct `template_folder` (current `app/app.py` does this explicitly).

2. `No module named 'flask'` or `python` not found
   - Cause: Flask not installed in current interpreter or Python not on PATH.
   - Fixes:
     - Activate the venv and run: `.\.venv\Scripts\python.exe -m pip install flask`
     - Use `.venv\Scripts\python.exe` explicitly to run the server.

3. Port mismatch / static files not loading
   - Cause: you may be opening the app served by Live Server (`:5500`) instead of Flask (`:5000`). Static assets and API requests must go to Flask.
   - Fix: open `http://127.0.0.1:5000/`.

4. Starting from wrong directory
   - Cause: running `python app/app.py` from inside `app/` or `.venv\Scripts` will cause Python to look for `app/app/app.py` and fail.
   - Fix: `cd "C:\Perso\Projet html webapp"` then run the server command.

5. `flask.exe` installed to user Scripts not on PATH (pip warning)
   - Fix: use the full path to venv Python or add the user `Scripts` folder to PATH.


## 8. Suggestions & Recommended Improvements

- Persist moods to SQLite using `sqlite3` or SQLAlchemy and use the existing `mood_data.db` file. This prevents data loss on restart.
  - Suggested schema: `moods(id INTEGER PRIMARY KEY, emotion TEXT, confidence REAL, timestamp TEXT)`
  - Update `/save_mood` to insert and `/get_history` to query persisted rows.

- Provide an explicit `run.ps1` or `run.bat` to simplify starting the server for Windows users.
  - Example `run.ps1`:
    ```powershell
    cd "$PSScriptRoot"
    .\.venv\Scripts\python.exe app/app.py
    ```

- Add a small test suite using `pytest` and Flask's test client for API endpoints.

- Improve error handling for JSON endpoints (return proper HTTP status codes like 400 for bad request).

- Add CORS configuration if you ever serve frontend from separate origin:
  ```python
  from flask_cors import CORS
  CORS(app)
  ```

- Add a minimal `dockerfile` if you want reproducible development or deployment.


## 9. Example: Add SQLite persistence (quick plan)

I can implement this for you; the change would include:
- Add `sqlite3` usage or SQLAlchemy to `requirements.txt`.
- Create a `db.py` helper to initialize DB and provide `insert_mood` / `get_all_moods`.
- Update `save_mood` and `get_history` in `app/app.py` to use DB instead of `mood_history`.

If you want this I can implement it now and run quick tests locally.


## 10. Next steps I can do for you now

- Implement SQLite persistence and wire it to `mood_data.db`.
- Add `run.ps1` and update `README.md` with simplified run steps.
- Add tests for routes.

Tell me which of these you want me to implement next and I will update the TODO list and make the changes.

---

*Report generated: 2025-11-29*
