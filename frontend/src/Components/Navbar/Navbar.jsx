import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import "./Navbar.css";

function Navbar() {
  const [profile, setProfile] = useState("");

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
      console.log('Response:', response.data);
      setProfile(response.data.email || "");
    } catch (err) {
      console.log("Not Authenticated");
    }
  }

  var login = async (e) => {
    e.preventDefault();
    try {
      const form = {
        email : "prvn.prvn13@gmail.com",
        password : "prvn_gupta123"
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
      setProfile(""); // Clear profile after logout
    } catch (error) {
      console.error('Error:', error);
    }
  }

  var register = async(e) => {
    e.preventDefault();
    try{
        const form = {
            email : "prvn.prvn13@gmail.com",
            password : "prvn_gupta123"
        }
        const response = await axios.post("http://localhost:5123/api/register",form);
        console.log('Response:', response.data);
    }
    catch (error) {
        console.error('Error:', error);
    }
}

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{height:"8vh"}}>
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
              <div className="welcomeuser">Welcome {profile}</div>
              <div className="d-flex flex-column flex-md-row">
                <button className="btn btn-outline-danger my-2 my-sm-0" type="submit" onClick={logout}>Logout</button>
              </div>
            </>) : 
            (<>
              <div className="d-flex flex-column flex-md-row">
                <button className="btn btn-outline-success my-2 my-sm-0 mr-md-2" type="submit" onClick={login}>Login</button>
                <button className="btn btn-outline-primary my-2 my-sm-0" type="submit" onClick={register}>Register</button>
              </div>
            </>)}
          </form>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
