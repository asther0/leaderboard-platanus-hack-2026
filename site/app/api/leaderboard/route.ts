import { getLeaderboard } from '@/lib/projects';

export async function GET() {
  try {
    const data = await getLeaderboard();
    if (data.projects.every((project) => project.votes === null)) {
      return Response.json({ error: 'Platanus no respondió. Reintentaremos en breve.' }, { status: 502 });
    }
    return Response.json(data, {
      headers: {
        'Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': data.live ? 'public, s-maxage=10' : 'no-store',
      },
    });
  } catch {
    return Response.json({ error: 'No se pudo consultar el leaderboard.' }, { status: 502 });
  }
}
