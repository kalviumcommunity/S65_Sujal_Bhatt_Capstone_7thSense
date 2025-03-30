import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import GameModesPage from "./components/GameModesPage"
import LandingPage from './components/LandingPage'
import LoginSignupPage from './components/LoginSignupPage'
import MatchmakingPage from './components/MatchmakingPage'
import OneVOnePage from './components/OneVOnePage'
import ProfilePage from './components/ProfilePage'
import WalletPage from './components/WalletPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/game-modes" element={<GameModesPage />} />
        <Route path="/login-signup" element={<LoginSignupPage />} />
        <Route path="/match-making" element={<MatchmakingPage />} />
        <Route path="/1v1" element={<OneVOnePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
