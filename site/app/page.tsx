import { LeaderboardClient } from './leaderboard-client';
import { getLeaderboard } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialData = await getLeaderboard();
  return <LeaderboardClient initialData={initialData} />;
}
