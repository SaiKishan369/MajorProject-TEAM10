import { useState, useMemo } from 'react';
import styles from './EventsList.module.css';

export default function EventsList({ events, isAdmin, onDelete }) {
  const [interestedEvents, setInterestedEvents] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query))
    );
  }, [events, searchQuery]);

  if (!events?.length) {
    return (
      <div className={styles.noEvents}>
        <p>No events found. {isAdmin ? 'Add your first event!' : 'Check back later for upcoming events.'}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleInterestToggle = (eventId) => {
    const newInterestedEvents = new Set(interestedEvents);
    if (interestedEvents.has(eventId)) {
      newInterestedEvents.delete(eventId);
    } else {
      newInterestedEvents.add(eventId);
    }
    setInterestedEvents(newInterestedEvents);
  };

  console.log('Events with form_links:', events.map(e => ({ id: e.id, title: e.title, hasFormLink: !!e.form_link })));
  
  return (
    <div className={styles.eventsContainer}>
      {!isAdmin && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      )}
      {filteredEvents.length === 0 ? (
        <div className={styles.noEvents}>
          <p>No events match your search.</p>
        </div>
      ) : (
        filteredEvents.map((event) => {
          const isInterested = interestedEvents.has(event.id);
          const interestCount = (event.interestedUsers?.length || 0) + (isInterested ? 1 : 0);

          return (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventContent}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDate}>{formatDate(event.date)}</p>
                
                <p className={styles.eventDescription}>
                  {event.description || 'No description available.'}
                </p>
                
                {event.speaker?.name && (
                  <div className={styles.speakerSection}>
                    <h4>Featured Speaker</h4>
                    <div className={styles.speakerCard}>
                      <div className={styles.speakerHeader}>
                        <span className={styles.speakerName}>{event.speaker.name}</span>
                        {event.speaker.title && (
                          <span className={styles.speakerTitle}>, {event.speaker.title}</span>
                        )}
                      </div>
                      {event.speaker.bio && (
                        <p className={styles.speakerBio}>{event.speaker.bio}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  className={`${styles.interestButton} ${isInterested ? styles.liked : ''}`}
                  onClick={() => handleInterestToggle(event.id)}
                  disabled={isAdmin}
                  title={isAdmin ? 'Admins cannot express interest' : 'Click to show interest'}
                >
                  {isInterested ? '❤️' : '🤍'} {interestCount}
                </button>
                
                <div className={styles.interestCount}>
                  👥 {interestCount} interested
                </div>
                
                {!isAdmin && event.form_link && (
                  <a 
                    href={event.form_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.registerButton}
                  >
                    Register Now
                  </a>
                )}
              </div>

              {isAdmin && onDelete && (
                <div className={styles.adminActions}>
                  <button
                    className={styles.adminButton}
                    onClick={() => onDelete(event.id)}
                  >
                    Delete Event
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}