const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { createToken } = require("./JWT.js");
const { user } = require("../models/user.model.js");
var dotenv = require('dotenv').config();

const hashno = process.env.HASHNO;

var postRegister = async(req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    const existingUser = await user.findOne({ email: email });
    if(existingUser && existingUser.email)res.status(400).json({err : `Account of Email ${existingUser.email} already exists.`});

    bcrypt.hash(password,parseInt(hashno)).then((hash)=>{
        var newUser = new user({
            email : email,
            password : hash
        })
        newUser.save()
        .then(()=>res.json(`New User with email - ${email} is registered!!`))
        .catch((err)=>{
            if(err){
                console.log("There was an error");
                return res.status(400).json({error:err});
            }
        });
    })
}
var postLogin = async(req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    // console.log(email,password);

    const existingUser = await user.findOne({ email: email });

    if(!existingUser)res.status(400).json({err : "User Does Not Exist."});
    else{
        bcrypt.compare(password,existingUser.password).then((match)=>{
            if(!match)res.status(400).json({err : "Password is wrong."});
            else{
                const accessToken = createToken(existingUser);
                const userInfo = {
                    email : existingUser.email,
                    _id : existingUser._id
                }
                const options = {
                    expires: new Date(Date.now() + 1000*60*60*24*15),
                    httpOnly: true,
                    secure: false, 
                    sameSite: "none",
                }
                res.cookie("access-token", accessToken, { maxAge: 2592000000});
                res.cookie("user-info", userInfo, { maxAge: 2592000000 });
                res.json({token:accessToken,auth:true,msg:`User with email - ${email} is Logged In!!`});
            }
        })
    }
    
}
var postLogout = (req,res) => {
    res.clearCookie('access-token',{ maxAge: 2592000000});
    res.clearCookie('user-info',{ maxAge: 2592000000});
    res.status(200).send('Logged out successfully');
}
var getProfile = (req,res) => {
    // console.log("Entering",res.cookies["user-info"])
    // res.cookie("id",1);
    if (req.cookies["user-info"]) {
        // console.log(req.cookies["user-info"].email);
        res.json({email:req.cookies["user-info"].email,_id:req.cookies["user-info"]._id,auth:true});
    } else {
        console.log("User info cookie not found in the request.");
    }
}
module.exports = { postLogin,postRegister,getProfile,postLogout };

