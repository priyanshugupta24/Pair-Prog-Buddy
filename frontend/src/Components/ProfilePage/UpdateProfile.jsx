import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from "axios";
import "./UpdateProfile.css";
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { firebaseConfig } from "../../Config/firebase.config.js";
import { countrystatecityConfig } from "../../Config/countrystatecity.config.js"
import { skills } from "../ProfilePage/skills.manual.js"
import { useNavigate } from 'react-router-dom';

const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage(app);

function UpdateProfile() {
    let { profileId } = useParams();
    const navigate = useNavigate();

    const [prevCsc,setPrevCsc] = useState({
        country : "",
        state : "",
        city : "",
        iso2Country : "",
        iso2State : ""
    }) 
    const [prevSkills,setPrevSkills] = useState({
        top3short : []
    });
    const [prevPrefer,setPrevPrefer] = useState();
    const [ownUsername, setOwnUsername] = useState("");
    const [countries, setCountries] = useState([{
        name: "",
    }]);
    const [states, setStates] = useState([{
        name: "",
        iso2 : ""
    }]);
    const [city, setCity] = useState([{
        name: "",
    }]);
    const [profile, setProfile] = useState({
        name: "",
        pfp: "",
        friends: [],
        region: {
            country: "",
            state: "",
            city: "",
            iso2Country: "",
            iso2State : ""
        },
        links: {
            github: "",
            linkedin: "",
            twitter: "",
            resume: "",
            leetcode: "",
        },
        shortIntro: "",
        longIntro: "",
        timeToCode: "",
        skills: {
            top3: ["", " "],
            normal: [],
            top3short : []
        },
        username: profileId,
        prefer: "",
        email : "",
    });

    useEffect(()=>{
        console.log("This is Previous Prefer : ",prevPrefer)
    },[prevPrefer])
    useEffect(() => {
        getProfile();
        getOwnUsername();
        loadCountries();
    }, []);

    const getOwnUsername = async () => {
        try {
            const response = await axios.get('http://localhost:5123/api/profile', {
                headers: {
                    "Content-type": "application/json"
                },
                withCredentials: true,
            });
            setOwnUsername(response.data.username);
        } catch (err) {
            console.log("Not Authenticated");
        }
    }
    const getProfile = async () => {
        try {
            const form = {
                username: profileId,
            }
            const response = await axios.post("http://localhost:5123/api/profileRemote", form, {
                headers: {
                    "Content-type": "application/json"
                },
                withCredentials: true,
            });
            const user = {
                name: response.data.name,
                links: response.data.user.links,
                region: response.data.user.region,
                _id: response.data.user._id,
                name: response.data.user.name,
                username: response.data.user.username,
                email: response.data.user.email,
                pfp: response.data.user.pfp,
                skills: {
                    top3: response.data.user.skills.top3,
                    normal: response.data.user.skills.normal,
                    top3short : response.data.user.skills.top3short,
                },
                timeToCode: response.data.user.timeToCode,
                friends: response.data.user.friends,
                shortIntro: response.data.user.shortIntro,
                longIntro: response.data.user.longIntro,
                username: response.data.user.username,
                prefer: response.data.user.prefer,
                password : response.data.password,
                waitList : response.data.waitList,
            }
            setPrevCsc({
                country : response.data.user.region.country,
                state : response.data.user.region.state,
                city : response.data.user.region.city,
                iso2Country : response.data.user.region.iso2Country,
                iso2State : response.data.user.region.iso2State,
            });
            //   console.log(user)
            setProfile(user);
            setPrevSkills({top3short : response.data.user.skills.top3short});
            setPrevPrefer(response.data.user.prefer);
            // console.log("This is ",response.data.user.prefer)
            // console.log("This is ",prevPrefer)
            // console.log("This is 2 ",response.data.user.skills.top3short);
            // console.log("This is 2 ",prevSkills);
        } catch (err) {
            console.log("Not Authenticated");
        }
    }
    const handleChangeLinks = (e, ele) => {
        const { value } = e.target;
        setProfile({
            ...profile,
            links: {
                ...profile.links,
                [ele]: value
            }
        })
        // console.log(profile);
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log(profile)
        try {
            
            const response = await axios.post("http://localhost:5123/api/saveProfile", {
                profile:profile,
                prev : prevCsc,
                prevSkills : prevSkills,
                prevPrefer : prevPrefer,
            }, {
              headers: {
                "Content-type": "application/json"
              },
              withCredentials: true,
            });
            console.log('Response:', response.data);
            navigate(`/profile/${profileId}`)
            // history.push();
          } catch (error) {
            console.error('Error:', error);
        }
    }
    const handlePfpUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const uploadTask = storage.ref(`/PFP's/${profile._id}`).put(selectedFile);
            uploadTask.on('state_changed',
                (snapShot) => {
                    // You can handle progress here if needed
                },
                (err) => {
                    // console.log(err); // Handle errors
                },
                () => {
                    storage.ref("PFP's").child(profile._id).getDownloadURL()
                        .then(fireBaseUrl => {
                            // console.log(fireBaseUrl);
                            setProfile({
                                ...profile,
                                pfp: fireBaseUrl
                            });
                            // console.log(profile)
                        })
                        .catch(error => {
                            // console.log(error); // Handle errors
                        });
                }
            );
        }
    };
    const handleShortIntro = (e) => {
        const inputValue = e.target.value;
        const words = inputValue.trim().split(/\s+/);
        if (words.length <= 30) {
            setProfile({ ...profile, shortIntro: inputValue });
        }
        // console.log(profile.shortIntro)
    }
    const handleLongIntro = (e) => {
        const inputValue = e.target.value;
        setProfile({ ...profile, longIntro: inputValue });
        // console.log(profile.longIntro)
    }
    const handleTimeToCode = (e, ele) => {
        e.preventDefault();
        setProfile({
            ...profile,
            timeToCode: ele
        })
        // console.log(profile.timeToCode);
    }
    const handlePrefer = (e, ele) => {
        e.preventDefault();
        setProfile({
            ...profile,
            prefer: ele
        })
    }
    const loadCountries = () => {
        var headers = new Headers();
        headers.append("X-CSCAPI-KEY", countrystatecityConfig.cKEY);

        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        fetch("https://api.countrystatecity.in/v1/countries", requestOptions)
            .then(response => response.text())
            .then(result => {
                // console.log(result)
                result = JSON.parse(result)
                // console.log(typeof result)
                setCountries(result);
            })
            .catch(error => console.log('error', error));
        // console.log(countries);
    }
    // Comment Here
    // useEffect(() => { console.log("THIS",profile) }, [profile.region.state])
    const handleCountryChange = (e, selectedCountry, iso2) => {
        e.preventDefault();
        setProfile(prevProfile => ({
            ...prevProfile,
            region: {
                country: selectedCountry,
                iso2Country : iso2
            }
        }));
    };
    
    useEffect(() => {
        if (profile.region.country) {
            // console.log(profile.region.iso2);
            loadStateByISO2();
        }
    }, [profile.region.country]);
    
    const loadStateByISO2 = () => {
        var headers = new Headers();
        headers.append("X-CSCAPI-KEY", countrystatecityConfig.cKEY);

        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };
        // console.log("THis is",iso2)
        // console.log("THis is 2",profile.region.iso2)
        fetch(`https://api.countrystatecity.in/v1/countries/${profile.region.iso2Country}/states`, requestOptions)
            .then(response => response.text())
            .then(result => {
                // console.log(result)
                result = JSON.parse(result)
                // console.log(typeof result)
                setStates(result);
            })
            // .catch(error => console.log('error', error));
    }
    const handleStateChange = (e, selectedState,iso2) => {
        e.preventDefault();
        setProfile({
            ...profile,
            region: {
                ...profile.region,
                state: selectedState,
                iso2State: iso2
            }
        })
        // console.log(profile.region.state)
    }
    useEffect(() => {
        if (profile.region.state) {
            // console.log(profile.region.iso2);
            loadCityByISO2();
        }
    }, [profile.region.state]);
    const loadCityByISO2 = () => {
        var headers = new Headers();
        headers.append("X-CSCAPI-KEY", countrystatecityConfig.cKEY);

        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };
        
        fetch(`https://api.countrystatecity.in/v1/countries/${profile.region.iso2Country}/states/${profile.region.iso2State}/cities`, requestOptions)
        .then(response => response.text())
        .then(result => {
            // console.log(result)
            result = JSON.parse(result)
            // console.log(typeof result)
            setCity(result);
        })
        // .catch(error => console.log('error', error));
    }
    const handleCityChange = (e, selectedCity) => {
        e.preventDefault();
        setProfile({
            ...profile,
            region: {
                ...profile.region,
                city: selectedCity,
            }
        })
        // console.log(profile.region.state)
    }
    const handleTop3Add = (name,short) => {
        if(profile.skills.top3.length < 3){
            setProfile(prevProfile => ({
                ...prevProfile,
                skills: {
                    ...prevProfile.skills,
                    top3: [...prevProfile.skills.top3, name],
                    top3short : [...prevProfile.skills.top3short, short]
                }
            }));
        }
    }
    const handleSkillsAdd = (name) =>{
        // console.log(name)
        setProfile(prevProfile => ({
            ...prevProfile,
            skills: {
                ...prevProfile.skills,
                normal: [...prevProfile.skills.normal, name],            }
        }));
    }
    const handleSkillsRemove = (name) =>{
        // console.log(name)
        setProfile(prevProfile => ({
            ...prevProfile,
            skills: {
                ...prevProfile.skills,
                normal: prevProfile.skills.normal.filter(element => element !== name)
            }
        }));
        // console.log(name)
    }
    // useEffect(()=>{
    //     console.log(profile)
    // },[profile]);
    function getShortFromName(name) {
        const foundSkill = skills.find(skill => skill.name === name);
        if (foundSkill) {
            return foundSkill.short;
        } else {
            return null; // or any default value you prefer if the skill name is not found
        }
    }
    const handleTop3Remove = (name) => {
        setProfile(prevProfile => {
            const shortSkills = getShortFromName(name);
            console.log(shortSkills);
            const updatedTop3 = prevProfile.skills.top3.filter(skill => skill !== name);
            const updatedTop3Short = prevProfile.skills.top3short.filter(skill => skill !== shortSkills);
            return {
                ...prevProfile,
                skills: {
                    ...prevProfile.skills,
                    top3: updatedTop3,
                    top3short: updatedTop3Short
                }
            };
        });
    }
    return (
        <div style={{ color: "white" }}>
            {/* <button onClick={loadStateByISO2}>CLK2</button> */}
            {/* <button onClick={()=>{
                console.log(states[0].name)
            }}>CLK3</button> */}
            {ownUsername === profileId ? (
                <>
                    {/* username* pfp* region shortIntro links top3-skills skills longIntro timeToCode subscription */}
                    <form action="" onSubmit={handleSubmit}>
                        <div className="container-form">
                            <div className="container-inner">
                                <div className="form-title">Hello {profile.name}</div>
                                <div className="enter-ele">Upload a PFP</div>
                                <a href={profile.pfp} target="_blank">Click To Check Selected PFP</a>
                                <div className="form-group1">
                                    <label htmlFor="pfp-select"><svg style={{ color: "white", height: "2vw" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M448 80c8.8 0 16 7.2 16 16V415.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" fill="white"></path></svg></label>
                                    <label htmlFor="pfp-select"><div className="pfp-btn"><div className="pfp-btn-text">Select A PFP of Your Choice</div></div></label>
                                    <input type="file" name="pfp-select" id="pfp-select" onChange={handlePfpUpload} className="pfp" />
                                </div>
                                <div className="enter-ele">Select Country</div>
                                <div className="dropdown custom-dropdown-menu1">
                                    <button className="btn btn-secondary dropdown-toggle ddmp" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {profile.region.country === "" ? <span className="dropdown-text">Select Your Country</span> : <span className="dropdown-text">{profile.region.country}</span>}
                                    </button>
                                    <div className="dropdown-menu custom-dropdown-menu2" id="dropdown1" aria-labelledby="dropdownMenuButton">
                                        {
                                            countries.map((elements, index) => (
                                                <div key={index} className="dropdown-item" onClick={(e) => handleCountryChange(e, elements.name, elements.iso2)}>{elements.name}</div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="enter-ele">Select State</div>
                                <div className="dropdown custom-dropdown-menu1">
                                    <button className="btn btn-secondary dropdown-toggle ddmp" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {profile.region.state === "" ? <span className="dropdown-text">Select Your State</span> : <span className="dropdown-text">{profile.region.state}</span>}
                                    </button>
                                    <div className="dropdown-menu custom-dropdown-menu2" id="dropdown1" aria-labelledby="dropdownMenuButton">
                                        {
                                            Array.isArray(states) && states.map((elements, index) => (
                                                    <div key={index} className="dropdown-item" onClick={(e)=>{handleStateChange(e,elements.name,elements.iso2)}}>{elements.name}</div>
                                                ))
                                        }
                                    </div>
                                </div>
                                <div className="enter-ele">Select City</div>
                                <div className="dropdown custom-dropdown-menu1">
                                    <button className="btn btn-secondary dropdown-toggle ddmp" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {profile.region.city === "" ? <span className="dropdown-text">Select Your City</span> : <span className="dropdown-text">{profile.region.city}</span>}
                                    </button>
                                    <div className="dropdown-menu custom-dropdown-menu2" id="dropdown1" aria-labelledby="dropdownMenuButton">
                                        {
                                            Array.isArray(city) && city.map((elements, index) => (
                                                    <div key={index} className="dropdown-item" onClick={(e)=>{handleCityChange(e,elements.name)}}>{elements.name}</div>
                                                ))
                                        }
                                    </div>
                                </div>
                                <div className="enter-ele">Write a Short Intro that is Reflected  on Your Profile.</div>
                                <div className="form-group1">
                                    <label htmlFor="shortintro"><svg style={{ color: "white", height: "2vw", marginRight: "1vw" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" fill="white"></path></svg></label>
                                    <textarea
                                        value={profile.shortIntro}
                                        onChange={handleShortIntro}
                                        placeholder={`Enter a (limit: ${20} words)`}
                                        rows={4}
                                        cols={50}
                                        className="short-intro"
                                        id="shortintro"
                                    />

                                </div>
                                <div className="enter-ele"> Enter Github Link</div>
                                <div className="form-group1">
                                    <label htmlFor="github" id="label"><svg style={{ color: "white", height: "2vw" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM277.3 415.7c-8.4 1.5-11.5-3.7-11.5-8 0-5.4.2-33 .2-55.3 0-15.6-5.2-25.5-11.3-30.7 37-4.1 76-9.2 76-73.1 0-18.2-6.5-27.3-17.1-39 1.7-4.3 7.4-22-1.7-45-13.9-4.3-45.7 17.9-45.7 17.9-13.2-3.7-27.5-5.6-41.6-5.6-14.1 0-28.4 1.9-41.6 5.6 0 0-31.8-22.2-45.7-17.9-9.1 22.9-3.5 40.6-1.7 45-10.6 11.7-15.6 20.8-15.6 39 0 63.6 37.3 69 74.3 73.1-4.8 4.3-9.1 11.7-10.6 22.3-9.5 4.3-33.8 11.7-48.3-13.9-9.1-15.8-25.5-17.1-25.5-17.1-16.2-.2-1.1 10.2-1.1 10.2 10.8 5 18.4 24.2 18.4 24.2 9.7 29.7 56.1 19.7 56.1 19.7 0 13.9.2 36.5.2 40.6 0 4.3-3 9.5-11.5 8-66-22.1-112.2-84.9-112.2-158.3 0-91.8 70.2-161.5 162-161.5S388 165.6 388 257.4c.1 73.4-44.7 136.3-110.7 158.3zm-98.1-61.1c-1.9.4-3.7-.4-3.9-1.7-.2-1.5 1.1-2.8 3-3.2 1.9-.2 3.7.6 3.9 1.9.3 1.3-1 2.6-3 3zm-9.5-.9c0 1.3-1.5 2.4-3.5 2.4-2.2.2-3.7-.9-3.7-2.4 0-1.3 1.5-2.4 3.5-2.4 1.9-.2 3.7.9 3.7 2.4zm-13.7-1.1c-.4 1.3-2.4 1.9-4.1 1.3-1.9-.4-3.2-1.9-2.8-3.2.4-1.3 2.4-1.9 4.1-1.5 2 .6 3.3 2.1 2.8 3.4zm-12.3-5.4c-.9 1.1-2.8.9-4.3-.6-1.5-1.3-1.9-3.2-.9-4.1.9-1.1 2.8-.9 4.3.6 1.3 1.3 1.8 3.3.9 4.1zm-9.1-9.1c-.9.6-2.6 0-3.7-1.5s-1.1-3.2 0-3.9c1.1-.9 2.8-.2 3.7 1.3 1.1 1.5 1.1 3.3 0 4.1zm-6.5-9.7c-.9.9-2.4.4-3.5-.6-1.1-1.3-1.3-2.8-.4-3.5.9-.9 2.4-.4 3.5.6 1.1 1.3 1.3 2.8.4 3.5zm-6.7-7.4c-.4.9-1.7 1.1-2.8.4-1.3-.6-1.9-1.7-1.5-2.6.4-.6 1.5-.9 2.8-.4 1.3.7 1.9 1.8 1.5 2.6z" fill="white"></path></svg></label>
                                    <input type="text" placeholder='Github Link' id="github" name="github" autoComplete='off' value={profile.links.github} onChange={(e) => handleChangeLinks(e, "github")} />
                                </div>
                                <div className="enter-ele"> Enter Leetcode Link</div>
                                <div className="form-group1">
                                    <label htmlFor="leetcode" id="label"><svg style={{ color: "white", height: "2vw" }} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>LeetCode</title><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" fill="white"></path></svg></label>
                                    <input type="text" placeholder='Leetcode Link' id="leetcode" name="leetcode" autoComplete='off' value={profile.links.leetcode} onChange={(e) => handleChangeLinks(e, "leetcode")} />
                                </div>
                                <div className="enter-ele"> Enter LinkedIn Link</div>
                                <div className="form-group1">
                                    <label htmlFor="linkedin" id="label"><svg style={{ color: "white", height: "2vw" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" fill="white"></path></svg></label>
                                    <input type="text" placeholder='Linkedin Link' id="linkedin" name="linkedin" autoComplete='off' value={profile.links.linkedin} onChange={(e) => handleChangeLinks(e, "linkedin")} />
                                </div>
                                <div className="enter-ele"> Enter Twitter Link</div>
                                <div className="form-group1">
                                    <label htmlFor="twitter" id="label"><svg style={{ color: "white", height: "2vw" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" fill="white"></path></svg></label>
                                    <input type="text" placeholder='Twitter Link' id="twitter" name="twitter" autoComplete='off' value={profile.links.twitter} onChange={(e) => handleChangeLinks(e, "twitter")} />
                                </div>
                                <div className="enter-ele"> Enter Resume Link</div>
                                <div className="form-group1">
                                    <label htmlFor="resume" id="label"><svg style={{ color: "white", height: "2vw" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>ionicons-v5-n</title><rect x="96" y="112" width="96" height="96" rx="16" ry="16" style={{ fill: "none" }}></rect><path d="M468,112H416V416a32,32,0,0,0,32,32h0a32,32,0,0,0,32-32V124A12,12,0,0,0,468,112Z" fill="white"></path><path d="M431.15,477.75A64.11,64.11,0,0,1,384,416V44a12,12,0,0,0-12-12H44A12,12,0,0,0,32,44V424a56,56,0,0,0,56,56H430.85a1.14,1.14,0,0,0,.3-2.25ZM96,208V112h96v96ZM320,400H96V368H320Zm0-64H96V304H320Zm0-64H96V240H320Zm0-64H224V176h96Zm0-64H224V112h96Z" fill="white"></path></svg></label>
                                    <input type="text" placeholder='Resume Link' id="resume" name="resume" autoComplete='off' value={profile.links.resume} onChange={(e) => handleChangeLinks(e, "resume")} />
                                </div>
                                
                                <div className="enter-ele"> Enter Your Top 3 Skills</div>
                                <div className="skill-box">
                                    {
                                        profile.skills.top3.length === 0?<div>Currently No Skills.Add Skills!!</div>:
                                        profile.skills.top3.sort((a, b) => a.length - b.length).map((element,index)=>(<div className="top3-skill-outer" key={index}>
                                            <div className="top3-skill">{element}</div>
                                            <div className="cross-skill" onClick={()=>{handleTop3Remove(element)}}>x</div>
                                        </div>))
                                    }
                                </div>
                                <div className="dropdown custom-dropdown-menu1">
                                    <button className="btn btn-secondary dropdown-toggle ddmp" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <span className="dropdown-text">Select Your Top3 Skills</span>
                                    </button>
                                    <div className="dropdown-menu custom-dropdown-menu2" id="dropdown1" aria-labelledby="dropdownMenuButton">
                                        {
                                            Array.isArray(skills) && skills.map((elements, index) => (
                                                <div key={index} className="dropdown-item" onClick={()=>{handleTop3Add(elements.name,elements.short)}}>{elements.name}</div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="enter-ele"> Enter Your Skills</div>
                                <div className="skill-box">
                                    {
                                        Array.isArray(profile.skills.top3) && profile.skills.top3.length === 0?<div>Currently No Skills.Add Skills!!</div>:
                                        profile.skills.normal.sort((a, b) => a.length - b.length).map((element,index)=>(<div key={index} className="top3-normal-outer">
                                            <div className="top3-skill">{element}</div>
                                            <div className="cross-skill" onClick={()=>{handleSkillsRemove(element)}}>x</div>
                                        </div>))
                                    }
                                </div>
                                <div className="dropdown custom-dropdown-menu1">
                                    <button className="btn btn-secondary dropdown-toggle ddmp" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <span className="dropdown-text">Select Your Skills</span>
                                    </button>
                                    <div className="dropdown-menu custom-dropdown-menu2" id="dropdown1" aria-labelledby="dropdownMenuButton">
                                        {
                                            Array.isArray(skills) && skills.map((elements, index) => (
                                                <div key={index} className="dropdown-item" onClick={()=>{handleSkillsAdd(elements.name)}}>{elements.name}</div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="enter-ele">Write Something About Yourself.</div>
                                <div className="form-group1">
                                    <label htmlFor="shortintro"><svg style={{ color: "white", height: "2vw", marginRight: "1vw" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" fill="white"></path></svg></label>
                                    <textarea
                                        value={profile.longIntro}
                                        rows={10}
                                        cols={50}
                                        onChange={handleLongIntro}
                                        className="short-intro"
                                    />
                                </div>
                                <div className="enter-ele">Select Your Comfort Coding Time</div>
                                <div className="dropdown custom-dropdown-menu1">
                                    <button className="btn btn-secondary dropdown-toggle ddmp" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {profile.timeToCode === "" ? <span className="dropdown-text">Select Your Comfort Coding Time</span> : <span className="dropdown-text">Your Prefered Time Is {profile.timeToCode}</span>}
                                    </button>
                                    <div className="dropdown-menu custom-dropdown-menu2" aria-labelledby="dropdownMenuButton">
                                        <div className="dropdown-item" onClick={(e) => { handleTimeToCode(e, "morning") }}>Early Bird Morning</div>
                                        <div className="dropdown-item" onClick={(e) => { handleTimeToCode(e, "noon") }}>Noontime Nocturne</div>
                                        <div className="dropdown-item" onClick={(e) => { handleTimeToCode(e, "evening") }}>Evening Awakening</div>
                                        <div className="dropdown-item" onClick={(e) => { handleTimeToCode(e, "night") }}>Night Owl</div>
                                    </div>
                                </div>
                                <div className="enter-ele">Select Your Prefrence</div>
                                <div className="dropdown custom-dropdown-menu1">
                                    <button className="btn btn-secondary dropdown-toggle ddmp" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {profile.prefer === "" ? <span className="dropdown-text">Select Your Prefrence</span> : <span className="dropdown-text">Your Prefrence Is {profile.prefer}</span>}
                                    </button>
                                    <div className="dropdown-menu custom-dropdown-menu2" aria-labelledby="dropdownMenuButton">
                                        <div className="dropdown-item" onClick={(e) => { handlePrefer(e, "development") }}>Development</div>
                                        <div className="dropdown-item" onClick={(e) => { handlePrefer(e, "dsa") }}>Data Structures And Algorithms</div>
                                    </div>
                                </div>

                                <input type="submit" value="Update Profile" className="btn btn-outline-primary submit" style={{color:"white"}}/>
                            </div>
                        </div>
                    </form>
                </>) : null}
        </div>
    )
}

export default UpdateProfile;