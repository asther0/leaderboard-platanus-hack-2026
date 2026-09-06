'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Pause, Play } from 'lucide-react';

// First four slots cover all twelve photos across the three mobile scenes.
const scenes = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12],
  [5, 6, 11, 12, 1, 8],
];

function subscribeEnvironment(onChange: () => void) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  motion.addEventListener('change', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    motion.removeEventListener('change', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
}

function environmentSnapshot() {
  return (
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0) |
    (document.hidden ? 2 : 0)
  );
}

export function EventBackdrop() {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const environment = useSyncExternalStore(
    subscribeEnvironment,
    environmentSnapshot,
    () => 1,
  );
  const reducedMotion = Boolean(environment & 1);
  const visible = !(environment & 2);

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    // Keep the first collage static until every frame is available; no blank flashes.
    void Promise.all(
      Array.from(
        { length: 12 },
        (_, index) =>
          new Promise<boolean>((resolve) => {
            const photo = new window.Image();
            photo.onload = () => resolve(true);
            photo.onerror = () => resolve(false);
            photo.src = `/event/hack-${index + 1}.jpg`;
          }),
      ),
    ).then((loaded) => {
      if (!cancelled) setReady(loaded.every(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  const running = ready && visible && !paused && !reducedMotion;

  return (
    <>
      <div
        className="event-backdrop"
        aria-hidden="true"
        data-running={running}
        data-ready={ready}
      >
        <div className="event-scenes">
          {scenes.map((photos, scene) => (
            <div
              key={scene}
              className="event-collage"
              style={{ animationDelay: `${-((3 - scene) % 3) * 12}s` }}
            >
              {photos.map((photo, slot) => (
                <div
                  key={slot}
                  className={`event-photo event-photo-${photo}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {!reducedMotion && ready && (
        <div className="background-controls">
          <button
            type="button"
            className="background-toggle"
            aria-label={
              paused
                ? 'Reanudar animación del fondo'
                : 'Pausar animación del fondo'
            }
            onClick={() => setPaused(!paused)}
          >
            {paused ? (
              <Play size={13} aria-hidden="true" />
            ) : (
              <Pause size={13} aria-hidden="true" />
            )}
            {paused ? 'Animar fondo' : 'Pausar fondo'}
          </button>
        </div>
      )}
    </>
  );
}
