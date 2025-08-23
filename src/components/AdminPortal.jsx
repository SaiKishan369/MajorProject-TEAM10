import { useState, useEffect } from 'react'
import { getEvents, addEvent, updateEvent, deleteEvent, getCategories, getUsers, getRegistrations, getDashboardStats } from '../api'

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [addEventForm, setAddEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    capacity: '',
    price: '',
    image: '',
    organizer: '',
    tags: ''
  })
  const [addEventLoading, setAddEventLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventsData, categoriesData, usersData, registrationsData, statsData] = await Promise.all([
        getEvents(),
        getCategories(),
        getUsers(),
        getRegistrations(),
        getDashboardStats()
      ])
      setEvents(eventsData)
      setCategories(categoriesData)
      setUsers(usersData)
      setRegistrations(registrationsData)
      setStats(statsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    setAddEventLoading(true)
    try {
      const payload = {
        ...addEventForm,
        capacity: parseInt(addEventForm.capacity),
        price: parseFloat(addEventForm.price),
        tags: addEventForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      }
      const res = await addEvent(payload)
      setEvents(prev => [...prev, res.event])
      setShowAddEvent(false)
      setAddEventForm({
        title: '', description: '', date: '', time: '', location: '', category: '', capacity: '', price: '', image: '', organizer: '', tags: ''
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setAddEventLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading admin portal...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Error: {error}</p>
          <button onClick={loadData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><i className="fas fa-user-shield"></i> Admin Portal</h1>
        <p>Manage events, users, and view analytics</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-line"></i> Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <i className="fas fa-calendar-alt"></i> Events
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users"></i> Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          <i className="fas fa-clipboard-list"></i> Registrations
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>{stats.total_events || 0}</h3>
              <p>Total Events</p>
            </div>
            <div className="stat-card">
              <h3>{stats.total_users || 0}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{stats.total_registrations || 0}</h3>
              <p>Total Registrations</p>
            </div>
            <div className="stat-card">
              <h3>${stats.total_revenue || 0}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        )}
        
        {activeTab === 'events' && (
          <div className="events-tab">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
              <h2>Event Management</h2>
              <button className="btn btn-primary" onClick={() => setShowAddEvent(true)}>
                <i className="fas fa-plus"></i> Add Event
              </button>
            </div>
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Price:</strong> ${event.price}</p>
                </div>
              ))}
            </div>
            {showAddEvent && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Add New Event</h3>
                    <button className="close-btn" onClick={() => setShowAddEvent(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleAddEvent} className="user-form">
                    <div className="form-field">
                      <label>Title *</label>
                      <input type="text" value={addEventForm.title} onChange={e => setAddEventForm(f => ({...f, title: e.target.value}))} required />
                    </div>
                    <div className="form-field">
                      <label>Description *</label>
                      <textarea value={addEventForm.description} onChange={e => setAddEventForm(f => ({...f, description: e.target.value}))} required />
                    </div>
                    <div className="form-field">
                      <label>Date *</label>
                      <input type="date" value={addEventForm.date} onChange={e => setAddEventForm(f => ({...f, date: e.target.value}))} required />
                    </div>
                    <div className="form-field">
                      <label>Time *</label>
                      <input type="time" value={addEventForm.time} onChange={e => setAddEventForm(f => ({...f, time: e.target.value}))} required />
                    </div>
                    <div className="form-field">
                      <label>Location *</label>
                      <input type="text" value={addEventForm.location} onChange={e => setAddEventForm(f => ({...f, location: e.target.value}))} required />
                    </div>
                    <div className="form-field">
                      <label>Category *</label>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <select value={addEventForm.category} onChange={e => setAddEventForm(f => ({...f, category: e.target.value}))} required style={{flex:1}}>
                          <option value="">Select Category</option>
                          {categories.length === 0 && <option disabled>No categories available</option>}
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button type="button" className="btn btn-secondary btn-sm" title="Refresh categories" onClick={async()=>{
                          const cats = await getCategories();
                          setCategories(cats);
                        }}>
                          <i className="fas fa-sync"></i>
                        </button>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Capacity *</label>
                      <input type="number" value={addEventForm.capacity} onChange={e => setAddEventForm(f => ({...f, capacity: e.target.value}))} required min="1" />
                    </div>
                    <div className="form-field">
                      <label>Price ($) *</label>
                      <input type="number" value={addEventForm.price} onChange={e => setAddEventForm(f => ({...f, price: e.target.value}))} required min="0" step="0.01" />
                    </div>
                    <div className="form-field">
                      <label>Image URL</label>
                      <input type="url" value={addEventForm.image} onChange={e => setAddEventForm(f => ({...f, image: e.target.value}))} />
                    </div>
                    <div className="form-field">
                      <label>Organizer</label>
                      <input type="text" value={addEventForm.organizer} onChange={e => setAddEventForm(f => ({...f, organizer: e.target.value}))} />
                    </div>
                    <div className="form-field">
                      <label>Tags (comma separated)</label>
                      <input type="text" value={addEventForm.tags} onChange={e => setAddEventForm(f => ({...f, tags: e.target.value}))} placeholder="coding, innovation, networking" />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={addEventLoading}>{addEventLoading ? 'Adding...' : 'Add Event'}</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddEvent(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="users-tab">
            <h2>Student Users</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.student_id}</td>
                      <td>{user.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'registrations' && (
          <div className="registrations-tab">
            <h2>Event Registrations</h2>
            <div className="registrations-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Event</th>
                    <th>Registration Date</th>
                    <th>Payment Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id}>
                      <td>{reg.user?.name || 'Unknown'}</td>
                      <td>{reg.event?.title || 'Unknown Event'}</td>
                      <td>{new Date(reg.registration_date).toLocaleDateString()}</td>
                      <td>{reg.payment_status}</td>
                      <td>${reg.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
