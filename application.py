from flask import Flask, render_template, request, session, jsonify, Response, make_response
from utils import load, generate
import os

application = Flask(__name__)
application.config['STATIC_FOLDER'] = 'static'
application.config['PERMANENT_SESSION_LIFETIME'] = 86400
application.secret_key = os.urandom(64).hex()

@application.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@application.route('/load', methods=['POST'])
def load_controller():
    session['url'] = request.form.get('url')
    status, data = load(session['url'])
    if status == 'error':
        return jsonify({'status': status, 'message': data})
    elif status == 'success':
        session['name_space'] = data
        return jsonify({'status': status})

@application.route('/generate', methods=['POST'])
def generate_controller():
    session['prompt'] = request.form.get('prompt')
    session['model'] = request.form.get('model')
    if not session.get('name_space', ''):
        response = make_response()
        response.status = "400 Please load a video first"
        return response
    return Response(generate(session['model'], session['name_space'], session['prompt']), content_type='text/plain')


if __name__ == '__main__':
    application.run(debug=True,  threaded=True)