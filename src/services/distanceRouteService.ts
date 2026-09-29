import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { requireFirebase } from '../lib/firebase';
import { withTimeout } from '../shared/utils/async';
import type { DistanceRoute, DistanceRouteCategory } from '../types/models';
import { DEFAULT_DISTANCE_ROUTES } from '../domain/distance-equivalences/baseRoutes';

export interface DistanceRouteFormValues {
  name: string;
  fromLabel: string;
  toLabel: string;
  distanceMeters: number;
  category: DistanceRouteCategory;
  isFavorite: boolean;
}

export async function listUserDistanceRoutes(userId: string): Promise<DistanceRoute[]> {
  const { db } = requireFirebase();
  const snapshot = await withTimeout(
    getDocs(query(collection(db, 'distanceRoutes'), where('userId', 'in', [userId, 'global']), orderBy('isFavorite', 'desc'), orderBy('distanceMeters', 'asc'))),
    4000,
    'Firestore ha tardado demasiado cargando rutas.'
  );
  return mergeWithDefaultRoutes(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as DistanceRoute));
}

export function mergeWithDefaultRoutes(routes: DistanceRoute[]): DistanceRoute[] {
  const routeIds = new Set(routes.map((route) => route.id));
  return [...routes, ...DEFAULT_DISTANCE_ROUTES.filter((route) => !routeIds.has(route.id))]
    .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || a.distanceMeters - b.distanceMeters);
}

export async function createDistanceRoute(userId: string, values: DistanceRouteFormValues) {
  const { db } = requireFirebase();
  const ref = await addDoc(collection(db, 'distanceRoutes'), {
    userId,
    ...values,
    distanceMeters: Number(values.distanceMeters),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateDistanceRoute(id: string, values: DistanceRouteFormValues) {
  const { db } = requireFirebase();
  await updateDoc(doc(db, 'distanceRoutes', id), {
    ...values,
    distanceMeters: Number(values.distanceMeters),
    updatedAt: serverTimestamp()
  });
}

export async function deleteDistanceRoute(id: string) {
  const { db } = requireFirebase();
  await deleteDoc(doc(db, 'distanceRoutes', id));
}
