from flask import Flask, render_template, request, Response
from http import HTTPStatus
from utils import load, generate

application = Flask(__name__)
application.config['STATIC_FOLDER'] = 'static'

@application.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@application.route('/load', methods=['POST'])
def load_controller():
    status, data = load(request.form.get('url'))
    if status == 'error':
        return Response(data, status=HTTPStatus.BAD_REQUEST)
    response = Response()
    response.set_cookie('name_space', data)
    return response

@application.route('/generate', methods=['POST'])
def generate_controller():
    prompt = request.form.get('prompt')
    model = request.form.get('model')
    name_space = request.cookies.get('name_space')
    if not name_space:
        return Response("Please load a video first", status=HTTPStatus.BAD_REQUEST)
    return Response(generate(model, name_space, prompt))

if __name__ == '__main__':
    application.run(debug=True,  threaded=True)