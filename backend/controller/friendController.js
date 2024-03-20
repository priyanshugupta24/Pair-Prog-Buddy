const { user } = require("../models/user.model.js");

const sendFriendReq = async(req,res) => {
    const toSendReqId = req.body._id;

    if (req.cookies["user-info"]){
        const getId = req.cookies["user-info"]._id;

        const existingUserSelf = await user.findOne({ _id : getId });
        if(!existingUserSelf)res.status(400).json({err : "You are not Authenticated"});

        const existingUserRemote = await user.findOne({ _id : toSendReqId });
        if(!existingUserRemote)res.status(400).json({err : "Remote User Does Not Exist"});
        
        await user.updateOne(
            {_id : toSendReqId , "waitList": { $ne: getId }},
            { "$push": { "waitList":  getId}},
        )
        res.status(200).json(`Friend Request Sent to ${toSendReqId}`);
    }
}

const acceptFriendReq = async(req, res) => {
    const sentReqId = req.body._id;
    const acceptReject = req.body.accept;

    if (req.cookies["user-info"]){
        const getId = req.cookies["user-info"]._id;

        // console.log(getId,sentReqId)

        const existingUserSelf = await user.findOne({ _id : getId });
        if(!existingUserSelf)res.status(400).json({err : "You are not Authenticated"});

        const existingUserRemote = await user.findOne({ _id : sentReqId });
        if(!existingUserRemote)res.status(400).json({err : "Remote User Does Not Exist"});

        if(acceptReject == "accepted"){
            await user.updateOne(
                {
                    _id : getId, 
                    "waitList": { $eq : sentReqId }
                },
                { "$pull": { "waitList":  sentReqId}},
            )
            await user.updateOne(
                {
                    _id : sentReqId,
                    "friends": { $ne : getId }
                },
                { "$push": { "friends":  getId}},
            )
            await user.updateOne(
                {
                    _id : getId,
                    "friends": { $ne : sentReqId }
                },
                { "$push": { "friends":  sentReqId}},
            )
            res.status(200).json(`Friend Request Accepted by ${getId}`);
        }
        else if(acceptReject == "reject"){
            await user.updateOne(
                {_id : getId},
                { "$pull": { "waitList":  sentReqId}},
            )
            res.status(200).json(`Friend Request Rejected by ${getId}`);
        }
    }
}

const removeFriend = async(req,res) => {
    const removeFriendId = req.body._id;

    if (req.cookies["user-info"]){
        const getId = req.cookies["user-info"]._id;

        const existingUserSelf = await user.findOne({ _id : getId });
        if(!existingUserSelf)res.status(400).json({err : "You are not Authenticated"});

        const existingUserRemote = await user.findOne({ _id : removeFriendId });
        if(!existingUserRemote)res.status(400).json({err : "Remote User Does Not Exist"});

        await user.updateOne(
            {_id : getId},
            { "$pull": { "friends":  removeFriendId}},
        )        
        await user.updateOne(
            {_id : removeFriendId},
            { "$pull": { "friends":  getId}},
        )

        res.status(200).json(`${getId} and ${removeFriendId} are no Longer Friends.`);
    }
}

const getFriends = async(req,res) => {
    if (req.cookies["user-info"]){
        const getId = req.cookies["user-info"]._id;

        const existingUserSelf = await user.findOne({ _id : getId });
        if(!existingUserSelf)res.status(400).json({err : "You are not Authenticated"});

        getFriendsList = await user.findOne({ _id : getId });

        if(!getFriendsList)res.status(400).json("You have no Friends.");
        res.status(200).json({friends : getFriendsList.friends});
    }
}

module.exports = { sendFriendReq,acceptFriendReq,removeFriend,getFriends };
