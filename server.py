import os
import cv2
import json
from flask import Flask
from flask import request
from flask_cors import CORS
from flask.helpers import safe_join

from werkzeug.utils import secure_filename,send_from_directory

from Node_detection2 import node_main

static = safe_join(os.path.dirname(__file__), 'static')


model_path = './best.pt' 

app = Flask(__name__)


CORS(app)

def ctodict(component):
   
    return {"type":int(component.typ),"nodes":list(map(int,component.nodes)),"coords":list(map(int,component.coord))}


@app.route("/process_image",methods=['GET', 'POST'])
def process_image():
    if request.method == "POST":
        f = request.files['image']
        image = f"uploads/{secure_filename(f.filename)}"
        f.save(image)
        image2 = cv2.imread(image)
        image2 = cv2.resize(image2,(640,640))
        cv2.imwrite(image,image2)
        components =  node_main(image,model_path)
        components = list(map(ctodict,components))
        return json.dumps(components)


    return "OK"


@app.route("/static/<path:path>")
def serve(path):
    return send_from_directory("static",path,envron=os.environ)

@app.route("/")
def hi():
    return send_from_directory(directory= static,path="upload.html")

app.run(host="0.0.0.0",port=8080)