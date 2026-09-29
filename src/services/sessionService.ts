import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where
} from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { requireFirebase } from '../lib/firebase';
import { withTimeout } from '../shared/utils/async';
import type { SwimSessionFormValues } from '../lib/validators';
import { fromDateInput } from '../lib/date';
import type { SwimSession, UserProfile } from '../types/models';

export async function listUserSessions(userId: string, pageSize = 30): Promise<SwimSession[]> {
  const { db } = requireFirebase();
  const snapshot = await withTimeout(
    getDocs(query(collection(db, 'swimSessions'), where('userId', '==', userId), orderBy('date', 'desc'), limit(pageSize))),
    5000,
    'Firestore ha tardado demasiado cargando sesiones.'
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as SwimSession);
}

export async function listUserSessionsPage(userId: string, pageSize = 20, afterDate?: Date | string) {
  const { db } = requireFirebase();
  const constraints: QueryConstraint[] = [where('userId', '==', userId), orderBy('date', 'desc')];
  if (afterDate) constraints.push(startAfter(new Date(afterDate)));
  constraints.push(limit(pageSize));
  const snapshot = await withTimeout(
    getDocs(query(collection(db, 'swimSessions'), ...constraints)),
    5000,
    'Firestore ha tardado demasiado cargando sesiones.'
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as SwimSession);
}

export async function getSession(id: string): Promise<SwimSession | null> {
  const { db } = requireFirebase();
  const snapshot = await withTimeout(getDoc(doc(db, 'swimSessions', id)), 5000, 'Firestore ha tardado demasiado cargando la sesión.');
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as SwimSession) : null;
}

export async function createSession(user: UserProfile, values: SwimSessionFormValues) {
  const { db } = requireFirebase();
  const payload = {
    ...values,
    userId: user.uid,
    source: 'manual',
    date: fromDateInput(values.date),
    processingStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'swimSessions'), payload);
  return ref.id;
}

export async function updateSessionNotes(id: string, notes: string) {
  const { db } = requireFirebase();
  await updateDoc(doc(db, 'swimSessions', id), {
    notes,
    updatedAt: serverTimestamp()
  });
}

export async function updateSession(id: string, values: SwimSessionFormValues) {
  const { db } = requireFirebase();
  await updateDoc(doc(db, 'swimSessions', id), {
    ...values,
    date: fromDateInput(values.date),
    processingStatus: 'pending',
    updatedAt: serverTimestamp()
  });
}

export async function deleteSession(id: string) {
  const { db } = requireFirebase();
  await deleteDoc(doc(db, 'swimSessions', id));
}
