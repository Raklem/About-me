from flask import Flask, send_from_directory, render_template, redirect, request
import os

app = Flask(__name__)

# List of allowed email domains
ALLOWED_DOMAINS = [
    'university.edu',
    'student.edu',
    'campus.org'
]

@app.route('/')
def home():
    # Redirect to login page
    return redirect('/login.html')

@app.route('/login.html')
def login():
    return send_from_directory('static', 'login.html')

@app.route('/index.html')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
