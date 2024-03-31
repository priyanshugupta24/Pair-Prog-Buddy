import React, { useLayoutEffect, useState, useEffect } from 'react'
import rough from 'roughjs/bundled/rough.esm'
import { getStroke } from 'perfect-freehand'
import grid from "../../assets/grid.jpg"
import "./WhiteBoard.css"
import axios from 'axios';

const generator = rough.generator();

function WhiteBoard({ socket,uniqueId }) {
    const [elements, setElements] = useState([]);
    const [action, setAction] = useState("none");
    const [tool, setTool] = useState("pencil");
    const [selectedElement, setSelectedElement] = useState(null);
    const [commit, setCommit] = useState(false);
    const [fillcolor, setFillColor] = useState("#FFFFFF");
    const [strokecolor, setStrokeColor] = useState("#000000");
    const [eleWidth, setEleWidth] = useState(8);
    const [fillstyle, setFillStyle] = useState("solid");


    window.addEventListener("keydown", function(event) {
        if (event.altKey && event.key === "s") {
        //   event.preventDefault();
          saveElements();
          console.log("Saved!!");
        }
    });

    useEffect(() => {
        const resizeElements = () => {
            const canvas = document.getElementById('canvas');
            const toolbar = document.getElementById('toolbar');

            const windowWidth = window.innerWidth;
            const windowHeight = 0.67 * window.innerHeight;

            // canvas.style.marginLeft = 0.01 * window.innerHeight;
            canvas.width = 0.77 * windowWidth;
            canvas.height = windowHeight;

            toolbar.style.width = '20%';
            toolbar.style.height = `${windowHeight}px`;
        };

        resizeElements();

        window.addEventListener('resize', resizeElements);

        return () => {
            window.removeEventListener('resize', resizeElements);
        };
    }, []);

    useEffect(()=>{
        loadElements();
    },[uniqueId])

    useLayoutEffect(() => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const roughCanvas = rough.canvas(canvas);
        elements.forEach(element => drawElement(roughCanvas, ctx, element));
    }, [elements]);

    const saveElements = async (event) => {
        // event.preventDefault();
        try {
            const form = {
                uuidEle : uniqueId,
                elements : elements
            }
            const response = await axios.post("http://localhost:5123/api/saveWhiteBoard", form, {
                headers: {
                    "Content-type": "application/json"
                },
                withCredentials: true,
            });
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const loadElements = async(event) => {
        // event.preventDefault();
        try {
            const form = {
                uuidEle : uniqueId,
            }
            const response = await axios.post("http://localhost:5123/api/loadWhiteBoard", form, {
                headers: {
                    "Content-type": "application/json"
                },
                withCredentials: true,
            });
            setElements(response.data.ele);
            // console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Socket Logic
    socket.on("mouseDownDraw", ({ id, clientX, clientY, type, elements }) => {
        setElements(elements);
    });
    socket.on("mouseMoveDraw", ({ clientX, clientY, type, index, elements }) => {
        setElements(elements);
    });
    socket.on("updateText", ({ elements }) => {
        setElements(elements);
    })
    socket.on("mouseDownSelect", ({ offsetX, offsetY, element }) => {
        setSelectedElement({ ...element, offsetX, offsetY });
    });
    socket.on("mouseMoveSelect", ({ id, newX, newY, height, width, type }) => {
        updateElement(id, newX, newY, newX + width, newY + height, type)
    });
    socket.on("clearCanvas", ({ msg }) => {
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
                // Custom For Pencil
                const outlinePoints = getStroke(element.points, {
                    size: element.sizeOfPencil,
                })
                const pathData = getSvgPathFromStroke(outlinePoints)
                const myPath = new Path2D(pathData);
                // Here 2
                context.fillStyle = element.stroke;
                context.fill(myPath);
                break;
            case "text":
                context.textBaseLine = "top"
                context.font = `${element.sizeOfText}px Arial`;
                context.fillStyle = element.stroke;
                context.fillText(element.text, element.x1, element.y1);
                break;
            default:
                throw new Error(`Type Not Recgnized  ${element.type}`)
        }
    }
    const createElement = (id, x1, y1, x2, y2, type) => {
        switch (type) {
            case "line":
            case "rectangle":
                // Fill And Stroke   
                // Rectangle => fillStyle,fillWeight,roughness,stroke,strokeWidth
                // Line => fillStyle,stroke,strokeWidth
                const roughElement = type === "line" ? generator.line(x1, y1, x2, y2, { stroke: strokecolor, strokeWidth: eleWidth }) : generator.rectangle(x1, y1, x2 - x1, y2 - y1, { "fill": fillcolor, "stroke": strokecolor, "strokeWidth": eleWidth, "fillStyle": fillstyle });
                return { id, x1, y1, x2, y2, type, roughElement };
            case "pencil":
                return { id, type, points: [{ x: x1, y: y1 }] };
            case "text":
                return { id, type, x1, y1, text: "" };
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
        if (action === "writing") return;
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
            let element = null;
            if (tool === "text") element = createElement(id, clientX, clientY, clientX, clientY, tool);
            else element = createElement(id, clientX - 3, clientY - 90, clientX - 3, clientY - 90, tool);
            setElements((prevState) => [...prevState, element]);
            setSelectedElement(element);
            setAction(tool === "text" ? "writing" : "drawing");
            socket.emit("mouseDownDraw", { id, clientX, clientY, type, elements });
        }
    }
    const updateElement = (id, x1, y1, x2, y2, type, options) => {
        const elemntsCopy = [...elements];
        switch (type) {
            case "line":
            case "rectangle":
                const updatedElement = createElement(id, x1, y1, x2, y2, type);
                elemntsCopy[id] = updatedElement;
                break;
            case "pencil":
                elemntsCopy[id].points = [...elemntsCopy[id].points, { x: x2, y: y2 }];
                // Here 1
                elemntsCopy[id].stroke = [strokecolor];
                elemntsCopy[id].sizeOfPencil = [eleWidth];
                break;
            case "text":
                elemntsCopy[id].text = options.text;
                elemntsCopy[id].stroke = [strokecolor];
                const sizeOfText = eleWidth * 2;
                elemntsCopy[id].sizeOfText = [sizeOfText];
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

            updateElement(index, x1, y1, clientX - 3, clientY - 90, tool);
            socket.emit("mouseMoveDraw", { clientX, clientY, type, index, elements });
        }
        else if (action === "moving") {
            const { id, x1, y1, x2, y2, type, offsetX, offsetY } = selectedElement;
            const width = x2 - x1;
            const height = y2 - y1;
            const newX = clientX - offsetX;
            const newY = clientY - offsetY;
            updateElement(id, newX, newY, newX + width, newY + height, type);
            socket.emit("mouseMoveSelect", { id, newX, newY, height, width, type });
        }
    }
    const handleMouseUp = (event) => {
        if (action === "writing") return;
        setAction("none");
        setSelectedElement(null);
    }
    const handleBlur = (event) => {
        if (commit === false) setCommit(true);
        if (commit === false) {
            const { id, x1, y1, type } = selectedElement;
            setAction("none");
            setSelectedElement(null);
            updateElement(id, x1, y1, null, null, type, { text: event.target.value });
            socket.emit("updateText", { elements });
            setCommit(false);
        }
    }
    const handleFillColor = (event) => {
        setFillColor(event.target.value);
    }
    const handleStrokeColor = (event) => {
        setStrokeColor(event.target.value);
    }
    const handleFillStyle = (event) => {
        setFillStyle(event.target.value);
        // console.log(event.target.value);
    }
    const handleClearCanvas = (event) => {
        event.preventDefault();
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setElements([]);
        setAction("none");
        setSelectedElement(null);
        setCommit(false);
        socket.emit("clearCanvas", "Clear The Canvas");
    }
    return (
        <div>
            <div>
                {/* Please Remove */}
                <br />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
                    <div>
                        {action === "writing" ?
                            <textarea onBlur={handleBlur} style={{
                                top: selectedElement.y1, left: selectedElement.x1, position: "fixed",
                                margin: 0, padding: 0, border: 0, outline: 0, resize: "auto", overflow: "hidden"
                            }} />
                            : null
                        }
                        <canvas id="canvas"
                            className="box"
                            style={{
                                backgroundColor: "white",
                                backgroundImage: `url(${grid})`,
                                borderRadius: "2vw"
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                        >Canvas</canvas>
                    </div>
                    <div style={{ color: "white", backgroundColor: "#343a40", borderRadius: "2vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflowX: "hidden" }} id="toolbar">

                        <div><label htmlFor="pencil" className="radio">Pencil Tool</label></div>
                        <div>
                            {tool === "pencil" ? (
                                <>
                                    <input type="radio" id="pencil" checked={tool === "pencil"} style={{ display: "none" }} onChange={() => { setTool("pencil") }} />
                                    <label htmlFor="pencil">
                                        <svg style={{ color: "yellow", height: "7vh", width: "12vw", border: "4px solid yellow", padding: "1vh" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" fill="yellow"></path></svg>
                                    </label>
                                </>
                            ) : (
                                <>
                                    <input type="radio" id="pencil" checked={tool === "pencil"} style={{ display: "none" }} onChange={() => { setTool("pencil") }} />
                                    <label htmlFor="pencil">
                                        <svg style={{ color: "white", height: "7vh", width: "12vw", border: "4px solid white", padding: "1vh" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" fill="white"></path></svg>
                                    </label>
                                </>
                            )}
                        </div>

                        <div><label htmlFor="line" className="radio">Line Tool</label></div>
                        <div>
                            {tool === "line" ? (
                                <>
                                    <input type="radio" id="line" checked={tool === "line"} style={{ display: "none" }} onChange={() => { setTool("line") }} />
                                    <label htmlFor="line">
                                        <svg style={{ color: "yellow", height: "7vh", width: "12vw", border: "4px solid yellow", padding: "1vh" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash-lg" viewBox="0 0 16 16"> <path fillRule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z" fill="yellow"></path> </svg>
                                    </label>
                                </>
                            ) : (
                                <>
                                    <input type="radio" id="line" checked={tool === "line"} style={{ display: "none" }} onChange={() => { setTool("line") }} />
                                    <label htmlFor="line">
                                        <svg style={{ color: "white", height: "7vh", width: "12vw", border: "4px solid white", padding: "1vh" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash-lg" viewBox="0 0 16 16"> <path fillRule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z" fill="white"></path> </svg>
                                    </label>
                                </>
                            )}
                        </div>

                        <div><label htmlFor="rectangle" className="radio">Rectangle Tool</label></div>
                        <div>
                            {tool === "rectangle" ? (
                                <>
                                    <input type="radio" id="rectangle" checked={tool === "rectangle"} style={{ display: "none" }} onChange={() => { setTool("rectangle") }} />
                                    <label htmlFor="rectangle">
                                        <svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" style={{ height: "7vh", width: "12vw", border: "4px solid yellow", padding: "1vh" }}><rect height="100%" width="100%" fill="yellow" /></svg>
                                    </label>
                                </>
                            ) : (
                                <>
                                    <input type="radio" id="rectangle" checked={tool === "rectangle"} style={{ display: "none" }} onChange={() => { setTool("rectangle") }} />
                                    <label htmlFor="rectangle">
                                        <svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" style={{ height: "7vh", width: "12vw", border: "4px solid white", padding: "1vh" }}><rect height="100%" width="100%" fill="white" /></svg>
                                    </label>
                                </>
                            )}
                        </div>

                        <div><label htmlFor="text" className="radio">Text Tool</label></div>
                        <div>
                            {tool === "text" ? (
                                <>
                                    <input type="radio" id="text" checked={tool === "text"} style={{ display: "none" }} onChange={() => { setTool("text") }} />
                                    <label htmlFor="text">
                                        <svg style={{ color: "yellow", height: "7vh", width: "12vw", border: "4px solid yellow", padding: "1vh" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 15v3m0 3v-3m0 0h3m-3 0h-3" fill="yellow"></path><path fill="yellow" fillRule="evenodd" d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6.803A5.972 5.972 0 0 1 12 18c0-.342.029-.677.084-1.003A1.048 1.048 0 0 1 12 17H8a1 1 0 1 1 0-2h4c.255 0 .488.095.665.253A6.029 6.029 0 0 1 14.681 13H8a1 1 0 1 1 0-2h8a1 1 0 0 1 .997 1.084A6.044 6.044 0 0 1 18 12c1.093 0 2.117.292 3 .803V6a3 3 0 0 0-3-3H6zm1 5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1z" clipRule="evenodd"></path></svg>
                                    </label>
                                </>
                            ) : (
                                <>
                                    <input type="radio" id="text" checked={tool === "text"} style={{ display: "none" }} onChange={() => { setTool("text") }} />
                                    <label htmlFor="text">
                                        <svg style={{ color: "white", height: "7vh", width: "12vw", border: "4px solid white", padding: "1vh" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 15v3m0 3v-3m0 0h3m-3 0h-3" fill="white"></path><path fill="white" fillRule="evenodd" d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6.803A5.972 5.972 0 0 1 12 18c0-.342.029-.677.084-1.003A1.048 1.048 0 0 1 12 17H8a1 1 0 1 1 0-2h4c.255 0 .488.095.665.253A6.029 6.029 0 0 1 14.681 13H8a1 1 0 1 1 0-2h8a1 1 0 0 1 .997 1.084A6.044 6.044 0 0 1 18 12c1.093 0 2.117.292 3 .803V6a3 3 0 0 0-3-3H6zm1 5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1z" clipRule="evenodd"></path></svg>
                                    </label>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <div style={{ backgroundColor: "#343a40", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderRadius: "2vw", padding: "2vh", width: "98vw", marginLeft: "1vw" }}>

                <label htmlFor="fillcolor" className="radio">Select A Fill Colour</label>
                <div>
                    <input id="fillcolor" type="color" value={fillcolor} onChange={handleFillColor} />
                </div>

                <label htmlFor="strokecolor" className="radio">Select A Stroke Colour</label>
                <div>
                    <input id="strokecolor" type="color" value={strokecolor} onChange={handleStrokeColor} />
                </div>

                <label htmlFor="width-slider" className="radio">Adjust Width</label>
                <div>
                    <input className={
                        eleWidth >= 0 && eleWidth < 14 ? 'violet' :
                            eleWidth >= 14 && eleWidth < 28 ? 'indigo' :
                                eleWidth >= 28 && eleWidth < 42 ? 'blue' :
                                    eleWidth >= 42 && eleWidth < 56 ? 'green' :
                                        eleWidth >= 56 && eleWidth < 70 ? 'yellow' :
                                            eleWidth >= 70 && eleWidth < 84 ? 'orange' :
                                                eleWidth >= 84 && eleWidth <= 100 ? 'red' : "None"
                    } type="range" min="0" max="100" step="1" value={eleWidth} onChange={(e) => setEleWidth(e.target.value)} id="width-slider" />
                    <span className='radio'>{eleWidth}</span>
                </div>

                <label htmlFor="fill-style" className="radio">Select Fill Style</label>
                <div>
                    <div className="btn-group dropup" id="fill-style">
                        <button type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ width: "12vw" }}>
                            {fillstyle}
                        </button>
                        <div className="dropdown-menu">
                            <button className="dropdown-item" type="button" onClick={handleFillStyle} value="solid">Solid</button>
                            <button className="dropdown-item" type="button" onClick={handleFillStyle} value="zigzag">Zig-Zag</button>
                            <button className="dropdown-item" type="button" onClick={handleFillStyle} value="cross-hatch">Cross Hatch</button>
                            <button className="dropdown-item" type="button" onClick={handleFillStyle} value="dots">Dots</button>
                            <button className="dropdown-item" type="button" onClick={handleFillStyle} value="dashed">Dashed</button>
                            <button className="dropdown-item" type="button" onClick={handleFillStyle} value="zigzag-line">Zig-Zag Line</button>
                        </div>
                    </div>
                </div>

                <label htmlFor="clear-canvas" className="radio">Clear Canvas</label>
                <div>
                    <button onClick={handleClearCanvas} id="clear-canvas" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                        <svg style={{ color: "white", height: "7vh", width: "12vw", border: "4px solid white", padding: "1vh" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" fill="white"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WhiteBoard