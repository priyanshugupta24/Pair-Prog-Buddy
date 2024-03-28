const { sessionEnv } = require("../models/session.model.js");
const { whiteBoard } = require("../models/whiteboard.model.js");
const uuid = require('uuid');

const createSession = async(req,res) => {
    const sessionId = req.body.sessionId;
    const getId = req.cookies["user-info"]._id;

    if (req.cookies["user-info"]){
        const newSession = new sessionEnv({
            sessionId: sessionId,
            participantsId: [getId]
        });

        try {
            const savedSession = await newSession.save();
            res.status(200).json(savedSession);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    else{
        return res.status(400).json({"err" : "User Not Authenticated"});
    }
}

const joinSession= async(req,res) => {
    const sessionId = req.body.sessionId;
    const getId = req.cookies["user-info"]._id;

    if (req.cookies["user-info"]){
        const existingSession = await sessionEnv.findOne({sessionId : parseInt(sessionId)});
        if(!existingSession)return res.status(400).json({err : "There is no room of this number"});

        const alreadyInTheRoom = await sessionEnv.findOne({"participantsId": { $eq : getId }});
        if(alreadyInTheRoom)return res.status(400).json({"err" : "Already In The Room"});

        await sessionEnv.updateOne(
            {sessionId : sessionId},
            {"$push":{"participantsId" : getId}}
        );

        res.status(200).json("User Joined Room Successfully!!");
    }
    else{
        return res.status(400).json({"err" : "User Not Authenticated"});
    }
}

const createObject = async(req,res) => {
    const typeOfObject = req.body.typeOfObject;
    const sessionId = req.body.sessionId;
    let uuidEle = uuid.v4();

    const checkId = whiteBoard.findOne({unique_id : uuidEle})
    if(checkId)uuidEle = uuidEle + "1";

    if(typeOfObject === "whiteboard"){
        const existingSession = await sessionEnv.findOne({sessionId : parseInt(sessionId)});
        if(!existingSession)return res.status(400).json({err : "There is no room of this number"});

        const arr = existingSession.sessionElements;

        var wb = 0;
        for(var i = 0;i<arr.length;i++){
            if(arr[i].object === "whiteboard")wb++;
            if(wb>=3)return res.status(400).json({err : "Already 3 Opened.."});
        }

        const sessionInfo = {
            object : typeOfObject,
            unique_id : uuidEle
        }

        await sessionEnv.updateOne(
            {sessionId : sessionId},
            { "$push": { sessionElements: sessionInfo }}
        );
        
        const newWhiteBoard = new whiteBoard({
            unique_id : uuidEle,
        });

        const savedWhiteBoard = await newWhiteBoard.save();
        
        res.status(200).json(savedWhiteBoard);
    }
}

const getSessionElements = async(req,res) => {
    const sessionId = req.body.sessionId;
    
    const existingSession = await sessionEnv.findOne({sessionId : parseInt(sessionId)});
    if(!existingSession)return res.status(400).json({err : "There is no room of this number"});

    res.status(200).json({sessionElements : existingSession.sessionElements});
}

const removeObject = async(req, res) => {
    const typeOfObject = req.body.typeOfObject;
    const sessionId = req.body.sessionId;
    const unique_id = req.body.unique_id;

    if(typeOfObject === "whiteboard"){
        const result = await whiteBoard.find({})
        // console.log(result);
        await sessionEnv.updateOne(
            {sessionId : sessionId},
            { "$pull": { sessionElements: {unique_id : unique_id}}}
        )
        await whiteBoard.deleteOne({ unique_id: unique_id });
        res.status(200).json("Removed Successfully");

    }
}

module.exports = { createSession,joinSession,createObject,getSessionElements,removeObject };