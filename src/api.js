const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Event Management
export const getEvents = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.status) params.append('status', filters.status)
  if (filters.search) params.append('search', filters.search)
  
  const queryString = params.toString()
  const endpoint = queryString ? `/events?${queryString}` : '/events'
  
  return apiCall(endpoint)
}

export const getEvent = (eventId) => apiCall(`/events/${eventId}`)

export const addEvent = (eventData) => apiCall('/events', {
  method: 'POST',
  body: JSON.stringify(eventData),
})

export const updateEvent = (eventId, eventData) => apiCall(`/events/${eventId}`, {
  method: 'PUT',
  body: JSON.stringify(eventData),
})

export const deleteEvent = (eventId) => apiCall(`/events/${eventId}`, {
  method: 'DELETE',
})

// Categories
export const getCategories = () => apiCall('/categories')

// User Management
export const getUsers = () => apiCall('/users')

export const addUser = (userData) => apiCall('/users', {
  method: 'POST',
  body: JSON.stringify(userData),
})

// Event Registration
export const registerForEvent = (eventId, userId) => apiCall(`/events/${eventId}/register`, {
  method: 'POST',
  body: JSON.stringify({ user_id: userId }),
})

// Payment Processing
export const processPayment = (paymentData) => apiCall('/payments/process', {
  method: 'POST',
  body: JSON.stringify(paymentData),
})

// Admin Dashboard
export const getRegistrations = () => apiCall('/registrations')

export const getDashboardStats = () => apiCall('/dashboard/stats')

// Health Check
export const healthCheck = () => apiCall('/health')