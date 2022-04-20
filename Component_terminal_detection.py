import cv2
import torch
import numpy as np

results1 = None
model_loaded = False

def load_model(img_path):      
    # loads the yolov5 model weights that we have trained

    return torch.hub.load('ultralytics/yolov5', 'custom', path=img_path, force_reload=False )

def binary_image(img):                                                                           
    # returns the binary image

    grey_img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    binary_img = cv2.threshold(grey_img, 120, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    
    return binary_img

def bounding_box(img, bb_result):                                                                 
    # returns the binary image of bounding boxes of the circuit components 

    bb_img = np.zeros(img.shape)
    for i in range(len(bb_result)):
        x1, y1, x2, y2 = bb_result[i][:4]
        bb_img = cv2.rectangle(bb_img, (x1, y1), (x2, y2), (255, 255, 255), 2)
    
    return bb_img
    
def terminal_points(binary_img, bb_img, bb_result):                                                
    # returns terminal - contains the bounding box points ,terminal points of the components and their class and also returns a list of terminal points
                                                                                                   
    terminal_points_img = cv2.bitwise_and(bb_img, bb_img, mask=binary_img)                         # gives the terminal points image of the components
    contours, hierarchy = cv2.findContours(terminal_points_img[:, :, 0].astype('uint8'), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    termi_points = []                                                                                                                                                         
    for i in contours:
        M = cv2.moments(i)
        if M['m00'] != 0:
            cx = int(M['m10']/M['m00'])
            cy = int(M['m01']/M['m00'])
            termi_points.append([cx, cy])

    
    terminal = []
    for i in range(len(bb_result)):
        a = []
        bb = bb_result[i][:4]
        a.append(list(bb))
  

        for j in range(len(termi_points)):
            if(termi_points[j][0] in bb or termi_points[j][1] in bb):

                if(termi_points[j][0] >= bb[0] and termi_points[j][0] <= bb[2] and termi_points[j][1] >= bb[1] and termi_points[j][1] <= bb[3]):
                    a.append(termi_points[j])
        a.append(bb_result[i][-1])
        terminal.append(a)
    return terminal,termi_points

def b_image(terminal_points, binary_img, bb_result): 
    #returns the circuit with the components removed                                                  
    
    for i in range(len(bb_result)):
        x1, y1, x2, y2 = bb_result[i][:4]
        b_img = cv2.rectangle(binary_img, (x1+3, y1+3), (x2-3, y2-3), (0, 0, 0), -1)
    
    for k in range(len(terminal_points)):
        x = terminal_points[k][0]
        y = terminal_points[k][1]
        b_img = cv2.circle(binary_img, (x, y), 5, (255, 0, 0), -1)
        
    return b_img


def terminal_main(img,model_path):
    global results1
    global model_loaded
    imgs = []
    img = cv2.imread(img)[..., ::-1]
    imgs.append(img)
    if(not model_loaded): # Load model only once
        print("Loading model...")
        results1 = load_model(model_path)
        print("Done")
        model_loaded = True
    results = results1(img,size=640)
    bb_result = results.xyxy[0].detach().cpu().numpy().astype(np.int)

    binary_img = binary_image(img)
    bb_img = bounding_box(img,bb_result)
    terminal,terminal_Points = terminal_points(binary_img, bb_img, bb_result)
    b_img = b_image(terminal_Points,binary_img,bb_result)

    return terminal,terminal_Points,b_img




