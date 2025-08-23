const BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000'

async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body?.message || body?.error || message
    } catch (_) {}
    throw new Error(message)
  }
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function getEvents() {
  const data = await http('/events', { method: 'GET' });
  console.log('API Response:', data);
  return data;
}

export async function addEvent(payload) {
  return await http('/addevent', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function deleteEvent(id) {
  return await http(`/events/${id}`, {
    method: 'DELETE'
  });
}