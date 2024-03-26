import React, { useLayoutEffect, useState,useEffect } from 'react'
import rough from 'roughjs/bundled/rough.esm'
import { getStroke } from 'perfect-freehand'
import grid from "../../assets/grid.jpg"
import "./WhiteBoard.css"
const generator = rough.generator();

function WhiteBoard({ socket }) {
    const [elements, setElements] = useState([]);
    const [action, setAction] = useState("none");
    const [tool, setTool] = useState("pencil");
    const [selectedElement, setSelectedElement] = useState(null);

    useEffect(() => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = 0.8 * window.innerWidth;
            canvas.height = 0.7 * window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    useLayoutEffect(() => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const roughCanvas = rough.canvas(canvas);
        elements.forEach(element => drawElement(roughCanvas, ctx, element));
    }, [elements]);

    socket.on("mouseDownDraw", ({ id, clientX, clientY, type, elements }) => {
        setElements(elements);
    });
    socket.on("mouseMoveDraw", ({ clientX, clientY, type, index, elements }) => {
        setElements(elements);
    });
    socket.on("mouseDownSelect", ({ offsetX, offsetY, element }) => {
        setSelectedElement({ ...element, offsetX, offsetY });
    });
    socket.on("mouseMoveSelect", ({ id, newX, newY, height, width, type }) => {
        updateElement(id, newX, newY, newX + width, newY + height, type)
    });
    socket.on("clearCanvas",({msg})=>{
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setElements([]);
    })

    const average = (a, b) => (a + b) / 2

    function getSvgPathFromStroke(points, closed = true) {
        const len = points.length

        if (len < 4) {
            return ``
        }

        let a = points[0]
        let b = points[1]
        const c = points[2]

        let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
            2
        )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
            b[1],
            c[1]
        ).toFixed(2)} T`

        for (let i = 2, max = len - 1; i < max; i++) {
            a = points[i]
            b = points[i + 1]
            result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
                2
            )} `
        }

        if (closed) {
            result += 'Z'
        }

        return result
    }
    const drawElement = (roughCanvas, context, element) => {
        switch (element.type) {
            case "line":
            case "rectangle":
                roughCanvas.draw(element.roughElement);
                break;
            case "pencil":
                const outlinePoints = getStroke(element.points,{
                    size : 8
                })
                const pathData = getSvgPathFromStroke(outlinePoints)
                const myPath = new Path2D(pathData)
                context.fill(myPath);
                break;
            default:
                throw new Error(`Type Not Recgnized  ${element.type}`)
        }
    }
    const createElement = (id, x1, y1, x2, y2, type) => {
        // console.log("Creating element") 
        switch (type) {
            case "line":
            case "rectangle":
                // Fill And Stroke   
                // Rectangle => fillStyle,fillWeight,roughness,stroke,strokeWidth
                // Line => fillStyle,stroke,strokeWidth
                const roughElement = type === "line" ? generator.line(x1, y1, x2, y2) : generator.rectangle(x1, y1, x2 - x1, y2 - y1,{"fill":"red","stroke":"green","strokeWidth":3,"fillStyle":"solid"});
                return { id, x1, y1, x2, y2, type, roughElement };
            case "pencil":
                return { id, type, points: [{ x: x1, y: y1 }] };
            default:
                throw new Error(`Type Not Recognised ${type}`)
        }
    }
    const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    const isWithinElement = (x, y, element) => {
        const { x1, x2, y1, y2, type } = element;
        if (type === "rectangle") {
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }
        else if (type === "line") {
            // https://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line/17693146#17693146
            const a = { x: x1, y: y1 };
            const b = { x: x2, y: y2 };
            const c = { x, y };
            const offset = distance(a, b) - (distance(a, c) + distance(b, c));
            return Math.abs(offset) < 1;
        }
    }
    const getElementAtPosition = (x, y, elements) => {
        return elements.find(element => isWithinElement(x, y, element));
    }
    const handleMouseDown = async (event) => {
        const { clientX, clientY } = event;
        if (tool === "selection") {
            const element = getElementAtPosition(clientX, clientY, elements);
            if (element) {
                const offsetX = clientX - element.x1;
                const offsetY = clientY - element.y1;
                socket.emit("mouseDownSelect", { offsetX, offsetY, element });
                setSelectedElement({ ...element, offsetX, offsetY });
                setAction("moving");
            }
        }
        else {
            const type = tool;
            const id = elements.length;
            const element = createElement(id, clientX-3, clientY-90, clientX-3, clientY-90, tool);
            setElements((prevState) => [...prevState, element]);
            setAction("drawing");
            socket.emit("mouseDownDraw", { id, clientX, clientY, type, elements });
        }
    }
    const updateElement = (id, x1, y1, x2, y2, type) => {
        const elemntsCopy = [...elements];
        switch (type){
            case "line":
            case "rectangle":
                const updatedElement = createElement(id, x1, y1, x2, y2, type);
                elemntsCopy[id] = updatedElement;
                break;
                case "pencil":
                    elemntsCopy[id].points = [...elemntsCopy[id].points,{x:x2,y:y2}];
                    break;
                default:
                    throw new Error(`Type not Recognized ${type}`)
        }
        setElements(elemntsCopy); 
    }
    const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        if (tool === "selection") event.target.style.cursor = getElementAtPosition(clientX, clientY, elements) ? "move" : "default";
        if (action === "drawing") {
            const type = tool;
            const index = elements.length - 1;
            const { x1, y1 } = elements[index];

            updateElement(index, x1, y1, clientX-3, clientY-90, tool);
            socket.emit("mouseMoveDraw", { clientX, clientY, type, index, elements });
        }
        else if (action === "moving") {
            const { id, x1, y1, x2, y2, type, offsetX, offsetY } = selectedElement;
            const width = x2 - x1;
            const height = y2 - y1;
            const newX = clientX - offsetX;
            const newY = clientY - offsetY;
            updateElement(id, newX, newY, newX + width, newY + height, type)
            socket.emit("mouseMoveSelect", { id, newX, newY, height, width, type });
        }
    }
    const handleMouseUp = (event) => {
        setAction("none");
        setSelectedElement(null);
    }
    const handleClearCanvas = () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setElements([]);
        socket.emit("clearCanvas","Clear The Canvas");
    }
    return (
        <div>
            <div>
                <div>
                    <input type="radio" id="selection" checked={tool === "selection"} onChange={() => { setTool("selection") }} />
                    <label htmlFor="selection"><span className="radio">Selection</span></label>
                    <input type="radio" id="line" checked={tool === "line"} onChange={() => { setTool("line") }} />
                    <label htmlFor="line"><span className="radio">Line</span></label>
                    <input type="radio" id="pencil" checked={tool === "pencil"} onChange={() => { setTool("pencil") }} />
                    <label htmlFor="pencil"><span className="radio">Pencil</span></label>
                    <input type="radio" id="rectangle" checked={tool === "rectangle"} onChange={() => { setTool("rectangle") }} />
                    <label htmlFor="rectangle"><span className="radio">Rectangle</span></label>
                    <button onClick={handleClearCanvas}>Clear Canvas</button>
                </div>
                <div>
                    <canvas id="canvas"
                        className = "box"
                        style={{ 
                            backgroundColor: "white",
                            backgroundImage:`url(${grid})`,
                            borderRadius:"2vw"
                        }}
                        // width={0.8*window.innerWidth}
                        // height={window.innerHeight}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                    >Canvas</canvas>
                </div>
            </div>
            {/* <button onClick={() => { socket.emit("test", "This is a test message") }}>Send</button>
            <button onClick={() => console.log(elements)}>getEle</button> */}
        </div>
    )
}

export default WhiteBoard