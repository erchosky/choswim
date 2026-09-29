import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { requireFirebase } from '../lib/firebase';
import { withTimeout } from '../shared/utils/async';
import type { Challenge } from '../types/models';

export async function listVisibleChallenges(userId: string): Promise<Challenge[]> {
  const { db } = requireFirebase();
  const snapshot = await withTimeout(
    getDocs(query(collection(db, 'challenges'), where('status', '==', 'active'), where('visibility', 'in', ['global', 'friends']), orderBy('endDate', 'asc'))),
    5000,
    'Firestore ha tardado demasiado cargando retos.'
  );
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as Challenge)
    .filter((challenge) => challenge.visibility !== 'private' || challenge.createdBy === userId);
}
