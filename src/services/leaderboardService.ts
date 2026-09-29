import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { requireFirebase } from '../lib/firebase';
import { withTimeout } from '../shared/utils/async';
import type { LeaderboardEntry } from '../types/models';

interface LeaderboardSnapshot {
  entries?: LeaderboardEntry[];
}

export async function getLatestLeaderboard(): Promise<LeaderboardEntry[]> {
  const { db } = requireFirebase();
  const snapshot = await withTimeout(
    getDocs(query(collection(db, 'leaderboardSnapshots'), orderBy('createdAt', 'desc'), limit(1))),
    5000,
    'Firestore ha tardado demasiado cargando el ranking.'
  );
  const data = snapshot.docs[0]?.data() as LeaderboardSnapshot | undefined;
  return Array.isArray(data?.entries) ? data.entries : [];
}
