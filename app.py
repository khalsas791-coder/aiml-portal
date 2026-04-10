import os
import sqlite3
import uuid
import json
import urllib.request
import urllib.error
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "super_secret_production_key_2026")
UPLOAD_FOLDER = 'static/images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024  # 8MB max upload
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDoM3i2MldcwAs_bJ5_nmJxtUPuUM9Xgg8")

# â•â•â• DATABASE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('CREATE TABLE IF NOT EXISTS home_config (id INTEGER PRIMARY KEY, college_name TEXT, tagline TEXT, intro TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS about_config (id INTEGER PRIMARY KEY, description TEXT, vision TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS mission_points (id INTEGER PRIMARY KEY AUTOINCREMENT, point TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS highlights (id INTEGER PRIMARY KEY AUTOINCREMENT, point TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, image_path TEXT, views INTEGER DEFAULT 0)')
    conn.execute('CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, student_name TEXT, project_title TEXT, description TEXT, github_link TEXT, views INTEGER DEFAULT 0)')
    conn.execute('CREATE TABLE IF NOT EXISTS achievements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS team (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, role TEXT, image_path TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS contact_config (id INTEGER PRIMARY KEY, address TEXT, email TEXT, phone TEXT, map_location TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)')
    conn.execute('CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)')
    conn.execute('CREATE TABLE IF NOT EXISTS gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, caption TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS faq (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer TEXT)')

    # Seed defaults if empty
    if not conn.execute('SELECT * FROM home_config').fetchone():
        conn.execute('INSERT INTO home_config (college_name, tagline, intro) VALUES (?, ?, ?)',
                     ("Guru Nanak Dev Engineering College Bidar",
                      "Empowering technical excellence since 1980.",
                      "GNDECB stands as a beacon of Engineering Education in North Karnataka, fostering innovation and humanitarian values."))
        conn.execute('INSERT INTO about_config (description, vision) VALUES (?, ?)',
                     ("GNDECB is a premier engineering institution affiliated to VTU Belagavi.",
                      "To be a premier institution in technical education by imparting quality education and research."))
        conn.execute('INSERT INTO contact_config (address, email, phone, map_location) VALUES (?, ?, ?, ?)',
                     ("Mailoor Road, Bidar, Karnataka - 585401", "info@gndecb.ac.in", "+91 84822 26569", "GNDEC Bidar Campus"))
        missions = ["Integrate professional skills with academic learning.", "Promote research and consultancy activities.", "Incalculate values and ethics in students."]
        conn.executemany('INSERT INTO mission_points (point) VALUES (?)', [(m,) for m in missions])
        hashed_pw = generate_password_hash('admin123')
        conn.execute('INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)', ('admin', hashed_pw))

    conn.commit()
    conn.close()

init_db()

# â•â•â• GEMINI AI â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
def query_gemini(prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return "Neural engine timeout. Please try again."

# â•â•â• AUTH â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# â•â•â• CONTEXT PROCESSOR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
@app.context_processor
def inject_globals():
    if 'admin_logged_in' in session:
        try:
            conn = get_db_connection()
            count = conn.execute('SELECT COUNT(*) FROM contacts').fetchone()[0]
            conn.close()
            return {'msg_count': count}
        except:
            return {'msg_count': 0}
    return {}

# â•â•â• CORS HELPER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

# â•â•â• API ENDPOINTS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
@app.route('/api/full-site-data')
def api_all_data():
    conn = get_db_connection()
    data = {
        "home": dict(conn.execute('SELECT * FROM home_config LIMIT 1').fetchone() or {}),
        "about": dict(conn.execute('SELECT * FROM about_config LIMIT 1').fetchone() or {}),
        "mission": [row['point'] for row in conn.execute('SELECT * FROM mission_points').fetchall()],
        "highlights": [row['point'] for row in conn.execute('SELECT * FROM highlights').fetchall()],
        "events": [dict(r) for r in conn.execute('SELECT * FROM events ORDER BY id DESC').fetchall()],
        "projects": [dict(r) for r in conn.execute('SELECT * FROM projects ORDER BY id DESC').fetchall()],
        "achievements": [dict(r) for r in conn.execute('SELECT * FROM achievements').fetchall()],
        "team": [dict(r) for r in conn.execute('SELECT * FROM team').fetchall()],
        "contact": dict(conn.execute('SELECT * FROM contact_config LIMIT 1').fetchone() or {}),
        "gallery": [dict(r) for r in conn.execute('SELECT * FROM gallery').fetchall()],
        "faq": [dict(r) for r in conn.execute('SELECT * FROM faq').fetchall()],
    }
    conn.close()
    return jsonify(data)

@app.route('/api/contact', methods=['POST'])
def api_contact():
    data = request.json
    if not data or not data.get('name') or not data.get('email') or not data.get('message'):
        return jsonify({"error": "All fields required"}), 400
    conn = get_db_connection()
    conn.execute('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', (data['name'], data['email'], data['message']))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.json
    user_msg = data.get("message", "")
    system_prompt = (
        "You are Aira, the AI assistant for GNDECB AIML department (Guru Nanak Dev Engineering College, Bidar). "
        "Be helpful, professional, and concise. Keep responses under 3 sentences unless asked for detail. "
        f"User query: {user_msg}"
    )
    return jsonify({"reply": query_gemini(system_prompt)})

@app.route('/api/generate-description', methods=['POST'])
def api_generate_description():
    data = request.json
    title = data.get("title", "")
    if not title:
        return jsonify({"description": "Please provide a title first."}), 400
    prompt = f"Write a professional, engaging 2-3 sentence description for a college department event/project titled: '{title}'. Be concise and academic."
    return jsonify({"description": query_gemini(prompt)})

@app.route('/api/track/<type>/<int:id>', methods=['POST'])
def track_view(type, id):
    conn = get_db_connection()
    if type == "event":
        conn.execute('UPDATE events SET views = views + 1 WHERE id = ?', (id,))
    elif type == "project":
        conn.execute('UPDATE projects SET views = views + 1 WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# â•â•â• PAGE ROUTES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

# â•â•â• ADMIN ROUTES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        conn = get_db_connection()
        admin = conn.execute('SELECT * FROM admins WHERE username = ?', (request.form['username'],)).fetchone()
        conn.close()
        if admin and check_password_hash(admin['password'], request.form['password']):
            session['admin_logged_in'] = True
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        flash('Invalid credentials.', 'error')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/admin')
@login_required
def dashboard():
    conn = get_db_connection()
    stats = {
        "e": conn.execute('SELECT COUNT(*) FROM events').fetchone()[0],
        "p": conn.execute('SELECT COUNT(*) FROM projects').fetchone()[0],
        "m": conn.execute('SELECT COUNT(*) FROM contacts').fetchone()[0],
        "a": conn.execute('SELECT COUNT(*) FROM achievements').fetchone()[0],
        "t": conn.execute('SELECT COUNT(*) FROM team').fetchone()[0],
    }
    top_e = conn.execute('SELECT * FROM events ORDER BY views DESC LIMIT 3').fetchall()
    conn.close()
    return render_template('dashboard.html', stats=stats, top_events=top_e)

# Home Config
@app.route('/admin/home', methods=['GET', 'POST'])
@login_required
def admin_home():
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('UPDATE home_config SET college_name = ?, tagline = ?, intro = ? WHERE id = 1',
                     (request.form['college_name'], request.form['tagline'], request.form['intro']))
        conn.commit()
        flash('Home configuration updated.', 'success')
    home = conn.execute('SELECT * FROM home_config WHERE id = 1').fetchone()
    conn.close()
    return render_template('admin_home.html', home=home)

# About Config
@app.route('/admin/about', methods=['GET', 'POST'])
@login_required
def admin_about():
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('UPDATE about_config SET description = ?, vision = ? WHERE id = 1',
                     (request.form['description'], request.form['vision']))
        conn.commit()
        flash('About section updated.', 'success')
    about = conn.execute('SELECT * FROM about_config WHERE id = 1').fetchone()
    conn.close()
    return render_template('admin_about.html', about=about)

# Mission Points
@app.route('/admin/mission', methods=['GET', 'POST'])
@login_required
def admin_mission():
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('INSERT INTO mission_points (point) VALUES (?)', (request.form['point'],))
        conn.commit()
        flash('Mission point added.', 'success')
    points = conn.execute('SELECT * FROM mission_points').fetchall()
    conn.close()
    return render_template('admin_mission.html', points=points)

@app.route('/admin/mission/delete/<int:id>')
@login_required
def delete_mission(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM mission_points WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return redirect(url_for('admin_mission'))

# Events CRUD
@app.route('/view-events')
@login_required
def view_events():
    conn = get_db_connection()
    events = conn.execute('SELECT * FROM events ORDER BY id DESC').fetchall()
    conn.close()
    return render_template('view_events.html', events=events)

@app.route('/add-event', methods=['GET', 'POST'])
@login_required
def add_event():
    if request.method == 'POST':
        file = request.files.get('image')
        fname = 'default.jpg'
        if file and file.filename:
            fname = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], fname))
        conn = get_db_connection()
        conn.execute('INSERT INTO events (title, description, image_path) VALUES (?, ?, ?)',
                     (request.form['title'], request.form['description'], fname))
        conn.commit()
        conn.close()
        flash('Event added successfully.', 'success')
        return redirect(url_for('view_events'))
    return render_template('add_event.html')

@app.route('/edit-event/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_event(id):
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('UPDATE events SET title = ?, description = ? WHERE id = ?',
                     (request.form['title'], request.form['description'], id))
        conn.commit()
        flash('Event updated.', 'success')
        return redirect(url_for('view_events'))
    event = conn.execute('SELECT * FROM events WHERE id = ?', (id,)).fetchone()
    conn.close()
    return render_template('edit_event.html', event=event)

@app.route('/delete-event/<int:id>')
@login_required
def delete_event(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM events WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Event deleted.', 'success')
    return redirect(url_for('view_events'))

# Projects CRUD
@app.route('/view-projects')
@login_required
def view_projects():
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects ORDER BY id DESC').fetchall()
    conn.close()
    return render_template('view_projects.html', projects=projects)

@app.route('/add-project', methods=['GET', 'POST'])
@login_required
def add_project():
    if request.method == 'POST':
        conn = get_db_connection()
        conn.execute('INSERT INTO projects (student_name, project_title, description, github_link) VALUES (?, ?, ?, ?)',
                     (request.form['student_name'], request.form['project_title'], request.form['description'], request.form['github_link']))
        conn.commit()
        conn.close()
        flash('Project added successfully.', 'success')
        return redirect(url_for('view_projects'))
    return render_template('add_project.html')

@app.route('/delete-project/<int:id>')
@login_required
def delete_project(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM projects WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Project deleted.', 'success')
    return redirect(url_for('view_projects'))

# Achievements CRUD
@app.route('/view-achievements')
@login_required
def view_achievements():
    conn = get_db_connection()
    ach = conn.execute('SELECT * FROM achievements').fetchall()
    conn.close()
    return render_template('view_achievements.html', achievements=ach)

@app.route('/add-achievement', methods=['GET', 'POST'])
@login_required
def add_achievement():
    if request.method == 'POST':
        conn = get_db_connection()
        conn.execute('INSERT INTO achievements (title, description) VALUES (?, ?)',
                     (request.form['title'], request.form['description']))
        conn.commit()
        conn.close()
        flash('Achievement added.', 'success')
        return redirect(url_for('view_achievements'))
    return render_template('add_achievement.html')

@app.route('/delete-achievement/<int:id>')
@login_required
def delete_achievement(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM achievements WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Achievement deleted.', 'success')
    return redirect(url_for('view_achievements'))

# Team CRUD
@app.route('/view-team')
@login_required
def view_team():
    conn = get_db_connection()
    team = conn.execute('SELECT * FROM team').fetchall()
    conn.close()
    return render_template('view_team.html', team=team)

@app.route('/add-team', methods=['GET', 'POST'])
@login_required
def add_team():
    if request.method == 'POST':
        file = request.files.get('image')
        fname = 'default.jpg'
        if file and file.filename:
            fname = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], fname))
        conn = get_db_connection()
        conn.execute('INSERT INTO team (name, role, image_path) VALUES (?, ?, ?)', (request.form['name'], request.form['role'], fname))
        conn.commit()
        conn.close()
        flash('Team member added.', 'success')
        return redirect(url_for('view_team'))
    return render_template('add_team.html')

@app.route('/delete-team/<int:id>')
@login_required
def delete_team(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM team WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Team member removed.', 'success')
    return redirect(url_for('view_team'))

# Messages
@app.route('/view-messages')
@login_required
def view_messages():
    conn = get_db_connection()
    msgs = conn.execute('SELECT * FROM contacts ORDER BY id DESC').fetchall()
    conn.close()
    return render_template('view_messages.html', messages=msgs)

# Highlights CRUD
@app.route('/admin/highlights', methods=['GET', 'POST'])
@login_required
def admin_highlights():
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('INSERT INTO highlights (point) VALUES (?)', (request.form['point'],))
        conn.commit()
        flash('Highlight added.', 'success')
    highlights = conn.execute('SELECT * FROM highlights').fetchall()
    conn.close()
    return render_template('admin_highlights.html', highlights=highlights)

@app.route('/admin/highlights/delete/<int:id>')
@login_required
def delete_highlight(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM highlights WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Highlight removed.', 'success')
    return redirect(url_for('admin_highlights'))

# Contact Config
@app.route('/admin/contact', methods=['GET', 'POST'])
@login_required
def admin_contact():
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('UPDATE contact_config SET address = ?, email = ?, phone = ?, map_location = ? WHERE id = 1',
                     (request.form['address'], request.form['email'], request.form['phone'], request.form['map_location']))
        conn.commit()
        flash('Contact info updated.', 'success')
    contact = conn.execute('SELECT * FROM contact_config WHERE id = 1').fetchone()
    conn.close()
    return render_template('admin_contact.html', contact=contact)

# Gallery CRUD
@app.route('/admin/gallery', methods=['GET', 'POST'])
@login_required
def admin_gallery():
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('INSERT INTO gallery (url, caption) VALUES (?, ?)', (request.form['url'], request.form['caption']))
        conn.commit()
        flash('Gallery image added.', 'success')
    gallery = conn.execute('SELECT * FROM gallery ORDER BY id DESC').fetchall()
    conn.close()
    return render_template('admin_gallery.html', gallery=gallery)

@app.route('/admin/gallery/delete/<int:id>')
@login_required
def delete_gallery(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM gallery WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Gallery image removed.', 'success')
    return redirect(url_for('admin_gallery'))

# FAQ CRUD
@app.route('/admin/faq', methods=['GET', 'POST'])
@login_required
def admin_faq():
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('INSERT INTO faq (question, answer) VALUES (?, ?)', (request.form['question'], request.form['answer']))
        conn.commit()
        flash('FAQ added.', 'success')
    faq = conn.execute('SELECT * FROM faq ORDER BY id DESC').fetchall()
    conn.close()
    return render_template('admin_faq.html', faq=faq)

@app.route('/admin/faq/delete/<int:id>')
@login_required
def delete_faq(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM faq WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('FAQ deleted.', 'success')
    return redirect(url_for('admin_faq'))

# Edit Project
@app.route('/edit-project/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_project(id):
    conn = get_db_connection()
    if request.method == 'POST':
        conn.execute('UPDATE projects SET student_name = ?, project_title = ?, description = ?, github_link = ? WHERE id = ?',
                     (request.form['student_name'], request.form['project_title'], request.form['description'], request.form['github_link'], id))
        conn.commit()
        flash('Project updated.', 'success')
        return redirect(url_for('view_projects'))
    project = conn.execute('SELECT * FROM projects WHERE id = ?', (id,)).fetchone()
    conn.close()
    return render_template('edit_project.html', project=project)


@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join('.', path)):
        return send_from_directory('.', path)
    return "404 — Page not found", 404

# â•â•â• RUN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
if __name__ == '__main__':
    app.run(debug=True, port=5000)
