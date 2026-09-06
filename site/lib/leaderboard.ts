import type { LeaderboardData, Project } from './projects';

export const REFRESH_SECONDS = 15;

export function rankOf(projects: Project[], project: Project): number | null {
  if (project.votes === null) return null;
  return (
    1 +
    projects.filter(
      (other) => other.votes !== null && other.votes > project.votes!,
    ).length
  );
}

export function mergeSnapshot(
  previous: LeaderboardData,
  incoming: LeaderboardData,
): LeaderboardData {
  if (Date.parse(incoming.updatedAt) < Date.parse(previous.updatedAt))
    return previous;
  return {
    ...incoming,
    projects: incoming.projects
      .map((project) => {
        if (project.votes !== null && !project.stale) return project;
        const old = previous.projects.find(
          (entry) => entry.slug === project.slug,
        );
        return { ...project, votes: old?.votes ?? null, stale: true };
      })
      .sort(
        (a, b) =>
          (b.votes ?? -1) - (a.votes ?? -1) || a.name.localeCompare(b.name),
      ),
  };
}

export function voteChanges(
  previous: LeaderboardData,
  next: LeaderboardData,
): Record<string, number> {
  return Object.fromEntries(
    next.projects.flatMap((project) => {
      const old = previous.projects.find(
        (entry) => entry.slug === project.slug,
      );
      if (
        project.stale ||
        old?.stale ||
        project.votes === null ||
        old?.votes == null
      )
        return [];
      const delta = project.votes - old.votes;
      return delta ? [[project.slug, delta]] : [];
    }),
  );
}

export function validSnapshot(value: unknown): value is LeaderboardData {
  if (!value || typeof value !== 'object') return false;
  const data = value as LeaderboardData;
  return (
    typeof data.live === 'boolean' &&
    Number.isFinite(Date.parse(data.updatedAt)) &&
    Array.isArray(data.projects) &&
    data.projects.length > 0 &&
    new Set(data.projects.map((project) => project.slug)).size ===
      data.projects.length &&
    data.projects.every(
      (project) =>
        typeof project.slug === 'string' &&
        /^[a-z0-9-]+$/.test(project.slug) &&
        typeof project.name === 'string' &&
        typeof project.summary === 'string' &&
        (project.votes === null ||
          (Number.isSafeInteger(project.votes) && project.votes >= 0)),
    )
  );
}
