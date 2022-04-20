# CVSpice

1) Open the main.py file
2) Give the image path that you want to test (img = './test_images/18tp.png', image 18tp.png is in test_image folder is choosen defualt)
3) Run the file and it would ask for the component values showing the bounding box around the respective component in the circuit
4) After getting all component values from user it gives a circuit netlist containing the details of class, the nodes between which it is connected and value of the component

**INPUT IMAGE**

![18tp](https://user-images.githubusercontent.com/81910116/154052167-63934bb8-7120-417e-ab30-3dbdb5d58405.png)


**OUTPUT**<br/>
CVSpice Netlist for the given circuit: <br/>
V1 0 2 20 <br/>
L2 0 1 14 <br/>
R3 3 2 10 <br/>
C4 0 1 13 <br/>
C5 1 3 12 <br/>

**X N1 N2 V**<br/>
X - Component<br/>
N1 - 1st node component is connected to<br/>
N2 - 2nd node component is connected to<br/>
V - Value of the component<br/>

