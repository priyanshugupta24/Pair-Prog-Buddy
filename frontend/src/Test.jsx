import React from 'react'
import axios from 'axios';
import { useState,useEffect } from 'react';

function Test() {
    var [profile,setProfile] = useState("")
    var register = async(e) => {
        e.preventDefault();
        try{
            const form = {
                email : "prvn.prvn12@gmail.com",
                password : "prvn_gupta123"
            }
            const response = await axios.post("http://localhost:5123/api/register",form);
            console.log('Response:', response.data);
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    var login = async(e) => {
        // e.preventDefault();
        try{
            const form = {
                email : "prvn.prvn12@gmail.com",
                password : "prvn_gupta123"
            }
            const response = await axios.post("http://localhost:5123/api/login",form,{
                headers: {
                    "Content-type": "application/json"
                },
                withCredentials: true,
            });
            console.log('Response:', response.data);
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    var logout = async(e) => {
        e.preventDefault();
        try{
            const response = await axios.post("http://localhost:5123/api/logout",{},
            {
              withCredentials: true,
              credentials: "include",
            });
            console.log('Response:', response.data);
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    var getProfile = async(e) => {
        try{
            const response = await axios.get('http://localhost:5123/api/profile',{
                headers: {
                    "Content-type": "application/json"
                },
                withCredentials: true,
            });
            console.log('Response:', response.data);
            setProfile(response.data.email);
        }
        catch(err){
            setProfile("")
            console.log("The Error Is Here");
            console.error('Error:', err);
        }
    }
    useEffect(()=>{
        getProfile()
    },[profile])
    return (
        <div>
            <button onClick={register}>Register</button>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
            <button onClick={getProfile}>Fetch</button>
            <div>Welcome {profile}</div>
        </div>
    )
}

export default Test