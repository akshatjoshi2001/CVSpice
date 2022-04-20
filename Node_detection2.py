import Component_terminal_detection
from collections import deque


def bfs(bin_img,tpoints):

  visited = {}
  q = deque()
  node = 0
  nodemap = {}
  for i in range(0,len(tpoints)):
    if (tpoints[i][0],tpoints[i][1]) in visited:
      continue
    q.append((tpoints[i][0],tpoints[i][1],node))
    
    visited[(tpoints[i][0],tpoints[i][1])] = True
    dirx = [-1,1,0,0,-1,1,-1,1]
    diry = [0,0,-1,1,-1,1,1,-1]
    while q:
      point = q.popleft()
      nodemap[(point[0],point[1])] = node
      
      for j in range(0,len(dirx)):
        newpoint = (point[0]+dirx[j],point[1]+diry[j],node)
        
        if(newpoint[0]>=0 and newpoint[0]<bin_img.shape[0] and newpoint[1]>=0 and newpoint[1]<bin_img.shape[1] and ((newpoint[0],newpoint[1]) not in visited) and bin_img[newpoint[1]][newpoint[0]]==255):
         
          visited[(newpoint[0],newpoint[1])] = True
          q.append(newpoint)
    node+=1

  return nodemap

def genNetlist(components):

  netl = "CVSpice Netlist for the given circuit: \n"
  id = 0
  for i in range(len(components)):
    c = components[i][0]
    ctyp ="R"
    if c.typ == 1:
      ctyp="C"
    if c.typ == 2:
      ctyp="L"
    if c.typ ==3:
      ctyp="V"
    if c.typ ==4:
      ctyp="I"
    id+=1
    netl += ctyp+str(id)+" "+str(c.nodes[0])+" " + str(c.nodes[1])+" "+ str(components[i][1]) + "\n"

  return netl

def node_main(img,model_path):

    terminal,terminal_points, binary_img = Component_terminal_detection.terminal_main(img,model_path)
    nodemap = bfs(binary_img,terminal_points)

    for coord in nodemap:
        binary_img[coord[1]][coord[0]] = 80

    
    class Component:
        def __init__(self,typ,coord):
            self.typ = typ.copy()
            self.nodes = []
            self.coord = coord.copy()
        def setnodes(self,node2):
            self.nodes = node2.copy()
        
    components = []
    for i in range(len(terminal)):

      term=terminal[i]
      coord = term[0]
      nodes = []
      typ = term[len(term)-1]
      for j in range(1,len(term)-1):
          nodes.append(nodemap[(term[j][0],term[j][1])])
      c = Component(typ,coord)
      #print("check",nodes)
      c.setnodes(nodes)
      components.append(c)
    # Remove bad nodes
    nodecnt = {}
    for c in components:
      for n in c.nodes:
        if n in nodecnt:
          nodecnt[n]+=1
        else:
          nodecnt[n]=1
    for c in components:
      newnodes = []
      for n in c.nodes:
        if nodecnt[n]!=1:
          newnodes.append(n)
      newnodes.sort()
      c.nodes = newnodes
      #print(newnodes)
      

    return components