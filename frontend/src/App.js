import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Session from './Components/Session/Session'
import HomePage from './Components/HomePage/HomePage';
import ProfilePage from './Components/ProfilePage/ProfilePage';
import UpdateProfile from './Components/ProfilePage/UpdateProfile';
import FriendsPage from './Components/FriendsPage/FriendsPage';

function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path='/session/:sessionId' element={<Session/>} />
            <Route path='/profile/:profileId' element={<ProfilePage/>} />
            <Route path='/updateprofile/:profileId' element={<UpdateProfile/>} />
            <Route path='/friends' element={<FriendsPage/>} />
          </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App