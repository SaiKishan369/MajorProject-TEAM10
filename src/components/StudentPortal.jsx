import { useState, useEffect } from 'react'
import { getEvents, getCategories, addUser, registerForEvent, processPayment } from '../api'

export default function StudentPortal() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showUserForm, setShowUserForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventsData, categoriesData] = await Promise.all([
        getEvents(filters),
        getCategories()
      ])
      setEvents(eventsData)
      setCategories(categoriesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    loadData()
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowRegistrationForm(true)
  }

  const handleUserRegistration = async (userData) => {
    try {
      const newUser = await addUser(userData)
      setCurrentUser(newUser.user)
      setShowUserForm(false)
      alert('User registered successfully!')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEventRegistration = async () => {
    if (!currentUser) {
      setShowUserForm(true)
      return
    }

    try {
      const registration = await registerForEvent(selectedEvent.id, currentUser.id)
      setShowRegistrationForm(false)
      setShowPaymentForm(true)
      alert(registration.message)
    } catch (err) {
      alert(err.message)
    }
  }

  const handlePayment = async (paymentData) => {
    try {
      const result = await processPayment(paymentData)
      setShowPaymentForm(false)
      alert(result.message)
      loadData() // Refresh events to update capacity
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="student-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Error: {error}</p>
          <button onClick={loadData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-container">
      <div className="student-header">
        <h1><i className="fas fa-user-graduate"></i> Student Portal</h1>
        <p>Browse and register for exciting campus events</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filters.category || ''} 
            onChange={(e) => handleFilterChange({ ...filters, category: e.target.value || undefined })}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange({ ...filters, search: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
            <div className="event-image">
              {event.image ? (
                <img src={event.image} alt={event.title} />
              ) : (
                <div className="event-placeholder">
                  <i className="fas fa-calendar-alt"></i>
                </div>
              )}
              <div className="event-price">
                <span className="price-badge">
                  {event.price > 0 ? `$${event.price}` : 'Free'}
                </span>
              </div>
            </div>
            
            <div className="event-content">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              
              <div className="event-details">
                <div className="detail-item">
                  <i className="fas fa-calendar"></i>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-clock"></i>
                  <span>{event.time}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{event.location}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-users"></i>
                  <span>{event.capacity} spots available</span>
                </div>
              </div>
              
              <button className="btn btn-primary register-btn">
                Register Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User Registration Form */}
      {showUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Student Registration</h3>
              <button 
                className="close-btn"
                onClick={() => setShowUserForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <UserRegistrationForm onSubmit={handleUserRegistration} />
          </div>
        </div>
      )}

      {/* Event Registration Confirmation */}
      {showRegistrationForm && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Register for Event</h3>
              <button 
                className="close-btn"
                onClick={() => setShowRegistrationForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="registration-confirmation">
              <h4>{selectedEvent.title}</h4>
              <p>{selectedEvent.description}</p>
              <div className="event-summary">
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Price:</strong> ${selectedEvent.price}</p>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleEventRegistration}
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Payment Information</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPaymentForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <PaymentForm 
              amount={selectedEvent?.price || 0}
              onSubmit={handlePayment}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function UserRegistrationForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    department: '',
    graduation_year: '',
    phone: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-field">
        <label>Full Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      
      <div className="form-field">
        <label>Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      
      <div className="form-field">
        <label>Student ID *</label>
        <input
          type="text"
          value={formData.student_id}
          onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
          required
        />
      </div>
      
      <div className="form-field">
        <label>Department *</label>
        <select
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          required
        >
          <option value="">Select Department</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Business Administration">Business Administration</option>
          <option value="Engineering">Engineering</option>
          <option value="Arts">Arts</option>
          <option value="Science">Science</option>
        </select>
      </div>
      
      <div className="form-field">
        <label>Graduation Year *</label>
        <select
          value={formData.graduation_year}
          onChange={(e) => setFormData(prev => ({ ...prev, graduation_year: e.target.value }))}
          required
        >
          <option value="">Select Year</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>
      
      <div className="form-field">
        <label>Phone Number</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      
      <button type="submit" className="btn btn-primary">
        Register
      </button>
    </form>
  )
}

function PaymentForm({ amount, onSubmit }) {
  const [paymentData, setPaymentData] = useState({
    card_number: '',
    expiry_date: '',
    cvv: '',
    cardholder_name: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...paymentData,
      amount: amount,
      payment_id: `pay_${Date.now()}`
    })
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-summary">
        <h4>Payment Summary</h4>
        <p><strong>Amount:</strong> ${amount}</p>
      </div>
      
      <div className="form-field">
        <label>Card Number *</label>
        <input
          type="text"
          value={paymentData.card_number}
          onChange={(e) => setPaymentData(prev => ({ ...prev, card_number: e.target.value }))}
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-field">
          <label>Expiry Date *</label>
          <input
            type="text"
            value={paymentData.expiry_date}
            onChange={(e) => setPaymentData(prev => ({ ...prev, expiry_date: e.target.value }))}
            placeholder="MM/YY"
            required
          />
        </div>
        
        <div className="form-field">
          <label>CVV *</label>
          <input
            type="text"
            value={paymentData.cvv}
            onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
            placeholder="123"
            required
          />
        </div>
      </div>
      
      <div className="form-field">
        <label>Cardholder Name *</label>
        <input
          type="text"
          value={paymentData.cardholder_name}
          onChange={(e) => setPaymentData(prev => ({ ...prev, cardholder_name: e.target.value }))}
          required
        />
      </div>
      
      <button type="submit" className="btn btn-primary">
        Process Payment
      </button>
    </form>
  )
}
