import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import '../FriendsPage/FriendsPage.css';
import axios from 'axios';

function FriendsPage() {
    const [typeOfPage, setTypeOfPage] = useState("find-friends");
    const [reccom, setReccom] = useState(null);
    const [flagReccom, setFlagReccom] = useState(0);
    const [flagReccom2, setFlagReccom2] = useState(false);
    const [reccomFull, setReccomFull] = useState([]);
    const [sendTo, setSendTo] = useState(null);
    const [userList, setUserList] = useState(null);
    const [reccomOnSearchLimit2, setReccomOnSearchLimit2] = useState(null);
    const [reccomFrontSearch, setReccomFrontSearch] = useState([]);
    const [waitListOwnFull, setWaitListOwnFull] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const username = await getOwnUsername();
                const user = await getProfile(username);
                getUsersList();
                setSendTo(user.sendTo);
                fetchReccomendations(user);
                getWaitList();

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {
        if (reccom !== null) {
            reccom.forEach((element) => {
                getUser(element.username, element._id, 1);
            });
        }
    }, [reccom]);
    useEffect(() => {
        if (reccomFull !== null && reccom !== null && reccomFull.length === reccom.length) {
            setFlagReccom(1);
        }
    }, [reccomFull, reccom]);
    useEffect(() => {
        const reccom2 = async () => {
            try {
                setReccomFrontSearch([]);
                // console.log("This is the test",reccomOnSearchLimit2);
                reccomOnSearchLimit2.forEach((element) => {
                    // console.log("Test",element.username);
                    getUser(element.username, element._id, 2);
                });

            } catch (error) {
                console.error('Error :', error);
            }
        };
        if (flagReccom2 === true) {
            reccom2();
        }
    }, [flagReccom2]);
    const getWaitList = async () => {
        try {
            const response = await axios.get('http://localhost:5123/api/getWaitList', {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            const waitList = response.data.waitList;
            for (let i = 0; i < waitList.length; i++) {
                getUser("", waitList[i], 3);
            }
        } catch (err) {
            console.log('Not Authenticated', err);
            throw err;
        }
    }
    const getUser = async (username, _id, set) => {
        try {
            const form = { username, _id };
            const response = await axios.post('http://localhost:5123/api/getProfileRemote', form, {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            const user = {
                name: response.data.user.name,
                region: response.data.user.region,
                pfp: response.data.user.pfp,
                skills: {
                    top3: response.data.user.skills.top3,
                },
                timeToCode: response.data.user.timeToCode,
                username: response.data.user.username,
                prefer: response.data.user.prefer,
                _id: response.data.user._id
            };
            if (reccom && reccomFull < reccom.length && set === 1) {
                setReccomFull(prevArray => [...prevArray, user]);
            }
            if (set === 2) {
                setReccomFrontSearch(prevArray => [...prevArray, user]);
            }
            if (set === 3) {
                setWaitListOwnFull(prevArray => [...prevArray, user]);
            }
        } catch (err) {
            console.log('Error fetching profile Remote:', err);
            throw err;
        }
    };

    const getOwnUsername = async () => {
        try {
            const response = await axios.get('http://localhost:5123/api/profile', {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            return response.data.username;
        } catch (err) {
            console.log('Not Authenticated', err);
            throw err;
        }
    };

    const getProfile = async (username) => {
        try {
            const form = { username };
            const response = await axios.post('http://localhost:5123/api/profileRemote', form, {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            const user = {
                name: response.data.user.name,
                links: response.data.user.links,
                region: response.data.user.region,
                _id: response.data.user._id,
                email: response.data.user.email,
                pfp: response.data.user.pfp,
                skills: {
                    top3: response.data.user.skills.top3,
                    normal: response.data.user.skills.normal,
                    top3short: response.data.user.skills.top3short
                },
                timeToCode: response.data.user.timeToCode,
                friends: response.data.user.friends,
                shortIntro: response.data.user.shortIntro,
                longIntro: response.data.user.longIntro,
                username: response.data.user.username,
                prefer: response.data.user.prefer,
                password: response.data.password,
                waitList: response.data.user.waitList,
                sendTo: response.data.user.sendTo
            };
            return user;
        } catch (err) {
            console.log('Error fetching profile:', err);
            throw err;
        }
    };

    const fetchReccomendations = async (user) => {
        if (!user) {
            console.log("Profile is null");
            return;
        }
        try {
            const form = { profile: user };
            const response = await axios.post('http://localhost:5123/api/fetchReccomendation', form, {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            setReccom(response.data.reccom);
        } catch (err) {
            console.log('Reccomendation Error');
        }
    };
    const checkIfSendTo = (remoteId) => {
        if (sendTo !== undefined) {
            let flag = false;
            sendTo.forEach((element) => {
                if (element === remoteId) {
                    flag = true;
                    return true;
                }
            });
            if (flag === true) return true;
            return false;
        }
    }
    const sendFriendReq = async (remoteId) => {
        try {
            const form = { _id: remoteId };
            const response = await axios.post('http://localhost:5123/api/sendFriendReq', form, {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            setSendTo(prevArray => [...prevArray, remoteId])
        } catch (err) {
            console.log('Sending Error');
        }
    }
    const handleInHousePage = (getPage) => {
        const element = document.querySelector(`.${getPage}`);
        if (element) {
            element.style.backgroundColor = "white";
            element.style.color = "black";
        }
        const prevElement = document.querySelector(`.${typeOfPage}`);
        if (prevElement) {
            prevElement.style.backgroundColor = "black";
            prevElement.style.color = "white";
        }
        setTypeOfPage(getPage);
    }
    const getUsersList = async () => {
        try {
            const response = await axios.get("http://localhost:5123/api/getUsersList", {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            setUserList(response.data.userList);
        } catch (err) {
            console.log('Sending Error');
        }
    }
    const editDistance = (S1, S2) => {
        let n = S1.length;
        let m = S2.length;

        let prev = new Array(m + 1).fill(0);
        let cur = new Array(m + 1).fill(0);

        for (let j = 0; j <= m; j++)prev[j] = j;
        for (let i = 1; i <= n; i++) {
            cur[0] = i;
            for (let j = 1; j <= m; j++) {
                if (S1[i - 1] === S2[j - 1]) cur[j] = prev[j - 1];
                else cur[j] = 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
            }
            prev = [...cur];
        }
        return cur[m];
    }
    const findSubString = (s1, s2) => {
        let score = 0;
        let i = 0, j = 0, n = s1.length, m = s2.length;
        let constScore = -1, prevI = -1;
        while (i < n && j < m) {
            if (s1[i] === s2[j]) {
                i++;
                j++;
                if (prevI === i - 1) constScore = constScore - 2;
                else constScore = -1;
                prevI = i;
                score += constScore;
            }
            else {
                i++;
            }
        }
        return score;
    }
    const handleChangeSearch = async (e) => {
        let searchString = e.target.value;
        if (searchString === "") setFlagReccom(1);
        else setFlagReccom(2);
        // console.log("this is the sign ",flagReccom);
        searchString = searchString.toLowerCase();
        let reccomOnSearch = []
        userList.forEach((item) => {
            let dist = editDistance(searchString, item["username"].toLowerCase());
            let score = 0;
            const tempScore = findSubString(item["username"].toLowerCase(), searchString);
            score += tempScore;
            if (searchString[0] === item["username"].toLowerCase()[0]) {
                reccomOnSearch.push({ "username": item["username"], "score": score })
            }
            else reccomOnSearch.push({ "username": item["username"], "score": score + dist })
        })
        reccomOnSearch.sort((a, b) => a.score - b.score);
        let reccomOnSearchLimit = [];
        for (var i = 0; i < reccomOnSearch.length; i++) {
            reccomOnSearchLimit.push(reccomOnSearch[i]);
            if (reccomOnSearchLimit.length === 5) break;
        }
        setFlagReccom2(false);
        await setReccomOnSearchLimit2(reccomOnSearchLimit);
        setFlagReccom2(true);
        // console.log("This is Reccom On Search : ", reccomOnSearchLimit,flagReccom);
    }
    const handleEnterSearch = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    }
    const handleClickSearch = (username) => {
        let index = 0;
        for (let i = 0; i < reccomFrontSearch.length; i++) {
            if (reccomFrontSearch[i].username === username) {
                index = i;
                break;
            }
        }
        setReccomFrontSearch([reccomFrontSearch[index]]);
        setFlagReccom(2);
    }
    const acceptFriendReq = async (_id, accept, userEle) => {
        try {
            const form = { _id: _id, accept: accept };
            const response = await axios.post('http://localhost:5123/api/acceptFriendReq', form, {
                headers: {
                    'Content-type': 'application/json'
                },
                withCredentials: true
            });
            const filteredData = waitListOwnFull.filter(item => item !== userEle);
            setWaitListOwnFull(filteredData);
        } catch (err) {
            console.log('Sending Error');
        }
    }
    return (
        <div>
            <Navbar />
            <div className="outer">
                <div className="left">
                    <div className="friends">Friends Section</div>
                    <div className="find-friends" onClick={() => { handleInHousePage("find-friends") }}>Find Friends</div>
                    <div className="accept-friends" onClick={() => { handleInHousePage("accept-friends") }}>Accept Friends</div>
                    <div className="chatbot" onClick={() => { handleInHousePage("chatbot") }}>ChatBot</div>
                    <div className="settings" onClick={() => { handleInHousePage("settings") }}>Settings</div>
                </div>
                <div className="right">
                    {
                        typeOfPage === "find-friends" ? (<>
                            <div className="dropdown custom-dropdown-menu1">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="inputSearch"
                                    onChange={handleChangeSearch}
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    onKeyDown={handleEnterSearch}
                                />

                                <div className="dropdown-menu custom-dropdown-menu2" id="dropdown1" aria-labelledby="inputSearch">
                                    {flagReccom === 2 && reccomOnSearchLimit2.map((element, index) => (
                                        <div key={index} className="dropdown-item" onClick={() => { handleClickSearch(element.username) }}>{element.username}</div>
                                    ))}
                                </div>
                            </div>


                            <div className="reccom-container">
                                {flagReccom === 1 && reccomFull !== null &&
                                    reccomFull.map((element, index) => (
                                        <div key={index} className="outer-friend-div">
                                            <div>
                                                <img src={element.pfp} alt="" className='pfp-image' />
                                            </div>
                                            <a className="element-name" href={`/profile/${element.username}`} target="_blank">{element.username}</a>
                                            <div className="element-uname">Hello this is {element.name}</div>
                                            <div className="element-prefer">I Prefer {element.prefer.toUpperCase() === "DEVELOPMENT" ? "Dev" : "DSA"} More.</div>
                                            <div className="element-skills">My Top Skills Are <br />{element.skills.top3[0]},{element.skills.top3[1]},{element.skills.top3[2]}</div>
                                            <div className="element-region">{element.region.city} {element.region.state} {element.region.country}</div>
                                            {
                                                checkIfSendTo(element._id) === true ?
                                                    <div className="element-request btn btn-secondary">Requested</div> :
                                                    <div className="element-request btn btn-primary" onClick={() => { sendFriendReq(element._id) }}>Send Request</div>
                                            }

                                        </div>
                                    ))
                                }
                                {flagReccom === 2 && reccomFrontSearch !== null &&
                                    reccomFrontSearch.map((element, index) => (
                                        <div key={index} className="outer-friend-div">
                                            <div>
                                                <img src={element.pfp} alt="" className='pfp-image' />
                                            </div>
                                            <a className="element-name" href={`/profile/${element.username}`} target="_blank">{element.username}</a>
                                            <div className="element-uname">Hello this is {element.name}</div>
                                            <div className="element-ttc">I Prefer coding at {element.timeToCode}</div>
                                            <div className="element-prefer">I Prefer {element.prefer.toUpperCase()} More.</div>
                                            <div className="element-skills">My Top Skills Are <br />{element.skills.top3[0]},{element.skills.top3[1]},{element.skills.top3[2]}</div>
                                            <div className="element-region">{element.region.city} {element.region.state} {element.region.country}</div>
                                            {
                                                checkIfSendTo(element._id) === true ?
                                                    <div className="element-request btn btn-secondary">Requested</div> :
                                                    <div className="element-request btn btn-primary" onClick={() => { sendFriendReq(element._id) }}>Send Request</div>
                                            }

                                        </div>
                                    ))
                                }
                            </div>
                        </>) : null
                    }
                    <div className="accept-friends-page">
                        {
                            typeOfPage === "accept-friends" && (
                                <>
                                    <div className="reccom-container">
                                        {waitListOwnFull && waitListOwnFull.map((element, index) => (
                                            <div key={index} className="outer-friend-div">
                                                <div>
                                                    <img src={element.pfp} alt="" className='pfp-image' />
                                                </div>
                                                <a className="element-name" href={`/profile/${element.username}`} target="_blank">{element.username}</a>
                                                <div className="element-uname">Hello this is {element.name}</div>
                                                <div className="element-prefer">I Prefer {element.prefer.toUpperCase()} More.</div>
                                                <div className="element-skills">My Top Skills Are <br />{element.skills.top3[0]},{element.skills.top3[1]},{element.skills.top3[2]}</div>
                                                <div className="element-region">{element.region.city} {element.region.state} {element.region.country}</div>
                                                <div className="element-request-accept btn btn-success" onClick={() => { acceptFriendReq(element._id, "accepted", element) }}>Accpept</div>
                                                <div className="element-request-reject btn btn-danger" onClick={() => { acceptFriendReq(element._id, "reject", element) }}>Reject</div>
                                            </div>
                                            // <div></div>
                                        ))}
                                    </div>
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FriendsPage;