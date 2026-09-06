'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Crosshair,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { SOURCE_URL, type LeaderboardData } from '@/lib/projects';
import {
  mergeSnapshot,
  rankOf,
  REFRESH_SECONDS,
  validSnapshot,
  voteChanges,
} from '@/lib/leaderboard';

function bogotaTime(isoDate: string) {
  const date = new Date(isoDate);
  return `${String((date.getUTCHours() + 19) % 24).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
}

function signed(value: number) {
  return `${value > 0 ? '+' : ''}${value}`;
}

export function LeaderboardClient({
  initialData,
}: {
  initialData: LeaderboardData;
}) {
  const [data, setData] = useState(initialData);
  const current = useRef(initialData);
  const [baseline, setBaseline] = useState(initialData);
  const inFlight = useRef(false);
  const request = useRef<AbortController | null>(null);
  const nextRefresh = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [announcement, setAnnouncement] = useState('');
  const [offline, setOffline] = useState(false);
  const [age, setAge] = useState(0);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch('/api/leaderboard', {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('sync');
      const incoming: unknown = await response.json();
      if (!validSnapshot(incoming)) throw new Error('invalid snapshot');
      const next = mergeSnapshot(current.current, incoming);
      const deltas = voteChanges(current.current, next);
      setBaseline((previous) => ({
        ...previous,
        projects: previous.projects.map((original) => {
          const fresh = next.projects.find(
            (entry) => entry.slug === original.slug,
          );
          return (original.votes === null || original.stale) &&
            fresh?.votes != null &&
            !fresh.stale
            ? fresh
            : original;
        }),
      }));
      current.current = next;
      setData(next);
      setChanges(deltas);
      setError(null);
      setAge(
        Math.max(
          0,
          Math.floor((Date.now() - Date.parse(next.updatedAt)) / 1000),
        ),
      );
      const count = Object.keys(deltas).length;
      const woki = next.projects.find((project) => project.isWoki);
      setAnnouncement(
        count
          ? `${count} proyectos cambiaron. WOKI: ${woki?.votes ?? 'sin lectura'} votos, posición ${woki ? (rankOf(next.projects, woki) ?? 'pendiente') : 'pendiente'}.`
          : 'Sincronización completada. Sin cambios de votos.',
      );
    } catch {
      if (request.current === controller)
        setError(
          'No pudimos sincronizar. Conservamos la última lectura y reintentamos en 15 segundos.',
        );
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
      nextRefresh.current = Date.now() + REFRESH_SECONDS * 1000;
      setSecondsLeft(REFRESH_SECONDS);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const wake = () => {
      setOffline(!navigator.onLine);
      if (
        document.visibilityState === 'visible' &&
        navigator.onLine &&
        Date.now() >= nextRefresh.current
      )
        void refresh();
    };
    nextRefresh.current = Date.now() + REFRESH_SECONDS * 1000;
    const initialCheck = window.setTimeout(() => {
      setOffline(!navigator.onLine);
      if (
        navigator.onLine &&
        Date.now() - Date.parse(initialData.updatedAt) > REFRESH_SECONDS * 1000
      )
        void refresh();
    }, 0);
    const timer = window.setInterval(() => {
      setAge(
        Math.max(
          0,
          Math.floor(
            (Date.now() - Date.parse(current.current.updatedAt)) / 1000,
          ),
        ),
      );
      if (document.visibilityState !== 'visible' || !navigator.onLine) return;
      setSecondsLeft(
        Math.max(0, Math.ceil((nextRefresh.current - Date.now()) / 1000)),
      );
      if (Date.now() >= nextRefresh.current) void refresh();
    }, 1000);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    window.addEventListener('offline', wake);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(initialCheck);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
      window.removeEventListener('offline', wake);
      const active = request.current;
      request.current = null;
      active?.abort();
    };
  }, [initialData.updatedAt, refresh]);

  const woki = data.projects.find((project) => project.isWoki);
  const wokiRank = woki ? rankOf(data.projects, woki) : null;
  const originalWoki = baseline.projects.find((project) => project.isWoki);
  const originalRank = originalWoki
    ? rankOf(baseline.projects, originalWoki)
    : null;
  const rankGain =
    wokiRank !== null && originalRank !== null ? originalRank - wokiRank : 0;
  const sessionGain =
    woki?.votes != null && originalWoki?.votes != null
      ? woki.votes - originalWoki.votes
      : 0;
  const nextProject =
    woki?.votes != null
      ? [...data.projects]
          .reverse()
          .find(
            (project) => project.votes !== null && project.votes > woki.votes!,
          )
      : undefined;
  const gap =
    woki?.votes != null && nextProject?.votes != null
      ? nextProject.votes - woki.votes + 1
      : 0;
  const partial = !data.live || data.projects.some((project) => project.stale);
  const uncertain = partial || !!error || offline || age > 45;
  const totalVotes = data.projects.reduce(
    (sum, project) => sum + (project.votes ?? 0),
    0,
  );

  return (
    <main className="page-wrap">
      <a className="skip-link" href="#ranking-title">
        Ir al ranking
      </a>
      <header className="page-header">
        <div>
          <p className="eyebrow brand">
            <Radio size={15} aria-hidden="true" /> PLATANUS HACK [26]{' '}
            <span>· BOGOTÁ</span>
          </p>
          <h1>
            Tabla de <span>votos</span>
            <span className="title-period">.</span>
          </h1>
          <p className="intro">Todo el hackathon. Un solo ranking.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="action-button refresh-button"
            onClick={() => void refresh()}
            disabled={refreshing || offline}
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'spin' : ''}
              aria-hidden="true"
            />
            <span>{refreshing ? 'Sincronizando' : 'Actualizar'}</span>
            <span className="countdown" aria-hidden="true">
              {refreshing ? '···' : `${secondsLeft}s`}
            </span>
          </button>
          <a
            className="action-button official-link"
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sitio oficial <ArrowUpRight size={16} aria-hidden="true" />
            <span className="sr-only"> (abre otra pestaña)</span>
          </a>
        </div>
      </header>

      <section className="woki-spotlight" aria-labelledby="woki-title">
        <div className="woki-identity">
          <p className="eyebrow">
            <Crosshair size={14} aria-hidden="true" /> PROYECTO DESTACADO
          </p>
          <h2 id="woki-title">
            WOKI
            <span className="woki-signal" aria-hidden="true">
              ↗
            </span>
          </h2>
          <a
            className="text-link"
            href={`${SOURCE_URL}/woki`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en Platanus <ArrowUpRight size={15} />
            <span className="sr-only"> (abre otra pestaña)</span>
          </a>
        </div>
        <div className="woki-stat">
          <span className="eyebrow">
            POSICIÓN{uncertain ? ' ESTIMADA' : ''}
          </span>
          <strong>{wokiRank !== null ? `#${wokiRank}` : '—'}</strong>
          <span className="stat-note">
            {rankGain ? (
              <>
                <span className={rankGain > 0 ? 'positive' : 'negative'}>
                  {rankGain > 0 ? '↑' : '↓'} {Math.abs(rankGain)}{' '}
                  {Math.abs(rankGain) === 1 ? 'puesto' : 'puestos'}
                </span>{' '}
                esta sesión
              </>
            ) : (
              `de ${data.projects.length} proyectos`
            )}
          </span>
        </div>
        <div className="woki-stat">
          <span className="eyebrow">
            VOTOS{woki?.stale ? ' ANTERIORES' : ''}
          </span>
          <strong
            key={woki?.votes}
            className={changes.woki ? 'number-change' : ''}
          >
            {woki?.votes ?? '—'}
          </strong>
          <span className="stat-note">
            {sessionGain ? (
              <>
                <span className={sessionGain > 0 ? 'positive' : 'negative'}>
                  {signed(sessionGain)}
                </span>{' '}
                desde que abriste
              </>
            ) : (
              'Siguiendo los cambios'
            )}
          </span>
        </div>
        <div className="woki-target">
          <p className="eyebrow">
            {uncertain
              ? 'LECTURA PENDIENTE'
              : nextProject
                ? 'SIGUIENTE OBJETIVO'
                : 'EN LA CIMA'}
          </p>
          <p className="target-copy">
            {uncertain ? (
              'Esperando una lectura completa.'
            ) : nextProject ? (
              <>
                <strong>{gap}</strong> {gap === 1 ? 'voto para' : 'votos para'}{' '}
                superar a <b>{nextProject.name}</b>
              </>
            ) : woki?.votes != null ? (
              'WOKI comparte o lidera el primer lugar.'
            ) : (
              'Esperando votos de Platanus.'
            )}
          </p>
          {nextProject && !uncertain && (
            <progress
              className="goal-track"
              aria-label={`Votos de WOKI hacia superar a ${nextProject.name}`}
              value={woki?.votes ?? 0}
              max={(nextProject.votes ?? 0) + 1}
            />
          )}
          <a className="text-link jump-link" href="#project-woki">
            Ubicar en la tabla <ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      {(error || offline || partial || age > 45) && (
        <output className="sync-warning">
          {offline
            ? 'Sin conexión. Mostramos la última lectura; sincronizamos al volver.'
            : error ||
              (partial
                ? 'Lectura parcial de Platanus. Los valores anteriores están marcados; el orden puede cambiar.'
                : 'La lectura tiene más de 45 segundos. Intentando obtener votos recientes.')}
        </output>
      )}
      <output className="sr-only" aria-live="polite">
        {announcement}
      </output>

      <section className="leaderboard-shell" aria-labelledby="ranking-title">
        <div className="ranking-toolbar">
          <div>
            <h2 id="ranking-title" tabIndex={-1}>
              Leaderboard
            </h2>
            <p>
              {data.projects.length} proyectos <span>·</span>{' '}
              {partial ? 'al menos ' : ''}
              {totalVotes} votos
            </p>
          </div>
          <div className="sync-status">
            <span
              className={`status-dot ${uncertain ? 'status-fallback' : ''}`}
            />{' '}
            <span>
              {offline
                ? 'Sin conexión'
                : refreshing
                  ? 'Sincronizando'
                  : uncertain
                    ? 'Pendiente de sincronizar'
                    : 'Sincronizado'}
              <small>
                Lectura {bogotaTime(data.updatedAt)} COT · cada 15 s
              </small>
            </span>
          </div>
        </div>
        <div className="ranking-columns" aria-hidden="true">
          <span>#</span>
          <span>Proyecto</span>
          <span>Track</span>
          <span>Votos</span>
          <span />
        </div>
        <ol className="ranking-list">
          {data.projects.map((project) => {
            const rank = rankOf(data.projects, project);
            const delta = changes[project.slug];
            const tied =
              project.votes !== null &&
              data.projects.filter((entry) => entry.votes === project.votes)
                .length > 1;
            return (
              <li key={project.slug} id={`project-${project.slug}`}>
                <a
                  className={`project-row ${project.isWoki ? 'woki-row' : ''}`}
                  href={`${SOURCE_URL}/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.name}, ${rank !== null ? `posición ${rank}${tied ? ' compartida' : ''}` : 'posición pendiente'}, ${project.votes ?? 'sin lectura de'} votos${project.stale ? ', lectura anterior' : ''}. Abrir en Platanus en otra pestaña.`}
                >
                  <span
                    className={`rank ${rank && rank <= 3 ? `podium-${rank}` : ''}`}
                  >
                    {rank ?? '—'}
                  </span>
                  <span className="project-info">
                    <span className="project-name">
                      {project.name}
                      {project.isWoki && (
                        <span className="woki-badge">WOKI TEAM</span>
                      )}
                    </span>
                    <span className="project-summary">{project.summary}</span>
                    <span className="mobile-track">{project.track}</span>
                  </span>
                  <span className="track-badge">{project.track}</span>
                  <span className="vote-cell">
                    <span
                      key={`${project.slug}-${project.votes}`}
                      className={`vote-count ${delta ? 'number-change' : ''}`}
                    >
                      {project.votes ?? '—'}
                    </span>
                    <span
                      className={`vote-detail ${project.stale ? 'stale-count' : delta && delta < 0 ? 'negative' : 'positive'}`}
                    >
                      {project.stale ? (
                        'anterior'
                      ) : delta ? (
                        <>
                          {delta > 0 ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )}
                          {signed(delta)}
                        </>
                      ) : (
                        ''
                      )}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="row-arrow"
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </section>
      <footer>
        <p>
          Los empates comparten posición. Los cambios se comparan con la lectura
          anterior.
        </p>
        <p>Votos públicos de Platanus · Sitio independiente, no oficial.</p>
      </footer>
    </main>
  );
}
