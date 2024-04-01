import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Session from './Components/Session/Session'
import HomePage from './Components/HomePage/HomePage';
import ProfilePage from './Components/ProfilePage/ProfilePage';
function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path='/session/:sessionId' element={<Session/>} />
            <Route path='/profile/:profileId' element={<ProfilePage/>} />
          </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App