import React from 'react'
import { useParams } from 'react-router-dom';
import io from "socket.io-client";
import Elements from './Elements';
import "./Session.css"


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
      {/* <div>This Is {sessionId}</div> */}

      <Elements socket={socket} sessionId={sessionId}/>
    </div>
  )
}

export default Session