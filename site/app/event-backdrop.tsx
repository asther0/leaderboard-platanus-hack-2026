export function EventBackdrop() {
  return (
    <div className="event-backdrop" aria-hidden="true">
      <div className="event-collage">
        {[1, 2, 3, 4, 5, 6].map((photo) => (
          <div key={photo} className={`event-photo event-photo-${photo}`} />
        ))}
      </div>
    </div>
  );
}
