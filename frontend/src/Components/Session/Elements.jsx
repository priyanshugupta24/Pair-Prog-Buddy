import React, { useState, useLayoutEffect } from 'react'
import WhiteBoard from './WhiteBoard'
import axios from 'axios';

function Elements({ socket, sessionId }) {

  const [object, setObject] = useState(null);
  const [uniqueId, setUniqueId] = useState(null);
  const [sessionElements, setSessionElements] = useState([]);

  useLayoutEffect(() => {
    getSessionElements();
  }, [])

  socket.on("getSession",({msg})=>{
      console.log(msg);
      getSessionElements()
  })

  const getSessionElements = async (event) => {
    // event.preventDefault();
    try {
      const form = {
        sessionId: sessionId,
      }
      const response = await axios.post("http://localhost:5123/api/getSessionElements", form, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true,
      });
      const { sessionElements } = response.data;
      setSessionElements(sessionElements);
      console.log('Response:', response.data);
      console.log(sessionElements)
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleWhiteBoard = async (uid) => {
    setUniqueId(uid);
    setObject("whiteboard");
  }
  const removeElement = async (id, obj) => {
    try {
      const form = {
        typeOfObject : obj,
        sessionId: sessionId,
        unique_id : id
      }
      const response = await axios.post("http://localhost:5123/api/removeObject", form, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true,
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }

    socket.emit("getSession","getSession");
    var prev = null;
    setSessionElements(prevElements =>
      prevElements.filter((element) => {
        if(element.unique_id !== id){
          prev = element.unique_id;
          return true;
        }
        else{
          if(uniqueId === prev)setUniqueId(prev);
          return false;
        }
      })
    );
  }
  const handleEnv = async (event) => {
    try {
      const form = {
        "typeOfObject": event.target.value,
        "sessionId": sessionId,
      }
      const response = await axios.post("http://localhost:5123/api/createObject", form, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true,
      });
      console.log('Response:', response.data);
      socket.emit("getSession","Create object");
      getSessionElements();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: 'row' }} className="x">
        <div style={{ backgroundColor: "red", display: "flex", flexDirection: "row", overflowX: "hidden", width: "88vw" }}>
          {sessionElements.map((ele, index) => (
            <div key={index} onClick={() => handleWhiteBoard(ele.unique_id)}
              style={{
                background: "#636363", border: "1px solid white", padding: "0.7vw", display: "flex", flexDirection: "row",
                justifyContent: "space-between", width: "10vw", cursor: "pointer"
              }}>
              <div style={{ overflowX: "hidden" }}>{ele.object}{index + 1}</div>
              <div style={{ marginLeft: "1vw" }} onClick={() => { removeElement(ele.unique_id, ele.object) }}>x</div>
            </div>
          ))}
        </div>

        <div>
          <div className="btn-group dropdown" id="fill-style">
            <button type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ width: "12vw", height: "8vh" }}>
              Select Env
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" type="button" onClick={handleEnv} value="whiteboard" style={{ "cursor": "pointer" }}>WhiteBoard</button>
            </div>
          </div>
        </div>
      </div>


      {object === "whiteboard" ?
        <WhiteBoard socket={socket} uniqueId={uniqueId} />
        : null
      }

    </div>
  )
}

export default Elements