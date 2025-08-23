import { useState } from 'react'

export default function AddEventForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!date.trim()) e.date = 'Date is required'
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) e.date = 'Use YYYY-MM-DD'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    if (!validate()) return
    setBusy(true)
    try {
      await onSubmit({ title: title.trim(), date })
      setTitle('')
      setDate('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label>Title</label>
        <input type="text" placeholder="Hackathon" value={title} onChange={(e) => setTitle(e.target.value)} />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>

      <div className="field">
        <label>Date</label>
        <input type="text" placeholder="2025-09-01" value={date} onChange={(e) => setDate(e.target.value)} />
        {errors.date && <span className="error">{errors.date}</span>}
      </div>

      <button type="submit" disabled={busy}>
        {busy ? 'Adding…' : 'Add Event'}
      </button>
    </form>
  )
}