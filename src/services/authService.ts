import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { requireFirebase } from '../lib/firebase';
import { withTimeout } from '../shared/utils/async';
import type { UserProfile } from '../types/models';

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const { auth, db } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await updateProfile(credential.user, { displayName });
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      displayName,
      // El email normalizado de Auth: las reglas lo comparan con request.auth.token.email.
      email: credential.user.email ?? email.toLowerCase(),
      role: 'user',
      profileCompleted: false,
      xp: 0,
      streakDays: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: false });
  } catch (error) {
    await deleteUser(credential.user).catch((deleteError) => {
      if (import.meta.env.DEV) console.error('[auth] cleanup orphan user failed', deleteError);
    });
    throw error;
  }

  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const { auth } = requireFirebase();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  const { auth } = requireFirebase();
  return signOut(auth);
}

export async function resetPassword(email: string) {
  const { auth } = requireFirebase();
  return sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { db } = requireFirebase();
  const snapshot = await withTimeout(
    getDoc(doc(db, 'users', uid)),
    3000,
    'Firestore ha tardado demasiado cargando el perfil.'
  );
  return snapshot.exists() ? snapshot.data() as UserProfile : null;
}
