import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Session from './Components/Session/Session'
import HomePage from './Components/HomePage/HomePage';
import Navbar from './Components/Navbar/Navbar';

function App() {
  return (
    <div>
        <BrowserRouter>
          <Navbar/>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path='/session/:sessionId' element={<Session/>} />
          </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App