const express = require('express');
const router = express.Router();

var { sendFriendReq,acceptFriendReq,removeFriend,getFriends,getProfileRemote,getWaitList,revokeFriendReq } = require("../controller/friendController.js");

router.route("/getFriends").get(getFriends);
router.route("/sendFriendReq").post(sendFriendReq);
router.route("/acceptFriendReq").post(acceptFriendReq);
router.route("/removeFriend").post(removeFriend);
router.route("/getProfileRemote").post(getProfileRemote);
router.route("/getWaitList").get(getWaitList);
router.route("/revokeFriendReq").post(revokeFriendReq);

module.exports = router;