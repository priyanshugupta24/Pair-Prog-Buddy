import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import '../FriendsPage/FriendsPage.css';
import axios from 'axios';

function FriendsPage() {
    const [typeOfPage, setTypeOfPage] = useState("find-friends");
    const [reccom, setReccom] = useState(null);
    const [flagReccom, setFlagReccom] = useState(false);
    const [reccomFull, setReccomFull] = useState([]);
    const [sendTo, setSendTo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const username = await getOwnUsername();
                const user = await getProfile(username);
                setSendTo(user.sendTo);
                fetchReccomendations(user);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (reccom !== null) {
            reccom.forEach((element) => {
                getUser(element.username, element._id);
            });
        }
    }, [reccom]);

    useEffect(() => {
        if (reccomFull !== null && reccom !== null && reccomFull.length === reccom.length) {
            setFlagReccom(true);
        }
    }, [reccomFull, reccom]);

    const getUser = async (username, _id) => {
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
            if (reccomFull < reccom.length) {
                setReccomFull(prevArray => [...prevArray, user]);
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
                            <div className="search-bar"><input type="text" name="" id="" /></div>
                            <div className="reccom-container">
                                {flagReccom && reccomFull !== null &&
                                    reccomFull.map((element, index) => (
                                        <div key={index} className="outer-friend-div">
                                            <div><img src={element.pfp} alt="" className='pfp-image' /></div>
                                            <div className="element-name">{element.username}</div>
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
                </div>
            </div>
        </div>
    );
}

export default FriendsPage;
