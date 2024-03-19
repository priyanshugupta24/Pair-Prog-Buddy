const express = require('express');
const router = express.Router();

var { postLogin,postRegister,getProfile,postLogout } = require("../controller/loginController.js");
const { validateToken } = require("../middlewares/JWTmiddleware.js");

router.route("/login").post(postLogin);
router.route("/logout").post(postLogout);
router.route("/register").post(postRegister);
router.route("/profile").get(validateToken,getProfile);

module.exports = router;
