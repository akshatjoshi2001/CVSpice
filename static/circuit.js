var canvas;
function solveClickHandle(desc,labels,targets)
{
    values = [];
    for(let i=0;i<labels.length;i+=1)
    {
        values.push(parseFloat(labels[i].getText()));
    }
    let solutionObj = solveCircuit(desc,values);
    let voltages = solutionObj.solution;
    let posToNodeId = solutionObj.posToNodeId;
    let nodeCount = solutionObj.nodeCount;

    for(let i=1;i<nodeCount;i+=1)
    {
        
        targets[posToNodeId[i]].setText(voltages[i-1].toString());
    }

    
}

function solveCircuit(desc,values)
{
    let nodeSet = new Set();
    let voltageSources = 0;
    vSourceToPos = {};
    let nodeIdToPos = {}
    let posToNodeId = {}
    for(let i=0;i<desc.length;i++)
    {
        if(!nodeSet.has(desc[i].nodes[0]))
        {
            nodeIdToPos[desc[i].nodes[0]] = nodeSet.size;
            posToNodeId[nodeSet.size] = desc[i].nodes[0]
            nodeSet.add(desc[i].nodes[0]);

        }
        if(!nodeSet.has(desc[i].nodes[1]))
        {
            nodeIdToPos[desc[i].nodes[1]] = nodeSet.size;
            posToNodeId[nodeSet.size] = desc[i].nodes[1]
            nodeSet.add(desc[i].nodes[1]);

        }    
    }

    for(let i=0;i<desc.length;i+=1)
    {
        if(desc[i].type == 3 || desc[i].type==2)
        {
            vSourceToPos[i] = nodeSet.size+voltageSources;
            voltageSources+=1;
        }
    }

    let dim = nodeSet.size + voltageSources;
    console.log(dim);
    let M = new Array(dim).fill(0.0).map(() => new Array(dim).fill(0.0));
    let b = new Array(dim).fill(0.0)
    for(let i=0;i<desc.length;i++)
    {
        if(desc[i].type == 0)
        {
            M[nodeIdToPos[desc[i].nodes[0]]][nodeIdToPos[desc[i].nodes[0]]] += 1/values[i];
            M[nodeIdToPos[desc[i].nodes[0]]][nodeIdToPos[desc[i].nodes[1]]] += -1/values[i];
            M[nodeIdToPos[desc[i].nodes[1]]][nodeIdToPos[desc[i].nodes[1]]] += 1/values[i];
            M[nodeIdToPos[desc[i].nodes[1]]][nodeIdToPos[desc[i].nodes[0]]] += -1/values[i];            
            
            //console.log( M[nodeIdToPos[desc[i].nodes[0]]][nodeIdToPos[desc[i].nodes[0]]] )

        }
        else if(desc[i].type == 2)
        { // Current from  0 to  1
            M[nodeIdToPos[desc[i].nodes[0]]][vSourceToPos[i]]  = 1;
            M[nodeIdToPos[desc[i].nodes[1]]][vSourceToPos[i]]  = -1;
            M[vSourceToPos[i]][nodeIdToPos[desc[i].nodes[0]]] = +1;
            M[vSourceToPos[i]][nodeIdToPos[desc[i].nodes[1]]] = -1;
            b[vSourceToPos[i]] = 0;
            

        }
        else if(desc[i].type == 3)
        {
            // 0 is +, 1 is -
            M[nodeIdToPos[desc[i].nodes[0]]][vSourceToPos[i]]  = 1;
            M[nodeIdToPos[desc[i].nodes[1]]][vSourceToPos[i]]  = -1;
            M[vSourceToPos[i]][nodeIdToPos[desc[i].nodes[0]]] = +1;
            M[vSourceToPos[i]][nodeIdToPos[desc[i].nodes[1]]] = -1;
            b[vSourceToPos[i]] = values[i];
            

        }
        else if(desc[i].type == 4)
        {
         // Current flows from 0 to 1
            b[nodeIdToPos[desc[i].nodes[0]]] = -values[i];
            b[nodeIdToPos[desc[i].nodes[1]]] = values[i];
        }
        
        
    }
    M.splice(0,1);
    b.splice(0,1);
    M.map((arr)=>arr.splice(0,1));
    
    console.log(M);
    console.log(b);
    M = math.matrix(M);
    b = math.matrix(b);

    return {nodeCount:nodeSet.size,dim:dim,solution:math.multiply(math.inv(M),b)._data,posToNodeId:posToNodeId};


}

function getImage(type)
{
   
    switch(type)
    {
        case 0:
            return "resistor.png";
        case 1:
            return "capacitor.jpg";
        case 2:
            return "inductor.png";
        case 3:
            return "voltage_source.png";
        default:
            return "current_source.png"; 
    }
}

function getUnit(type)
{
    switch(type)
    {
        case 0:
            return "Ω";
        case 1:
            return "F";
        case 2:
            return "H";
        case 3:
            return "V";
        default:
            return "A"; 
    }

}

function getCompObject(type,x,y)
{
    let obj = new draw2d.shape.basic.Image({path:getImage(type), width:100, height:60, x:x, y:y});
    var inputLocator  = new draw2d.layout.locator.InputPortLocator();
    var outputLocator = new draw2d.layout.locator.OutputPortLocator();
    
    obj.createPort("hybrid",inputLocator);
    obj.createPort("hybrid",outputLocator);
    return obj;
}


function drawCircuit(desc,canvas)
{
    
    canvas.clear();

    let createConnection=function(){
    let con = new draw2d.Connection();
    con.setRouter(new draw2d.layout.connection.CircuitConnectionRouter());
    return con;
    };
    // install a custom connection create policy
    //
    canvas.installEditPolicy(  new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: createConnection
    }));

 
  
    var nodeSet = new Set();
    var nodeToDraw2d = {};
    var nodeToTerminal = {};
    let components = [];
    let labels = [];
    let nodeToLabel = {};
 
    let nodeCnt = {}; 
    for(let i=0;i<desc.length;i++)
    {
        
        let x=100*desc[i].nodes[0]+40;
        if(nodeCnt.hasOwnProperty(desc[i].nodes[0]))
        {
            nodeCnt[desc[i].nodes[0]]+=1;
        }
        else{
            nodeCnt[desc[i].nodes[0]]=0;
        }
       

        
        
        let y=100*nodeCnt[desc[i].nodes[0]]+30*desc[i].nodes[0]+40;
        console.log(x);
        console.log(y);


        let grp = new draw2d.shape.composite.Group();
       let component = getCompObject(desc[i].type,x,y);
       let label = new draw2d.shape.basic.Label({text: "0",x:x,y:y+70});
       label.installEditor(new draw2d.ui.LabelInplaceEditor({
           onCommit:(val)=>{}

       }));
       labels.push(label);
       let unitLabel = new draw2d.shape.basic.Label({text: getUnit(desc[i].type),x:x+20,y:y+70});
       
       if(!nodeToLabel.hasOwnProperty(desc[i].nodes[0]))
       {
            let label0 = new draw2d.shape.basic.Label({text: "0",x:x-10,y:y});
            nodeToLabel[desc[i].nodes[0]] = label0;
            grp.assignFigure(label0);
            canvas.add(label0);
       }
       if(!nodeToLabel.hasOwnProperty(desc[i].nodes[1]))
       {
            let label1 = new draw2d.shape.basic.Label({text: "0",x:x+100,y:y});
            nodeToLabel[desc[i].nodes[1]] = label1;
            grp.assignFigure(label1);
            canvas.add(label1);
       }
       
       grp.assignFigure(component);
       grp.assignFigure(label);
       grp.assignFigure(unitLabel);

       component.userData = desc[i];
       nodeToTerminal[desc[i].nodes[0]] = component.getHybridPort(0);
       nodeToTerminal[desc[i].nodes[1]] = component.getHybridPort(1);
       
       components.push(component);
       

        canvas.add(component);
        canvas.add(label);
        canvas.add(unitLabel);
        canvas.add(grp);

       
    
    }

    for(let i=0;i<desc.length;i++)
    {
        let p0 = nodeToTerminal[desc[i].nodes[0]];
        let p1 = nodeToTerminal[desc[i].nodes[1]];
        let s0 = components[i].getHybridPort(0);
        let s1 = components[i].getHybridPort(1);
        
        let c1 = createConnection();
        c1.setSource(s0); 
       
        let c2 = createConnection();
        c2.setSource(s1);        
        c1.setTarget(p0);
        c2.setTarget(p1);        
        canvas.add(c1);
        canvas.add(c2);
        
    }
    document.getElementById("solve").addEventListener("click",()=>{
            solveClickHandle(desc,labels,nodeToLabel);
        });
   
}

function init()
{
    canvas = new draw2d.Canvas("gfx_holder");
}


    function getCircuit()
    {
        document.getElementById("loading").style.display="block";
        document.getElementById("gfx_holder").style.visibility="hidden";
        var host = window.location.protocol + "//" + window.location.host;
        file = document.getElementById("image").files[0];
        let formData = new FormData();
        formData.append("image", file);
        fetch(host+'/process_image', {method: "POST", body: formData}).then((res)=>{
            res.json().then((obj)=>{drawCircuit(obj,canvas)});
            document.getElementById("loading").style.display="none";
            document.getElementById("gfx_holder").style.visibility="visible";
        });
    }
