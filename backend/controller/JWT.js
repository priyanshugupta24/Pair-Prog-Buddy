const {sign,verify} = require("jsonwebtoken");
var dotenv = require('dotenv').config();

const secret = process.env.JWTSECRET;
// const expirationTime = 3600; // 1 hour in seconds

const createToken = (user) => {
    const accessToken = sign({ username : user.email , id : user._id},secret);
    return accessToken;
}

module.exports = { createToken };