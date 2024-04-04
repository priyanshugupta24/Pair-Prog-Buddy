import React, { useState, useEffect } from 'react'
import Navbar from '../Navbar/Navbar'
import "./ProfilePage.css"
import { useParams } from 'react-router-dom';
import axios from "axios";
import { NavLink } from 'react-router-dom';

function ProfilePage() {
  let { profileId } = useParams();

  const [ownUsername, setOwnUsername] = useState("");
  const [profile, setProfile] = useState({
    pfp: "",
    friends: [],
    region: {
      country: "",
      state: "",
      city: ""
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
      normal: ["", " "]
    },
    username: profileId,
  });
  
  useEffect(() => {
    getProfile();
    getOwnUsername();
  }, []);

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
        links: response.data.user.links,
        region: response.data.user.region,
        _id: response.data.user._id,
        name: response.data.user.name,
        username: response.data.user.username,
        email: response.data.user.email,
        pfp: response.data.user.pfp,
        skills: {
          top3: response.data.user.skills.top3,
          normal: response.data.user.skills.normal
        },
        timeToCode: response.data.user.timeToCode,
        friends: response.data.user.friends,
        shortIntro: response.data.user.shortIntro,
        longIntro: response.data.user.longIntro,
        username: response.data.user.username
      }
      setProfile(user);
    } catch (err) {
      console.log("Not Authenticated");
    }
  }
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
  return (
    <div>
      <Navbar />
      <div className="outer-profile-div">
        <div className="" id="profile-container1">
          <img src={profile.pfp} alt="" className="profile-pfp" />
          <div className="profile-info">
            <div className="profile-info-title">Profile Info</div>
            <div className="profile-info-body">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>Name : {profile.name}</div>
                <div>Username : {profile.username}</div>
                <div>Unique Id : {profile._id}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div>Number Of Friends : {profile.friends.length}</div>
                <div style={{ marginLeft: "2vw" }}>Favourable Time To Code : {profile.timeToCode}</div>
              </div>
              <div>Region : {profile.region.city} , {profile.region.state} , {profile.region.country}</div>
              <div>Short Intro : {profile.shortIntro}</div>
            </div>
          </div>
        </div>
        <div className="" id="profile-container2">
          <div className="profile-links">
            <div className="profile-info-title">Links</div>
            <div className="profile-links-body">
              <a href={profile.links.github} target="_blank">Github</a>
              <a href={profile.links.twitter} target="_blank">Twitter</a  >
              <a href={profile.links.resume} target="_blank">Resume</a>
              <a href={profile.links.linkedin} target="_blank">LinkedIn</a>
              <a href={profile.links.leetcode} target="_blank">Leetcode</a>
            </div>
          </div>
        </div>
      </div>
      <div className="" id="profile-container3">
        <div className="profile-long-intro">
          <div className="container3-intro">Long Intro</div>
          <div className="container3-body">{profile.longIntro}</div>
        </div>
      </div>
      <div className="" id="profile-container3">
        <div className="profile-long-intro">
          <div className="container3-intro">Skills</div>
          <div className="topskills-container">
            {profile.skills.top3.sort((a, b) => a.length - b.length).map((item, index) => (
              <div key={index} className="topskills">
                <div>{item}</div>
              </div>
            ))}
            {profile.skills.normal.sort((a, b) => a.length - b.length).map((item, index) => (
              <div key={index} className="skills">
                <div>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div style={{color:"white"}}>{profile.username}{ownUsername}</div> */}
      {profile.username===ownUsername && <div id="profile-container5" className="btn btn-outline-primary"><NavLink className="navbar-brand about-page" to={`/updateprofile/${ownUsername}`} exact="true"><span className="update-profile">Update Profile</span></NavLink></div>}
    </div>
  )
}

export default ProfilePage