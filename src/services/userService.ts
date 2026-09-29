import { doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, collection } from 'firebase/firestore';
import { requireFirebase } from '../lib/firebase';
import type { ProfileFormValues } from '../lib/validators';
import { withTimeout } from '../shared/utils/async';
import type { ThemePreference, UserProfile } from '../types/models';

export async function completeUserProfile(uid: string, email: string, values: ProfileFormValues) {
  const { db } = requireFirebase();
  const ref = doc(db, 'users', uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      ...values,
      profileCompleted: true,
      updatedAt: serverTimestamp()
    });
    return;
  }

  await setDoc(ref, {
    uid,
    email,
    ...values,
    role: 'user',
    profileCompleted: true,
    xp: 0,
    streakDays: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function updateUserProfile(uid: string, values: ProfileFormValues) {
  const { db } = requireFirebase();
  await updateDoc(doc(db, 'users', uid), {
    ...values,
    profileCompleted: true,
    updatedAt: serverTimestamp()
  });
}

export async function listUsers(): Promise<UserProfile[]> {
  const { db } = requireFirebase();
  const snapshot = await withTimeout(
    getDocs(query(collection(db, 'users'), where('role', 'in', ['user', 'admin']))),
    5000,
    'Firestore ha tardado demasiado cargando usuarios.'
  );
  return snapshot.docs.map((item) => item.data() as UserProfile);
}

export async function updateThemePreference(uid: string, themePreference: ThemePreference) {
  const { db } = requireFirebase();
  await updateDoc(doc(db, 'users', uid), {
    themePreference,
    updatedAt: serverTimestamp()
  });
}
