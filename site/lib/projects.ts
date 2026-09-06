export type Track = 'Emergencies' | 'AI Security' | 'Access' | 'Simulations';

export type Project = {
  slug: string;
  name: string;
  summary: string;
  track: Track;
  votes: number | null;
  stale?: boolean;
  isWoki?: boolean;
};

export const SOURCE_URL = 'https://hack.platan.us/26-co/vote';

const projects: Omit<Project, 'votes'>[] = [
  {
    slug: 'aegis',
    name: 'Aegis',
    summary: 'Evita que tus datos se filtren a más de 170 IAs.',
    track: 'AI Security',
  },
  {
    slug: 'auxio',
    name: 'AuXio',
    summary: 'Intérprete simultáneo para llamadas al 123.',
    track: 'Emergencies',
  },
  {
    slug: 'bus-factor-hq',
    name: 'Bus Factor HQ',
    summary: 'Simulador arcade de emergencias organizacionales.',
    track: 'Emergencies',
  },
  {
    slug: 'cumplia',
    name: 'complAI',
    summary: 'Vigila la normativa colombiana y abre el PR de cumplimiento.',
    track: 'Access',
  },
  {
    slug: 'deleycom',
    name: 'deley.com',
    summary: 'Que nadie enfrente a su juez sin conocerlo primero.',
    track: 'Access',
  },
  {
    slug: 'dipia',
    name: 'dipia',
    summary: 'Simula la vida que aún no ha pasado.',
    track: 'Simulations',
  },
  {
    slug: 'helius',
    name: 'Helius',
    summary: 'Red de emergencia entre celulares para terremotos.',
    track: 'Emergencies',
  },
  {
    slug: 'hippocamp',
    name: 'Hippocamp',
    summary: 'La memoria de tu red, antes de publicar.',
    track: 'Simulations',
  },
  {
    slug: 'simulador-de-cumplimiento-de-poltica-pblica',
    name: 'HIVE',
    summary: 'Mide cuánto se cumple una política y a quién impacta.',
    track: 'Simulations',
  },
  {
    slug: 'moirai',
    name: 'Moirai',
    summary: 'Simula futuros de salud a partir de exámenes de sangre.',
    track: 'Simulations',
  },
  {
    slug: 'neuroecho',
    name: 'NeuroEcho',
    summary: 'Música nueva diseñada para replicar respuestas neuronales.',
    track: 'Simulations',
  },
  {
    slug: 'palante',
    name: "Pa'lante",
    summary: 'Contexto financiero normalizado para agentes de IA.',
    track: 'Access',
  },
  {
    slug: 'parallax',
    name: 'Parallax',
    summary: 'Simula el cambio antes de aplicarlo.',
    track: 'Simulations',
  },
  {
    slug: 'peaje',
    name: 'Peaje',
    summary: 'Monetiza el uso de tu web por agentes de IA.',
    track: 'Access',
  },
  {
    slug: 'plumb',
    name: 'PLUMB',
    summary: 'Detecta irregularidades en contratación de obra pública.',
    track: 'Access',
  },
  {
    slug: 'memory-firewall-for-ai-agents',
    name: 'Provenance Firewall',
    summary: 'Impide que una memoria gane autoridad sin permiso.',
    track: 'AI Security',
  },
  {
    slug: 'pulse',
    name: 'PULSE',
    summary: 'Unificación y lógica de seguridad en emergencias.',
    track: 'Emergencies',
  },
  {
    slug: 'pulso',
    name: 'PULSO',
    summary: 'Del paramédico al hospital correcto en menos de 90 segundos.',
    track: 'Emergencies',
  },
  {
    slug: 'replica',
    name: 'Replica',
    summary: 'Comunicación de emergencia cuando colapsa la infraestructura.',
    track: 'Emergencies',
  },
  {
    slug: 'roxy',
    name: 'Roxy',
    summary: 'Verifica cada acción de agentes antes de tocar tus datos.',
    track: 'AI Security',
  },
  {
    slug: 'stegora',
    name: 'Stegora',
    summary: 'La firma del autor viaja dentro del archivo.',
    track: 'AI Security',
  },
  {
    slug: 'temis',
    name: 'TEMIS',
    summary: 'Asistente de voz para tutelas y trámites de salud.',
    track: 'Access',
  },
  {
    slug: 'vity',
    name: 'Vity',
    summary: 'Predice riesgo sísmico y el costo de mitigarlo.',
    track: 'Simulations',
  },
  {
    slug: 'woki',
    name: 'WOKI',
    summary: 'Ayuda y rescates sin internet, con visibilidad al volver la red.',
    track: 'Emergencies',
    isWoki: true,
  },
];

export function readVotes(html: string): number | null {
  // Inertia embeds the same public counter used by the official page.
  // Prefer its structured data so a CSS redesign cannot break the reader.
  const page = html.match(
    /<script\b[^>]*data-page="app"[^>]*>([\s\S]*?)<\/script>/i,
  );
  if (page) {
    try {
      const value: unknown = JSON.parse(page[1]).props?.project?.voteCount;
      if (
        typeof value === 'number' &&
        Number.isSafeInteger(value) &&
        value >= 0
      )
        return value;
    } catch {
      /* Older renderings can still expose the counter in HTML. */
    }
  }
  const match =
    html.match(/>votar<\/span>[\s\S]{0,500}?font-mono[^>]*>(\d+)<\/span>/i) ??
    html.match(
      /animate-button-breathe[^>]*>[\s\S]{0,300}?font-mono[^>]*>(\d+)<\/div>/i,
    );
  const value = match ? Number(match[1]) : NaN;
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

async function fetchVotes(slug: string): Promise<number> {
  const response = await fetch(`${SOURCE_URL}/${slug}`, {
    cache: 'no-store',
    headers: { 'user-agent': 'WOKI Leaderboard/1.0' },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const votes = readVotes(await response.text());
  if (votes === null) throw new Error('No se encontró el contador');
  return votes;
}

export type LeaderboardData = {
  projects: Project[];
  updatedAt: string;
  live: boolean;
};

async function collectLeaderboard(): Promise<LeaderboardData> {
  const results = await Promise.allSettled(
    projects.map((project) => fetchVotes(project.slug)),
  );
  const liveCount = results.filter(
    (result) => result.status === 'fulfilled',
  ).length;
  const ranked = projects
    .map((project, index) => ({
      ...project,
      votes:
        results[index].status === 'fulfilled' ? results[index].value : null,
      stale: results[index].status !== 'fulfilled',
    }))
    .sort(
      (a, b) =>
        (b.votes ?? -1) - (a.votes ?? -1) || a.name.localeCompare(b.name),
    );

  return {
    projects: ranked,
    updatedAt: new Date().toISOString(),
    live: liveCount === projects.length,
  };
}

// Coalesce concurrent visitors within an instance. The CDN shares a short
// snapshot across visitors; no historical or invented counts are substituted.
let snapshot: LeaderboardData | undefined;
let pending: Promise<LeaderboardData> | undefined;
export function getLeaderboard(): Promise<LeaderboardData> {
  if (snapshot && Date.now() - Date.parse(snapshot.updatedAt) < 10_000)
    return Promise.resolve(snapshot);
  if (pending) return pending;
  pending = collectLeaderboard()
    .then((data) => {
      if (data.live) snapshot = data;
      return data;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}
