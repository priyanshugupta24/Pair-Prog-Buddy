const express = require('express');
const router = express.Router();

var { postLogin,postRegister,getProfile,postLogout,profileRemote,getUserDetails,saveProfile } = require("../controller/loginController.js");
const { validateToken } = require("../middlewares/JWTmiddleware.js");

router.route("/login").post(postLogin);
router.route("/logout").post(postLogout);
router.route("/register").post(postRegister);
router.route("/saveProfile").post(saveProfile);
router.route("/profile").get(validateToken,getProfile);
router.route("/profileRemote").post(profileRemote);
router.route("/getUserDetails").get(getUserDetails);

module.exports = router;
