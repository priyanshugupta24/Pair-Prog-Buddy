const { user } = require("../models/user.model.js");

const sendFriendReq = async (req, res) => {
    const toSendReqId = req.body._id;

    if (req.cookies["user-info"]) {
        const getId = req.cookies["user-info"]._id;

        const existingUserSelf = await user.findOne({ _id: getId });
        if (!existingUserSelf) res.status(400).json({ err: "You are not Authenticated" });

        const existingUserRemote = await user.findOne({ _id: toSendReqId });
        if (!existingUserRemote) res.status(400).json({ err: "Remote User Does Not Exist" });

        await user.updateOne(
            { _id: toSendReqId, "waitList": { $ne: getId } },
            { "$push": { "waitList": getId } },
        )
        await user.updateOne(
            { _id: getId, "sendTo": { $ne: toSendReqId } },
            { "$push": { "sendTo": toSendReqId } },
        )
        res.status(200).json(`Friend Request Sent to ${toSendReqId}`);
    }
}

const acceptFriendReq = async (req, res) => {
    const sentReqId = req.body._id;
    const acceptReject = req.body.accept;

    if (req.cookies["user-info"]) {

        const getId = req.cookies["user-info"]._id;

        // console.log(getId,sentReqId)

        const existingUserSelf = await user.findOne({ _id: getId });
        if (!existingUserSelf) res.status(400).json({ err: "You are not Authenticated" });

        const existingUserRemote = await user.findOne({ _id: sentReqId });
        if (!existingUserRemote) res.status(400).json({ err: "Remote User Does Not Exist" });

        if (acceptReject == "accepted") {

            const top3shortRemote = existingUserRemote.skills.top3short;
            const normalRemote = existingUserRemote.skills.normal;
            const regionRemote = existingUserRemote.region;
            const ttcRemote = existingUserRemote.timeToCode;
            const preferRemote = existingUserRemote.prefer;
            const mix3RegionRemote = `${regionRemote.iso2Country}${regionRemote.iso2State}${regionRemote.city}`
            const mix2RegionRemote = `${regionRemote.iso2Country}${regionRemote.iso2State}`
            const mix1RegionRemote = `${regionRemote.iso2Country}`

            const top3shortSelf = existingUserSelf.skills.top3short;
            const normalSelf = existingUserSelf.skills.normal;
            const regionSelf = existingUserSelf.region;
            const ttcSelf = existingUserSelf.timeToCode;
            const preferSelf = existingUserSelf.prefer;
            const mix3RegionSelf = `${regionSelf.iso2Country}${regionSelf.iso2State}${regionSelf.city}`
            const mix2RegionSelf = `${regionSelf.iso2Country}${regionSelf.iso2State}`
            const mix1RegionSelf = `${regionSelf.iso2Country}`

            let score = 0;

            if (preferRemote === preferSelf) score += 2;
            if (ttcRemote === ttcSelf) score += 2;
            if (mix3RegionRemote === mix3RegionSelf) score += 9;
            else if (mix2RegionRemote === mix2RegionSelf) score += 6;
            else if (mix1RegionRemote === mix1RegionSelf) score += 3;
            
            const set = new Set(top3shortRemote);
            let countTop3 = 0;
            for (const element of top3shortSelf) {
                if (set.has(element)) {
                    countTop3++;
                }
            }
            score += countTop3*3;

            const setSkills = new Set(normalRemote);
            let countSkills = 0;
            for (const element of normalSelf) {
                if (setSkills.has(element)) {
                    countSkills++;
                }
            }
            score += countSkills;

            await user.updateOne(
                {_id : getId, "waitList": { $eq : sentReqId }},
                { "$pull": { "waitList":  sentReqId}},
            )
            await user.updateOne(
                {_id : sentReqId, "sendTo": { $eq : getId }},
                { "$pull": { "sendTo":  getId}},
            )
            const friendDetail = {
                _id : sentReqId,
                username : existingUserRemote.username,
                score : score
            }
            const clientDetail = {
                _id : getId,
                username : existingUserSelf.username,
                score : score
            }
            await user.updateOne(
                {
                    _id : sentReqId,
                    "friends": { $ne : clientDetail }
                },
                { "$push": { "friends":  clientDetail}},
            )
            await user.updateOne(
                {
                    _id : getId,
                    "friends": { $ne : friendDetail }
                },
                { "$push": { "friends":  friendDetail}},
            )
            res.status(200).json(`Friend Request Accepted by ${getId}`);
        }
        else if (acceptReject == "reject") {
            await user.updateOne(
                { _id: getId },
                { "$pull": { "waitList": sentReqId } },
            )
            await user.updateOne(
                { _id: sentReqId },
                { "$pull": { "sendTo": getId } },
            )
            res.status(200).json(`Friend Request Rejected by ${getId}`);
        }
    }
}

const removeFriend = async (req, res) => {
    const removeFriendId = req.body._id;

    if (req.cookies["user-info"]) {
        const getId = req.cookies["user-info"]._id;

        const existingUserSelf = await user.findOne({ _id: getId });
        if (!existingUserSelf) res.status(400).json({ err: "You are not Authenticated" });

        const existingUserRemote = await user.findOne({ _id: removeFriendId });
        if (!existingUserRemote) res.status(400).json({ err: "Remote User Does Not Exist" });

        await user.updateOne(
            { _id: getId },
            { "$pull": { "friends": { _id: removeFriendId } } },
        )
        await user.updateOne(
            { _id: removeFriendId },
            { "$pull": { "friends": { _id: getId } } },
        )

        res.status(200).json(`${getId} and ${removeFriendId} are no Longer Friends.`);
    }
}

const getFriends = async (req, res) => {
    if (req.cookies["user-info"]) {
        const getId = req.cookies["user-info"]._id;

        const existingUserSelf = await user.findOne({ _id: getId });
        if (!existingUserSelf) res.status(400).json({ err: "You are not Authenticated" });

        getFriendsList = await user.findOne({ _id: getId });

        if (!getFriendsList) res.status(400).json("You have no Friends.");
        res.status(200).json({ friends: getFriendsList.friends });
    }
}

const getProfileRemote = async (req,res) =>{
    const username = req.body.username;
    const existingUserRemote = await user.findOne({ username : username });
    return res.status(200).json({ user:existingUserRemote })
}

module.exports = { sendFriendReq, acceptFriendReq, removeFriend, getFriends,getProfileRemote };
// {
    // "_id" : "661b6af20cf089f9f6048ec9",
    // "accept" : "accepted"
// }