const express = require('express');
const router = express.Router();

var { sendFriendReq,acceptFriendReq,removeFriend,getFriends,getProfileRemote } = require("../controller/friendController.js");

router.route("/getFriends").get(getFriends);
router.route("/sendFriendReq").post(sendFriendReq);
router.route("/acceptFriendReq").post(acceptFriendReq);
router.route("/removeFriend").post(removeFriend);
router.route("/getProfileRemote").post(getProfileRemote);

module.exports = router;