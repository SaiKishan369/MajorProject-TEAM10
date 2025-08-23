export default function LoadingError({ loading, error, onRetry }) {
  if (loading) return <p>Loading…</p>
  if (error) {
    return (
      <div className="error-box">
        <p>⚠️ {String(error)}</p>
        {onRetry && (<button onClick={onRetry} className="link-btn">Retry</button>)}
      </div>
    )
  }
  return null
}