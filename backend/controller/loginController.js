const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { createToken } = require("./JWT.js");
const { user } = require("../models/user.model.js");
var dotenv = require('dotenv').config();
const { reccomendation } = require("../models/reccomendation.model.js");

const hashno = process.env.HASHNO;

var postRegister = async (req, res) => {
    const name = req.body.name;
    const userName = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;

    const existingUser = await user.findOne({ email: email });
    if (existingUser && existingUser.email) res.status(400).json({ err: `Account of Email ${existingUser.username} already exists.` });

    bcrypt.hash(password, parseInt(hashno)).then((hash) => {
        var newUser = new user({
            name: name,
            username: userName,
            email: email,
            password: hash
        })
        newUser.save()
            .then(() => res.json(`New User with email - ${email} is registered!!`))
            .catch((err) => {
                if (err) {
                    console.log("There was an error");
                    return res.status(400).json({ error: err });
                }
            });
    })
}
var postLogin = async (req, res) => {
    const uemail = req.body.uemail;
    const password = req.body.password;

    const existingUserEmail = await user.findOne({ email: uemail });
    const existingUserUsername = await user.findOne({ username: uemail });

    if (!existingUserEmail && !existingUserUsername) res.status(400).json({ err: "User Does Not Exist." });
    else {
        let existingUser = null;
        if (existingUserEmail) existingUser = existingUserEmail;
        else existingUser = existingUserUsername;
        bcrypt.compare(password, existingUser.password).then((match) => {
            if (!match) res.status(400).json({ err: "Password is wrong." });
            else {
                const accessToken = createToken(existingUser);
                const userInfo = {
                    email: existingUser.email,
                    _id: existingUser._id,
                    username: existingUser.username
                }
                const options = {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
                    httpOnly: true,
                    secure: false,
                    sameSite: "none",
                }
                res.cookie("access-token", accessToken, { maxAge: 2592000000 });
                res.cookie("user-info", userInfo, { maxAge: 2592000000 });
                res.json({ token: accessToken, auth: true, msg: `User with email - ${userInfo.username} is Logged In!!` });
            }
        })
    }

}
var postLogout = (req, res) => {
    res.clearCookie('access-token', { maxAge: 2592000000 });
    res.clearCookie('user-info', { maxAge: 2592000000 });
    res.status(200).send('Logged out successfully');
}
var getProfile = async (req, res) => {
    // console.log("Entering",res.cookies["user-info"])
    // res.cookie("id",1);
    if (req.cookies["user-info"]) {
        // console.log(req.cookies["user-info"].email);
        const username = req.cookies["user-info"].username;
        const existingUser = await user.findOne({ username: username });
        res.json({
            username: req.cookies["user-info"].username,
            _id: req.cookies["user-info"]._id,
            auth: true,
            user: existingUser,
        });
    } else {
        console.log("User info cookie not found in the request.");
    }
}

const profileRemote = async (req, res) => {
    const username = req.body.username;
    const existingUser = await user.findOne({ username: username });
    // console.log(existingUser.pfp);
    res.json({
        user: existingUser,
        _id: req.cookies["user-info"]._id,
    });
}

const getUserDetails = async (req, res) => {
    if (req.cookies["user-info"]) {
        // console.log(req.cookies["user-info"].email);
        const username = req.cookies["user-info"].username;
        const existingUser = await user.findOne({ username: username });
        res.json({
            username: req.cookies["user-info"].username,
            _id: req.cookies["user-info"]._id,
            auth: true,
            user: existingUser,
        });
    } else {
        console.log("User info cookie not found in the request.");
    }
}

const saveProfile = async (req, res) => {
    const profile = req.body.profile;

    const username = req.cookies["user-info"].username;
    const myId = req.cookies["user-info"]._id;
    
    var existingRecommendation = await reccomendation.findOne({});

    const prefer = profile.prefer;
    const country = profile.region.iso2Country;
    const state = profile.region.iso2State;
    const city = profile.region.city;

    const mix3Region = `${country}${state}${city}`;
    const mix2Region = `${country}${state}`;
    const mix1Region = `${country}`;

    const prevCountryIso2 = req.body.prev.iso2Country;
    const prevStateIso2 = req.body.prev.iso2State;
    const prevCity = req.body.prev.city;

    const prevMix3Region = `${prevCountryIso2}${prevStateIso2}${prevCity}`;
    const prevMix2Region = `${prevCountryIso2}${prevStateIso2}`;
    const prevMix1Region = `${prevCountryIso2}`;
    
    if (!existingRecommendation) {
        var newRecommendations = null;
        if (prefer === "dsa") {
            newRecommendations = {
                regionBased: {
                    lc: [
                        { [mix3Region]: [{ _id: myId,username:username }] },
                        { [mix2Region]: [{ _id: myId,username:username }] },
                        { [mix1Region]: [{ _id: myId,username:username }] }
                    ],
                    dev: [],
                    both: [
                        { [mix3Region]: [{ _id: myId,username:username }] },
                        { [mix2Region]: [{ _id: myId,username:username }] },
                        { [mix1Region]: [{ _id: myId,username:username }] }
                    ]
                }
            }
        }
        else{
            newRecommendations = {
                regionBased: {
                    lc: [],
                    dev: [
                        { [mix3Region]: [{ _id: myId,username:username }] },
                        { [mix2Region]: [{ _id: myId,username:username }] },
                        { [mix1Region]: [{ _id: myId,username:username }] }
                    ],
                    both: [
                        { [mix3Region]: [{ _id: myId,username:username }] },
                        { [mix2Region]: [{ _id: myId,username:username }] },
                        { [mix1Region]: [{ _id: myId,username:username }] }
                    ]
                }
            }
        }
        console.log(newRecommendations);
        const newDoc = new reccomendation(newRecommendations);
        await newDoc.save();
    }
    else {

        if(prefer === "dsa"){
            
            let flagMix3 = 0,flagMix2 = 0,flagMix1 = 0,mix3Index = 0,mix2Index = 0,mix1Index = 0;
            let flagPull1 = 0,flagPull2 = 0,flagPull3 = 0;
            const lcList = existingRecommendation.regionBased.lc;
            for(var i=0;i<lcList.length;i++){
                if(flagMix3 === 1 && flagMix2 === 1 && flagMix1 === 1)break;
                if(flagMix3 === 0 && lcList[i][mix3Region]!==undefined){
                    flagMix3 = 1;
                    mix3Index = i;
                }
                if(flagMix2 === 0 && lcList[i][mix2Region]!==undefined){
                    flagMix2 = 1;
                    mix2Index = i;
                }
                if(flagMix1 === 0 && lcList[i][mix1Region]!==undefined){
                    flagMix1 = 1;
                    mix1Index = i;
                }
                if(flagPull3 === 0 && lcList[i][prevMix3Region]!==undefined){
                    flagPull3 = 1;
                    const newElement = `regionBased.lc.${i}.${prevMix3Region}`;
                    const update = {
                        $pull: { [newElement] : { _id: myId,username:username } }
                    };
                    await reccomendation.findOneAndUpdate({}, update);
                    const newElement2 = `regionBased.both.${i}.${prevMix3Region}`;
                    const update2 = {
                        $pull: { [newElement2] : { _id: myId,username:username } }
                    };
                    await reccomendation.findOneAndUpdate({}, update2);
                }
                if(flagPull2 === 0 && lcList[i][prevMix2Region]!==undefined){
                    flagPull2 = 1;
                    const newElement = `regionBased.lc.${i}.${prevMix2Region}`;
                    const update = {
                        $pull: { [newElement] : { _id: myId,username:username } }
                    };
                    await reccomendation.findOneAndUpdate({}, update);
                    const newElement2 = `regionBased.both.${i}.${prevMix2Region}`;
                    const update2 = {
                        $pull: { [newElement2] : { _id: myId,username:username } }
                    };
                    await reccomendation.findOneAndUpdate({}, update2);
                }
                if(flagPull1 === 0 && lcList[i][prevMix1Region]!==undefined){
                    flagPull1 = 1;
                    const newElement = `regionBased.lc.${i}.${prevMix1Region}`;
                    const update = {
                        $pull: { [newElement] : { _id: myId,username:username } }
                    };
                    await reccomendation.findOneAndUpdate({}, update);
                    const newElement1 = `regionBased.both.${i}.${prevMix1Region}`;
                    const update1 = {
                        $pull: { [newElement1] : { _id: myId,username:username } }
                    };
                    await reccomendation.findOneAndUpdate({}, update1);
                }
            }
            if(!flagMix3){
                const newElement = { [mix3Region]: [{ _id: myId,username:username }] };
                existingRecommendation.regionBased.lc.push(newElement);
                await existingRecommendation.save();
                const newElement1 = { [mix3Region]: [{ _id: myId,username:username }] };
                existingRecommendation.regionBased.both.push(newElement1);
                await existingRecommendation.save();
            }
            else{
                const newElement = `regionBased.lc.${mix3Index}.${mix3Region}`;
                const update = {
                    $push: { [newElement] : { _id: myId,username:username } }
                };
                await reccomendation.findOneAndUpdate({}, update);
                const newElement1 = `regionBased.both.${mix3Index}.${mix3Region}`;
                const update1 = {
                    $push: { [newElement1] : { _id: myId,username:username } }
                };
                await reccomendation.findOneAndUpdate({}, update1);
            }
            if(!flagMix2){
                const newElement = { [mix2Region]: [{ _id: myId,username:username }] };
                existingRecommendation.regionBased.lc.push(newElement);
                await existingRecommendation.save();
                const newElement1 = { [mix2Region]: [{ _id: myId,username:username }] };
                existingRecommendation.regionBased.both.push(newElement1);
                await existingRecommendation.save();
            }
            else{
                const newElement = `regionBased.lc.${mix2Index}.${mix2Region}`;
                const update = {
                    $push: { [newElement] : { _id: myId,username:username } }
                };
                await reccomendation.findOneAndUpdate({}, update);
                const newElement1 = `regionBased.both.${mix2Index}.${mix2Region}`;
                const update1 = {
                    $push: { [newElement1] : { _id: myId,username:username } }
                };
                await reccomendation.findOneAndUpdate({}, update1);
            }
            if(!flagMix1){
                const newElement = { [mix1Region]: [{ _id: myId,username:username }] };
                existingRecommendation.regionBased.lc.push(newElement);
                await existingRecommendation.save();
                const newElement1 = { [mix1Region]: [{ _id: myId,username:username }] };
                existingRecommendation.regionBased.both.push(newElement1);
                await existingRecommendation.save();
            }
            else{
                const newElement = `regionBased.lc.${mix1Index}.${mix1Region}`;
                const update = {
                    $push: { [newElement] : { _id: myId,username:username } }
                };
                await reccomendation.findOneAndUpdate({}, update);
                const newElement1 = `regionBased.both.${mix1Index}.${mix1Region}`;
                const update1 = {
                    $push: { [newElement1] : { _id: myId,username:username } }
                };
                await reccomendation.findOneAndUpdate({}, update1);
            }
            // console.log(flagMix3,flagMix2,flagMix1);
            // console.log(existingRecommendation.regionBased.lc[0].INGUJAhmedab);
        }
    }
    // await user.updateOne({ username: username },profile);

    res.status(200).json("Profile Updated Successfully!!");
}
module.exports = { postLogin, postRegister, getProfile, postLogout, profileRemote, getUserDetails, saveProfile };

