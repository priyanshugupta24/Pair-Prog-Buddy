import React from 'react'
import { useParams } from 'react-router-dom';
import io from "socket.io-client";
import WhiteBoard from './WhiteBoard';

const server = "http://localhost:5123";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);
// const socket = null;
function Session() {
  let { sessionId } = useParams();
  return (
    <div>
      <div>This Is {sessionId}</div>
      {/* <WhiteBoard socket={socket} boardId={boardId}/> */}
      <WhiteBoard socket={socket}/>
    </div>
  )
}

export default Session