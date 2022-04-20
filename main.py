import Component_terminal_detection
import Node_detection
import cv2
img = './test_images/c213.jpg'
model_path = './best.pt' 

ori_img = cv2.imread(img)
terminal,binary_img,terminal_points = Component_terminal_detection.terminal_main(img,model_path)
value_list = []
for i in range(len(terminal)):
    a,b,c,d = terminal[i][0]
    ori_img_copy = cv2.rectangle(ori_img.copy(),(a,b),(c,d),(0,255,0),2)
 
    cv2.imshow("img",ori_img_copy)
    cv2.waitKey(1000)
    value_list.append(input("enter value of respective component : "))
print(Node_detection.node_main(img,model_path,value_list))
