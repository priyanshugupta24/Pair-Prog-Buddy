import React, { useLayoutEffect,useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'

const generator = rough.generator();

function WhiteBoard({ socket }) {
    const [elements,setElements] = useState([]);
    const [action,setAction] = useState("none");
    const [tool,setTool] = useState("line");
    const [selectedElement,setSelectedElement] = useState(null);

    useLayoutEffect(()=>{
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);

        const roughCanvas = rough.canvas(canvas);
       elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
    },[elements]);

    socket.on("mouseDownDraw",({id,clientX,clientY,type,elements})=>{
        setElements(elements);
    });
    socket.on("mouseMoveDraw",({clientX,clientY,type,index,elements})=>{
        setElements(elements);
    });
    socket.on("mouseDownSelect",({offsetX,offsetY,element})=>{
        setSelectedElement({...element,offsetX,offsetY});
    });
    socket.on("mouseMoveSelect",({id,newX,newY,height,width,type})=>{
        updateElement(id,newX,newY,newX + width,newY + height,type)
    });

    const createElement = (id,x1,y1,x2,y2,type)=>{
        // console.log("Creating element")
        const roughElement = type === "line"?generator.line(x1,y1,x2,y2):generator.rectangle(x1,y1,x2-x1,y2-y1);
        return {id,x1,y1,x2,y2,type,roughElement};
    }
    const distance = (a,b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    const isWithinElement = (x,y,element) => {
        const { x1,x2,y1,y2,type } = element;
        if(type === "rectangle"){
            const minX = Math.min(x1,x2);
            const maxX = Math.max(x1,x2);
            const minY = Math.min(y1,y2);
            const maxY = Math.max(y1,y2);
            return x>=minX && x<=maxX && y>=minY && y<=maxY;
        }
        else if(type === "line"){
            // https://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line/17693146#17693146
            const a = {x:x1,y:y1};
            const b = {x:x2,y:y2};
            const c = {x,y};
            const offset = distance(a,b) - (distance(a,c)+distance(b,c));
            return Math.abs(offset)<1;
        }
    }
    const getElementAtPosition = (x,y,elements) =>{
        return elements.find(element => isWithinElement(x,y,element));
    }
    const handleMouseDown = async(event) => {
        const {clientX,clientY} = event;
        if(tool === "selection"){
            const element = getElementAtPosition(clientX,clientY,elements);
            if(element){
                const offsetX = clientX - element.x1;
                const offsetY = clientY - element.y1;
                socket.emit("mouseDownSelect",{offsetX,offsetY,element});
                setSelectedElement({...element,offsetX,offsetY});
                setAction("moving");
            }
        }
        else{
            const type = tool;
            const id = elements.length;
            const element = createElement(id,clientX,clientY,clientX,clientY,tool);
            setElements((prevState) => [...prevState,element]);
            setAction("drawing");
            socket.emit("mouseDownDraw",{id,clientX,clientY,type,elements});
        }
    }
    const updateElement = (id,x1,y1,x2,y2,type) =>{
        const updatedElement = createElement(id,x1,y1,x2,y2,type);

        const elemntsCopy = [...elements]; 
        elemntsCopy[id] = updatedElement;
        setElements(elemntsCopy);
    } 
    const handleMouseMove = (event) => {
        const {clientX,clientY} = event;
        if(tool === "selection")event.target.style.cursor = getElementAtPosition(clientX,clientY,elements)?"move":"default";
        if(action==="drawing"){
            const type = tool;
            const index = elements.length - 1;
            const { x1,y1 } = elements[index];
            
            updateElement(index,x1,y1,clientX,clientY,tool);
            socket.emit("mouseMoveDraw",{clientX,clientY,type,index,elements});
        }
        else if(action === "moving"){
            const { id,x1,y1,x2,y2,type,offsetX,offsetY } = selectedElement;
            const width = x2 - x1;
            const height = y2 - y1; 
            const newX = clientX - offsetX;
            const newY = clientY - offsetY;
            updateElement(id,newX,newY,newX + width,newY + height,type)
            socket.emit("mouseMoveSelect",{id,newX,newY,height,width,type});
            
        }
    }
    const handleMouseUp = (event) => {
        setAction("none");
        setSelectedElement(null);
    }
    return (
        <div>
            <div>
                <div>
                    <input type="radio" id="selection" checked={tool === "selection"} onChange={()=>{setTool("selection")}}/>
                    <label htmlFor="selection">Selection</label>
                    <input type="radio" id="line" checked={tool === "line"} onChange={()=>{setTool("line")}}/>
                    <label htmlFor="line">Line</label>
                    <input type="radio" id="rectangle" checked={tool === "rectangle"} onChange={()=>{setTool("rectangle")}}/>
                    <label htmlFor="rectangle">Rectangle</label>
                </div>
                <canvas id="canvas" 
                    style={{ backgroundColor: "blue" }} 
                    width={0.9 * window.innerWidth} 
                    height={0.87 * window.innerHeight}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >Canvas</canvas>
            </div>
            <button onClick={() => { socket.emit("test", "This is a test message") }}>Send</button>
            <button onClick={()=>console.log(elements)}>getEle</button>
        </div>
    )
}

export default WhiteBoard