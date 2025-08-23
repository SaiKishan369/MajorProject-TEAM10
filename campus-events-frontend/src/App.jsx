import { useState, useEffect, useCallback } from 'react';
import EventsList from './components/EventsList';
import { getEvents, addEvent, deleteEvent } from './api';
import styles from './App.module.css';

function AddEventForm({ onSubmit, isAdmin }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [formLink, setFormLink] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [speakerBio, setSpeakerBio] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date) return;
    
    const eventData = {
      title,
      description,
      date,
      speaker: {
        name: speakerName,
        title: speakerTitle,
        bio: speakerBio
      }
    };
    
    if (isAdmin && formLink) {
      eventData.form_link = formLink;
    }
    
    onSubmit(eventData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate('');
    setFormLink('');
    setSpeakerName('');
    setSpeakerTitle('');
    setSpeakerBio('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title">Event Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          rows="3"
        />
      </div>

      <div className={styles.field}>
        <label>Speaker Details</label>
        <div className={styles.speakerFields}>
          <input
            type="text"
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value)}
            placeholder="Speaker Name"
            className={styles.speakerInput}
          />
          <input
            type="text"
            value={speakerTitle}
            onChange={(e) => setSpeakerTitle(e.target.value)}
            placeholder="Speaker Title"
            className={styles.speakerInput}
          />
          <textarea
            value={speakerBio}
            onChange={(e) => setSpeakerBio(e.target.value)}
            placeholder="Speaker Bio"
            rows="2"
            className={styles.speakerBio}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      
      {isAdmin && (
        <div className={styles.field}>
          <label htmlFor="formLink">Registration Form Link (optional)</label>
          <input
            id="formLink"
            type="url"
            value={formLink}
            onChange={(e) => setFormLink(e.target.value)}
            placeholder="https://forms.gle/..."
          />
        </div>
      )}
      <button type="submit" className={styles.button}>
        Add Event
      </button>
    </form>
  );
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      const sorted = [...data].sort((a, b) =>
        String(a.date).localeCompare(String(b.date))
      );
      setEvents(sorted);
    } catch (e) {
      setError('Failed to fetch events');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAddEvent = async (newEvent) => {
    try {
      await addEvent(newEvent);
      await loadEvents();
    } catch (err) {
      setError('Failed to add event: ' + err.message);
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEvent(id);
      await loadEvents();
    } catch (err) {
      setError('Failed to delete event: ' + err.message);
      console.error(err);
    }
  };

  const togglePersona = () => {
    setIsAdmin(prev => !prev);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Campus Events</h1>
          <p className={styles.subtitle}>Switch between admin and user views</p>
        </div>
        <button onClick={togglePersona} className={styles.personaButton}>
          Switch to {isAdmin ? 'User' : 'Admin'} View
        </button>
      </header>

      <main>
        {isAdmin && (
          <section className={styles.card}>
            <h2>Add New Event</h2>
            <AddEventForm onSubmit={handleAddEvent} isAdmin={isAdmin} />
          </section>
        )}

        <section className={styles.card}>
          <h2>Events</h2>
          {loading ? (
            <p>Loading events...</p>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={loadEvents}>Retry</button>
            </div>
          ) : (
            <EventsList 
              events={events} 
              isAdmin={isAdmin}
              onDelete={isAdmin ? handleDeleteEvent : null}
            />
          )}
        </section>
      </main>
    </div>
  );
}