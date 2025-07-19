import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DeveloperProfileForm from './pages/DeveloperProfileForm'
import CompanyProfileForm from './pages/CompanyProfileForm'
import Dashboard from './pages/Dashboard'
import CreateJob from './pages/CreateJob'
import Matches from './pages/Matches'
import Wishlist from './pages/Wishlist'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Profile Creation Routes - Protected but don't require existing profile */}
            <Route path="/create-developer-profile" element={
              <ProtectedRoute requireProfile={false}>
                <DeveloperProfileForm />
              </ProtectedRoute>
            } />
            <Route path="/create-company-profile" element={
              <ProtectedRoute requireProfile={false}>
                <CompanyProfileForm />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes that require profile completion */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-job" element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/matches" element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />
            <Route path="/developer-profile" element={
              <ProtectedRoute>
                <DeveloperProfileForm />
              </ProtectedRoute>
            } />
            <Route path="/company-profile" element={
              <ProtectedRoute>
                <CompanyProfileForm />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <a href="/" className="text-primary-600 hover:text-primary-500 transition-colors">
                    ← Back to Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
