import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Future routes will be added here */}
          <Route path="/register" element={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50"><div className="text-center"><h1 className="text-4xl font-bold gradient-text mb-4">Registration Page</h1><p className="text-gray-600">Coming Soon...</p></div></div>} />
          <Route path="/login" element={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50"><div className="text-center"><h1 className="text-4xl font-bold gradient-text mb-4">Login Page</h1><p className="text-gray-600">Coming Soon...</p></div></div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
