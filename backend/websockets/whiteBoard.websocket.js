const socketIO = require("socket.io");
const WhiteBoard = (server) => {
    const io = socketIO(server);
    io.on("connection",(socket)=>{
        socket.on("test",(msg)=>console.log(msg));
        socket.on("mouseDownDraw",({id,clientX,clientY,type,elements})=>{
            // console.log(type)
            socket.broadcast.emit("mouseDownDraw",{id,clientX,clientY,type,elements});
        });
        socket.on("mouseMoveDraw",({clientX,clientY,type,index,elements})=>{
            socket.broadcast.emit("mouseMoveDraw",{clientX,clientY,type,index,elements});
        });
        socket.on("mouseDownSelect",({offsetX,offsetY,element})=>{
            socket.broadcast.emit("mouseDownSelect",{offsetX,offsetY,element});
        });
        socket.on("mouseMoveSelect",({id,newX,newY,height,width,type})=>{
            socket.broadcast.emit("mouseMoveSelect",{id,newX,newY,height,width,type});
        })
    })
}

module.exports = { WhiteBoard };