const express = require('express');
const router = express.Router();

var { sendFriendReq,acceptFriendReq,removeFriend } = require("../controller/friendController.js");

router.route("/sendFriendReq").post(sendFriendReq);
router.route("/acceptFriendReq").post(acceptFriendReq);
router.route("/removeFriend").post(removeFriend);

module.exports = router;