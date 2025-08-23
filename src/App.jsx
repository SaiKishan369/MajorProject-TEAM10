import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminPortal from './components/AdminPortal'
import StudentPortal from './components/StudentPortal'
import './styles.css'

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>EventHub</h1>
          <span className="nav-subtitle">Campus Event Management</span>
        </div>
      </div>
    </nav>
  )
}

function HomePage() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to EventHub</h1>
          <p className="hero-subtitle">
            Discover, register, and manage campus events with ease
          </p>
          <div className="hero-buttons">
            <a href="/admin" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <i className="fas fa-user-shield"></i>
              Access Admin Portal
            </a>
            <a href="/student" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <i className="fas fa-user-graduate"></i>
              Access Student Portal
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <i className="fas fa-calendar-alt"></i>
            <h3>Event Management</h3>
            <p>Streamlined event creation and management</p>
          </div>
          <div className="floating-card">
            <i className="fas fa-users"></i>
            <h3>Student Registration</h3>
            <p>Easy event registration with payment</p>
          </div>
          <div className="floating-card">
            <i className="fas fa-chart-line"></i>
            <h3>Analytics Dashboard</h3>
            <p>Comprehensive insights and reporting</p>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-calendar-plus"></i>
            <h3>Event Creation</h3>
            <p>Create and manage events with detailed information</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-user-plus"></i>
            <h3>Student Registration</h3>
            <p>Simple registration process with payment integration</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-chart-bar"></i>
            <h3>Analytics</h3>
            <p>Track registrations, revenue, and event performance</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-mobile-alt"></i>
            <h3>Responsive Design</h3>
            <p>Works seamlessly on all devices</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/student" element={<StudentPortal />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}