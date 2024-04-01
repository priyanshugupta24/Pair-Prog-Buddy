import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ReactDOM from 'react-dom';
import axios from 'axios';
import "./Navbar.css";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../../Config/firebase.config';

const app = initializeApp(firebaseConfig);

function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState("");
  const [profileImage,setProfileImage] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5123/api/profile', {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true,
      });
      setProfileImage(response.data.user.pfp);
      // console.log(response.data.pfp);
      // console.log('Response:', response.data);
      setProfile(response.data.username || "");
    } catch (err) {
      console.log("Not Authenticated");
    }
  }

  var login = async (email,password) => {
    try {
      const form = {
        uemail: email,
        password: password
      }
      const response = await axios.post("http://localhost:5123/api/login", form, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true,
      });
      console.log('Response:', response.data);
      getProfile(); // Update profile after successful login
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const logout = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5123/api/logout", {},
        {
          withCredentials: true,
          credentials: "include",
        });
      console.log('Response:', response.data);
      setProfile("");
    } catch (error) {
      console.error('Error:', error);
    }
  }

  var register = async (name,userName,email,password) => {
    try {
      const form = {
        name : name,
        userName : userName,
        email: email,
        password: password
      }
      const response = await axios.post("http://localhost:5123/api/register", form);
      console.log('Response:', response.data);
    }
    catch (error) {
      console.error('Error:', error);
    }
  }


  const MyModal = () => {

    useEffect(() => {
      document.body.style.overflowY = "hidden";
      return () => {
        document.body.style.overflowY = "scroll";
      }
    })
    const [isLogin, setIsLogin] = useState(true)
    useEffect(() => {
      document.querySelector(".left").style.display = "none";
    }, [])
    const closeModal = () => setShowModal(false);
    const handleSubmitRegister = (e) => {
      e.preventDefault();
      if(isLogin === true){
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const userName = formData.get('userName');
        const email = formData.get('email');
        const password = formData.get('password');
        register(name,userName,email,password);
        closeModal();
      }
    }
    const handleSubmitLogin = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const email = formData.get('email2');
      const password = formData.get('password2');
      // console.log(email,password);
      login(email, password);
      closeModal();
    }
    const handleToggle = () => {
      if (isLogin === false) {
        document.querySelector(".left").style.display = "none";
        document.querySelector(".right").style.display = "block";
        document.querySelector(".modal-container").style.backgroundColor = "#f7326d";
      }
      else {
        document.querySelector(".left").style.display = "block";
        document.querySelector(".right").style.display = "none";
        document.querySelector(".modal-container").style.backgroundColor = "#fe4748";
      }
      setIsLogin(!isLogin);
    }
    return ReactDOM.createPortal(
      <>
        <div className="modal-wrapper" onClick={closeModal}></div>
        <div className="modal-container">
          <div className="left">
            <div className="left-decor">
              <h1 className="white-text">Welcome Back</h1>
              <div className="white-text">Glad To See You Again , Enter Your Details To Connect With Us Again!!</div>
              <button type="button" className="btn btn-outline-light btn-decor" onClick={handleToggle}>Register</button>
            </div>
          </div>

          <div className="form">
            {isLogin === true ? (<>
              <h2 className="login-heading">Register</h2>
              <form action="" onSubmit={handleSubmitRegister} method="post">
                <div className="form-group">
                  <label htmlFor="first-name" id="label"><svg style={{ color: "#000", height: "100%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" fill="#000000"></path></svg></label>
                  <input type="text" placeholder='Name' id="first-name" name="name" autoComplete='off' />
                </div>
                <div className="form-group">
                  <label htmlFor="user-name" id="label"><svg style={{ color: "#000", height: "100%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" fill="#000000"></path></svg></label>
                  <input type="text" placeholder='Username' id="user-name" name="userName" autoComplete='off' />
                </div>
                <div className="form-group">
                  <label htmlFor="email" id="label"><svg style={{ color: "#000", height: "100%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" /></svg></label>
                  <input type="text" placeholder='Email' id="email" name="email" autoComplete='off' />
                </div>
                <div className="form-group">
                  <label htmlFor="password" id="label"><svg style={{ color: "#000", height: "100%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" /></svg></label>
                  <input type="password" placeholder='Password' id="password" name="password" autoComplete='off' />
                </div>
                <input type="submit" value="Submit" className="btn btn-outline-dark submit" />
              </form>
              {/* <button type="button" className="btn btn-outline-dark submit">Submit</button> */}
              <div>or</div>
              <button type="button" className="btn btn-outline-dark extend-btn">Login via Google</button>
              <button type="button" className="btn btn-outline-dark extend-btn">Login via Github</button>
            </>) : (
              <>
                <h2 className="login-heading">Login</h2>
                <form action="" onSubmit={handleSubmitLogin} method="post">
                  <div className="form-group">
                    <label htmlFor="email2" id="label"><svg style={{ color: "#000", height: "100%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" /></svg></label>
                    <input type="text" placeholder='Username or Email' id="email2" name="email2" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password2" id="label"><svg style={{ color: "#000", height: "100%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" /></svg></label>
                    <input type="password" placeholder='Password' id="password2" name="password2" autoComplete='off' />
                  </div>
                  <input type="submit" value="Submit" className="btn btn-outline-dark submit" />
                </form>
                {/* <button type="button" className="btn btn-outline-dark submit">Submit</button> */}
                <div>or</div>
                <button type="button" className="btn btn-outline-dark extend-btn">Login via Google</button>
                <button type="button" className="btn btn-outline-dark extend-btn">Login via Github</button></>
            )}
          </div>

          <div className="right">
            <div className="right-decor">
              <h1 className="white-text">Welcome User</h1>
              <div className="white-text">Enter Your Personal Details And Start A  Journey With Us!</div>
              <button type="button" className="btn btn-outline-light btn-decor" onClick={handleToggle}>Login</button>
            </div>
          </div>
        </div>
      </>,
      document.querySelector(".myPortalModalDiv")
    )
  }
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ height: "8vh" }}>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <NavLink className="navbar-brand" to="/" exact="true">Brand</NavLink>

        <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li className="nav-item">
              <NavLink exact="true" className="nav-link" active="active" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" active="active" to="/link" exact="true">Link</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" active="active" to="/disabled" exact="true">Disabled</NavLink>
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
            {profile ?
              (<>
                <NavLink to="/profile" exact="true" className="navlink">
                  <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                      <img src={profileImage} className="pfp"/>
                      <div className="welcome-user">Welcome {profile}</div>
                  </div>
                </NavLink>
                <div className="d-flex flex-column flex-md-row">
                  <button className="btn btn-outline-danger my-2 my-sm-0" type="submit" onClick={logout}>Logout</button>
                </div>
              </>) :
              (<>
                <div className="d-flex flex-column flex-md-row">
                  {showModal && <MyModal />}
                  <div className="btn btn-outline-success my-2 my-sm-0 mr-md-2" onClick={() => setShowModal(true)}>Login/Register</div>
                  {/* <button className="btn btn-outline-primary my-2 my-sm-0"  onClick={register}>Register</button> */}
                </div>
              </>)}
          </form>
        </div>
      </nav>


      {/* <button >Test Login</button> */}
    </div>
  );
}

export default Navbar;
