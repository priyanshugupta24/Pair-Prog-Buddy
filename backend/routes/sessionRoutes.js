const express = require('express');
const router = express.Router();

var { createSession,joinSession,createObject,getSessionElements,removeObject } = require("../controller/sessionContorller.js");
var { saveWhiteBoard,loadWhiteBoard } = require("../controller/whiteBoardController.js");

router.route("/createSession").post(createSession);
router.route("/joinSession").post(joinSession);
router.route("/getSessionElements").post(getSessionElements);
router.route("/createObject").post(createObject);
router.route("/removeObject").post(removeObject);
router.route("/saveWhiteBoard").post(saveWhiteBoard);
router.route("/loadWhiteBoard").post(loadWhiteBoard);

module.exports = router;