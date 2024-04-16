const { reccomendation } = require("../models/reccomendation.model.js");
const { user } = require("../models/user.model.js");

function permutations(input, output = [], current = "", index = 0) {
    if (index >= input.length) {
        if (current !== '') output.push(current);
        return;
    }
    permutations(input, output, current + input[index], index + 1);
    permutations(input, output, current, index + 1);
}

const dfs = async (node, vis, ans, cnt, thresh, return2,friendsFetchCap) => {
    vis[node] = true;
    if(ans.length>=friendsFetchCap)return;
    const selfUser = await user.findOne({ _id: node });
    const objectToFind = { "_id": node, "username": selfUser.username };
    const exists = ans.some(item =>
        item._id === objectToFind._id && item.username === objectToFind.username
    );
    if (!exists && cnt !== 0 && cnt !== 1) {
        ans.push({ "_id": node, "username": selfUser.username });
    }

    const userSelf = await user.findOne({ _id: node });
    userSelf.friends.sort((a, b) => b.score - a.score);

    // await console.log();
    for (var i = 0; i < userSelf.friends.length; i++) {
        // console.log(selfUser.username, userSelf["friends"][i]["username"], userSelf["friends"][i]["score"], cnt, !vis[userSelf["friends"][i]["_id"]])
        if (!vis[userSelf["friends"][i]["_id"]] && userSelf["friends"][i]["score"] >= (thresh + cnt)) {
            // console.log("Come")
            await dfs(userSelf["friends"][i]["_id"], vis, ans, cnt + 1, thresh, return2,friendsFetchCap);
        }
        else if (!vis[userSelf["friends"][i]["_id"]] && userSelf["friends"][i]["score"] < (thresh + cnt)) {
            const objectToFind = { "_id": node, "username": selfUser.username, "cnt": cnt }
            const exists = return2.some(item =>
                item._id === objectToFind._id && item.username === objectToFind.username && item.cnt === objectToFind.cnt
            );
            if (!exists) return2.push({ "_id": node, "username": selfUser.username, "cnt": cnt });
        }
        // dfs(userSelf["friends"][i]["_id"], vis, ans, cnt + 1);
    }
}

var fetchReccomendation = async (req, res) => {
    const profile = req.body.profile;

    let countRegion = 0;
    let countRegionCap = 2;//5(real) => 4(reel,input)
    let countSkills = 0;
    let countSkillsCap = 3;//1(real) => 1(reel,input)
    let countRegionDev = 0;
    let countRegionCapDev = 1;//5(real) => 4(reel,input)
    let countSkillsDev = 0;
    let countSkillsCapDev = 1;//1(real) => 1(reel,input)
    let randomUser = 0;
    let randomUserCap = 2;
    let friendsFetchCap = 5;

    let reccom = []

    const country = profile.region.iso2Country;
    const state = profile.region.iso2State;
    const city = profile.region.city;

    const mix3Region = `${country}${state}${city}`;
    const mix2Region = `${country}${state}`;
    const mix1Region = `${country}`;

    const top3skills = profile.skills.top3short;
    top3skills.sort();
    const permutedSkills = [];
    permutations(top3skills, permutedSkills);

    // Write Friend Logic
    try{
    var existingRecommendation = await reccomendation.findOne({});
    var userSelfFriendList = await user.findOne({ _id: profile._id });
    userSelfFriendList.friends.sort((a, b) => b.score - a.score);

    let return2 = []
    let vis = {};
    let thresh = userSelfFriendList.friends[0]["score"] - (userSelfFriendList.friends[0]["score"]*0.4);
    await dfs(profile._id, vis, reccom, 0, thresh, return2,friendsFetchCap);
    // console.log("This is the ans : ", reccom, return2);

    let return1;
    let cntForWhile = 5;
    while (cntForWhile > 0) {
        return1 = return2;
        return2 = [];
        if(return1.length === 0 && reccom.length >= friendsFetchCap)break;
        for (var i = 0; i < return1.length; i++) {
            const cnt2 = return1[i]["cnt"];
            await dfs(return1[i]["_id"], vis, reccom, cnt2, thresh, return2,friendsFetchCap);
        }
        thresh -= 4;
        cntForWhile--;
        // console.log("This is 3 : ", return1, return2);
    }
    // console.log(reccom);
    }
    catch(err){
        console.log(err);
    }
    countRegionCap += (friendsFetchCap - reccom.length);

    if (profile.prefer === "dsa") {
        let lcList = existingRecommendation.regionBased.lc;
        let firstMix = -1, secondMix = -1, thirdMix = -1;

        for (var i = 0; i < lcList.length; i++) {
            if (lcList[i][mix3Region] !== undefined) {
                thirdMix = i;
            }
            if (lcList[i][mix2Region] !== undefined) {
                secondMix = i;
            }
            if (lcList[i][mix1Region] !== undefined) {
                firstMix = i;
            }
        }

        if (thirdMix !== -1 && countRegion < countRegionCap) {
            let count3Region = lcList[thirdMix][mix3Region].length - 1;
            while (count3Region > 0) {
                let exists = reccom.find(item => item._id === lcList[thirdMix][mix3Region][count3Region]._id
                    && item.username === lcList[thirdMix][mix3Region][count3Region].username);
                if (!exists) {
                    reccom.push(lcList[thirdMix][mix3Region][count3Region]);
                    countRegion++;
                    if (countRegion > countRegionCap) break;
                }
                count3Region--;
            }
        }
        if (secondMix !== -1 && countRegion < countRegionCap) {
            let count2Region = lcList[secondMix][mix2Region].length - 1;
            while (count2Region > 0) {
                let exists = reccom.find(item => item._id === lcList[secondMix][mix2Region][count2Region]._id
                    && item.username === lcList[secondMix][mix2Region][count2Region].username);
                if (!exists) {
                    reccom.push(lcList[secondMix][mix2Region][count2Region]);
                    countRegion++;
                    if (countRegion > countRegionCap) break;
                }
                count2Region--;
            }
        }
        if (firstMix !== -1 && countRegion < countRegionCap) {
            let count1Region = lcList[firstMix][mix1Region].length - 1;
            while (count1Region > 0) {
                let exists = reccom.find(item => item._id === lcList[firstMix][mix1Region][count1Region]._id
                    && item.username === lcList[firstMix][mix1Region][count1Region].username);
                if (!exists) {
                    reccom.push(lcList[firstMix][mix1Region][count1Region]);
                    countRegion++;
                    if (countRegion > countRegionCap) break;
                }
                count1Region--;
            }
        }

        countSkillsCap += (countRegionCap - countRegion) + 1;
        let n = permutedSkills.length;
        let lcListSkills = existingRecommendation.skillBased.lc;
        for (var i = 0; i < lcListSkills.length; i++) {
            for (var j = 0; j < n; j++) {
                if (lcListSkills[i][permutedSkills[j]] != undefined && countSkills < countSkillsCap) {//1 => 2
                    let countSkill = lcListSkills[i][permutedSkills[j]].length - 1;
                    while (countSkill >= 0) {
                        let exists = reccom.find(item => item._id === lcListSkills[i][permutedSkills[j]][countSkill]._id
                            && item.username === lcListSkills[i][permutedSkills[j]][countSkill].username);
                        if (!exists) {
                            reccom.push(lcListSkills[i][permutedSkills[j]][countSkill]);
                            countSkills++;
                            if (countSkills > countSkillsCap) break;
                        }
                        countSkill--;
                    }
                }
            }
        }

        countRegionCapDev += (countSkillsCap - countSkills);
        lcList = existingRecommendation.regionBased.dev;
        firstMix = -1, secondMix = -1, thirdMix = -1;

        for (var i = 0; i < lcList.length; i++) {
            if (lcList[i][mix3Region] !== undefined) {
                thirdMix = i;
            }
            if (lcList[i][mix2Region] !== undefined) {
                secondMix = i;
            }
            if (lcList[i][mix1Region] !== undefined) {
                firstMix = i;
            }
        }

        if (thirdMix !== -1 && countRegionDev < countRegionCapDev) {
            let count3Region = lcList[thirdMix][mix3Region].length - 1;
            while (count3Region > 0) {
                let exists = reccom.find(item => item._id === lcList[thirdMix][mix3Region][count3Region]._id
                    && item.username === lcList[thirdMix][mix3Region][count3Region].username);
                if (!exists) {
                    reccom.push(lcList[thirdMix][mix3Region][count3Region]);
                    countRegionDev++;
                    if (countRegionDev >= countRegionCapDev) break;
                }
                count3Region--;
            }
        }
        if (secondMix !== -1 && countRegionDev < countRegionCapDev) {
            let count2Region = lcList[secondMix][mix2Region].length - 1;
            while (count2Region > 0) {
                let exists = reccom.find(item => item._id === lcList[secondMix][mix2Region][count2Region]._id
                    && item.username === lcList[secondMix][mix2Region][count2Region].username);
                if (!exists) {
                    reccom.push(lcList[secondMix][mix2Region][count2Region]);
                    countRegionDev++;
                    if (countRegionDev >= countRegionCapDev) break;
                }
                count2Region--;
            }
        }
        if (firstMix !== -1 && countRegionDev < countRegionCapDev) {
            let count1Region = lcList[firstMix][mix1Region].length - 1;
            while (count1Region > 0) {
                let exists = reccom.find(item => item._id === lcList[firstMix][mix1Region][count1Region]._id
                    && item.username === lcList[firstMix][mix1Region][count1Region].username);
                if (!exists) {
                    reccom.push(lcList[firstMix][mix1Region][count1Region]);
                    countRegionDev++;
                    if (countRegionDev >= countRegionCapDev) break;
                }
                count1Region--;
            }
        }

        countSkillsCapDev += (countRegionCapDev - countRegionDev);

        n = permutedSkills.length;
        lcListSkills = existingRecommendation.skillBased.dev;
        for (var i = 0; i < lcListSkills.length; i++) {
            for (var j = 0; j < n; j++) {
                if (lcListSkills[i][permutedSkills[j]] != undefined && countSkillsDev < countSkillsCapDev) {//1 => 2
                    let countSkill = lcListSkills[i][permutedSkills[j]].length - 1;
                    while (countSkill >= 0) {
                        let exists = reccom.find(item => item._id === lcListSkills[i][permutedSkills[j]][countSkill]._id
                            && item.username === lcListSkills[i][permutedSkills[j]][countSkill].username);
                        if (!exists) {
                            reccom.push(lcListSkills[i][permutedSkills[j]][countSkill]);
                            countSkillsDev++;
                            if (countSkillsDev >= countSkillsCapDev) break;
                        }
                        countSkill--;
                    }
                }
            }
        }

        randomUser += countSkillsCapDev - countSkillsDev;
        try{
        const userList = await user.find({});
        const len = userList.length;
        const mini = 0, maxi = len;
        while (randomUserCap != randomUser) {
            const rand = Math.floor(Math.random() * (maxi - mini + 1)) + mini;
            let obj = { _id: userList[rand]["_id"].toHexString(), username: userList[rand].username };
            let exists = reccom.find(item => item._id === obj._id && item.username === obj.username);
            if (!exists) {
                reccom.push(obj);
                randomUser++;
                if (randomUser == randomUserCap) break;
            }
        }
        }
        catch(err){
            console.log(err);
        }
    }
    else {
        let lcList = existingRecommendation.regionBased.dev;
        let firstMix = -1, secondMix = -1, thirdMix = -1;

        for (var i = 0; i < lcList.length; i++) {
            if (lcList[i][mix3Region] !== undefined) {
                thirdMix = i;
            }
            if (lcList[i][mix2Region] !== undefined) {
                secondMix = i;
            }
            if (lcList[i][mix1Region] !== undefined) {
                firstMix = i;
            }
        }

        if (thirdMix !== -1 && countRegion < countRegionCap) {
            let count3Region = lcList[thirdMix][mix3Region].length - 1;
            while (count3Region > 0) {
                let exists = reccom.find(item => item._id === lcList[thirdMix][mix3Region][count3Region]._id
                    && item.username === lcList[thirdMix][mix3Region][count3Region].username);
                if (!exists) {
                    reccom.push(lcList[thirdMix][mix3Region][count3Region]);
                    countRegion++;
                    if (countRegion > countRegionCap) break;
                }
                count3Region--;
            }
        }
        if (secondMix !== -1 && countRegion < countRegionCap) {
            let count2Region = lcList[secondMix][mix2Region].length - 1;
            while (count2Region > 0) {
                let exists = reccom.find(item => item._id === lcList[secondMix][mix2Region][count2Region]._id
                    && item.username === lcList[secondMix][mix2Region][count2Region].username);
                if (!exists) {
                    reccom.push(lcList[secondMix][mix2Region][count2Region]);
                    countRegion++;
                    if (countRegion > countRegionCap) break;
                }
                count2Region--;
            }
        }
        if (firstMix !== -1 && countRegion < countRegionCap) {
            let count1Region = lcList[firstMix][mix1Region].length - 1;
            while (count1Region > 0) {
                let exists = reccom.find(item => item._id === lcList[firstMix][mix1Region][count1Region]._id
                    && item.username === lcList[firstMix][mix1Region][count1Region].username);
                if (!exists) {
                    reccom.push(lcList[firstMix][mix1Region][count1Region]);
                    countRegion++;
                    if (countRegion > countRegionCap) break;
                }
                count1Region--;
            }
        }

        countSkillsCap += (countRegionCap - countRegion) + 1;
        let n = permutedSkills.length;
        let lcListSkills = existingRecommendation.skillBased.dev;
        for (var i = 0; i < lcListSkills.length; i++) {
            for (var j = 0; j < n; j++) {
                if (lcListSkills[i][permutedSkills[j]] != undefined && countSkills < countSkillsCap) {//1 => 2
                    let countSkill = lcListSkills[i][permutedSkills[j]].length - 1;
                    while (countSkill >= 0) {
                        let exists = reccom.find(item => item._id === lcListSkills[i][permutedSkills[j]][countSkill]._id
                            && item.username === lcListSkills[i][permutedSkills[j]][countSkill].username);
                        if (!exists) {
                            reccom.push(lcListSkills[i][permutedSkills[j]][countSkill]);
                            countSkills++;
                            if (countSkills > countSkillsCap) break;
                        }
                        countSkill--;
                    }
                }
            }
        }

        countRegionCapDev += (countSkillsCap - countSkills);
        lcList = existingRecommendation.regionBased.lc;
        firstMix = -1, secondMix = -1, thirdMix = -1;

        for (var i = 0; i < lcList.length; i++) {
            if (lcList[i][mix3Region] !== undefined) {
                thirdMix = i;
            }
            if (lcList[i][mix2Region] !== undefined) {
                secondMix = i;
            }
            if (lcList[i][mix1Region] !== undefined) {
                firstMix = i;
            }
        }

        if (thirdMix !== -1 && countRegionDev < countRegionCapDev) {
            let count3Region = lcList[thirdMix][mix3Region].length - 1;
            while (count3Region > 0) {
                let exists = reccom.find(item => item._id === lcList[thirdMix][mix3Region][count3Region]._id
                    && item.username === lcList[thirdMix][mix3Region][count3Region].username);
                if (!exists) {
                    reccom.push(lcList[thirdMix][mix3Region][count3Region]);
                    countRegionDev++;
                    if (countRegionDev >= countRegionCapDev) break;
                }
                count3Region--;
            }
        }
        if (secondMix !== -1 && countRegionDev < countRegionCapDev) {
            let count2Region = lcList[secondMix][mix2Region].length - 1;
            while (count2Region > 0) {
                let exists = reccom.find(item => item._id === lcList[secondMix][mix2Region][count2Region]._id
                    && item.username === lcList[secondMix][mix2Region][count2Region].username);
                if (!exists) {
                    reccom.push(lcList[secondMix][mix2Region][count2Region]);
                    countRegionDev++;
                    if (countRegionDev >= countRegionCapDev) break;
                }
                count2Region--;
            }
        }
        if (firstMix !== -1 && countRegionDev < countRegionCapDev) {
            let count1Region = lcList[firstMix][mix1Region].length - 1;
            while (count1Region > 0) {
                let exists = reccom.find(item => item._id === lcList[firstMix][mix1Region][count1Region]._id
                    && item.username === lcList[firstMix][mix1Region][count1Region].username);
                if (!exists) {
                    reccom.push(lcList[firstMix][mix1Region][count1Region]);
                    countRegionDev++;
                    if (countRegionDev >= countRegionCapDev) break;
                }
                count1Region--;
            }
        }

        countSkillsCapDev += (countRegionCapDev - countRegionDev);

        n = permutedSkills.length;
        lcListSkills = existingRecommendation.skillBased.lc;
        for (var i = 0; i < lcListSkills.length; i++) {
            for (var j = 0; j < n; j++) {
                if (lcListSkills[i][permutedSkills[j]] != undefined && countSkillsDev < countSkillsCapDev) {//1 => 2
                    let countSkill = lcListSkills[i][permutedSkills[j]].length - 1;
                    while (countSkill >= 0) {
                        let exists = reccom.find(item => item._id === lcListSkills[i][permutedSkills[j]][countSkill]._id
                            && item.username === lcListSkills[i][permutedSkills[j]][countSkill].username);
                        if (!exists) {
                            reccom.push(lcListSkills[i][permutedSkills[j]][countSkill]);
                            countSkillsDev++;
                            if (countSkillsDev >= countSkillsCapDev) break;
                        }
                        countSkill--;
                    }
                }
            }
        }

        randomUser += countSkillsCapDev - countSkillsDev;

        const userList = await user.find({});
        // console.log(userList)
        const len = userList.length;
        const mini = 0, maxi = len;
        while (randomUserCap != randomUser && reccom.length > 20) {
            const rand = Math.floor(Math.random() * (maxi - mini + 1)) + mini;
            // console.log(rand);
            let obj = { _id: userList[rand]["_id"].toHexString(), username: userList[rand].username };
            let exists = reccom.find(item => item._id === obj._id && item.username === obj.username);
            if (!exists) {
                reccom.push(obj);
                randomUser++;
                if (randomUser == randomUserCap) break;
            }
        }
    }
    res.status(200).json({ "msg": "Success", "reccom": reccom });
}

module.exports = { fetchReccomendation };