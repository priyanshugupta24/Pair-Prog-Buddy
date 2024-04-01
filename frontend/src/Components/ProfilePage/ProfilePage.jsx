import React from 'react'
import Navbar from '../Navbar/Navbar'
import "./ProfilePage.css"
import { useParams } from 'react-router-dom';

function ProfilePage() {
  let { profileId } = useParams();
  return (
    <div>
        <Navbar/>
        <div className="container" id="profile-container">This Is Profile Page for {profileId}</div>
    </div>
  )
}

export default ProfilePage