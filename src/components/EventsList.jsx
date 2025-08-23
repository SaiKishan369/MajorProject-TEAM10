export default function EventsList({ events }) {
  if (!events?.length) {
    return <p>No events yet. Add the first one!</p>
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th style={{width: '55%'}}>Title</th>
            <th style={{width: '45%'}}>Date (YYYY-MM-DD)</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.id}>
              <td>{ev.title}</td>
              <td>{ev.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}