# CVSpice

CVSpice is an electric circuit solver with the difference that, instead of manually dragging and dropping components in a spice software you can instead give it the image of a circuit diagram and it will solve the circuit.

This project was made in collaboration with CVI Club, Center For Innovation, IITM as a Student Innovation Project

**REQUIREMENTS**<br />
Please install Yolov5 and its requirements from https://github.com/ultralytics/yolov5<br />
Then install Flask

1) Run server.py
2) Visit http://localhost:8080/static/circuit.html




**My contributions to the project** :
1. Developed a novel algorithm based on Breadth First Search to do mapping from component terminals to electrical voltage nodes
2. Developed the GUI which renders the circuit using the draw2d JS library based on the obtained circuit netlist
