const { whiteBoard } = require("../models/whiteboard.model.js");

const saveWhiteBoard = async(req,res) => {
    const uuidEle = req.body.uuidEle;
    const elements = req.body.elements;

    const existingWB = await whiteBoard.findOne({unique_id : uuidEle});
    if(!existingWB)return res.status(400).json({"err" : "Whiteboard not found"});

    await whiteBoard.updateOne(
        {unique_id : uuidEle},
        {elements: elements}
    )

    res.status(200).json("Saved Successfully");
}

const loadWhiteBoard = async(req,res) => {
    const uuidEle = req.body.uuidEle;

    const existingWB = await whiteBoard.findOne({unique_id : uuidEle});
    if(!existingWB)return res.status(400).json({"err" : "Whiteboard not found"});

    res.status(200).json({ele : existingWB.elements});
}

module.exports = { saveWhiteBoard,loadWhiteBoard };