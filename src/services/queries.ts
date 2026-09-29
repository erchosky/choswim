import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { toDate } from '../lib/date';
import { listVisibleChallenges } from './challengeService';
import { listUserDistanceRoutes } from './distanceRouteService';
import { getLatestLeaderboard } from './leaderboardService';
import { getSession, listUserSessions, listUserSessionsPage } from './sessionService';
import { listUsers } from './userService';
import type { SwimSession } from '../types/models';

/**
 * Consultas de Firestore compartidas por las pantallas. TanStack Query cachea los
 * resultados entre páginas, así que volver al dashboard no repite las lecturas.
 */
export const queryKeys = {
  sessions: (uid: string, pageSize: number) => ['sessions', uid, pageSize] as const,
  sessionHistory: (uid: string) => ['sessions', uid, 'history'] as const,
  allSessions: ['sessions'] as const,
  session: (id: string) => ['session', id] as const,
  routes: (uid: string) => ['routes', uid] as const,
  challenges: (uid: string) => ['challenges', uid] as const,
  leaderboard: ['leaderboard'] as const,
  users: ['users'] as const
};

export function useUserSessions(uid: string | undefined, pageSize = 30) {
  return useQuery({
    queryKey: queryKeys.sessions(uid ?? '', pageSize),
    queryFn: () => listUserSessions(uid!, pageSize),
    enabled: Boolean(uid)
  });
}

/** Historial paginado por fecha (más recientes primero). */
export function useSessionHistory(uid: string | undefined, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.sessionHistory(uid ?? ''),
    queryFn: ({ pageParam }) => listUserSessionsPage(uid!, pageSize, pageParam),
    initialPageParam: undefined as Date | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === pageSize ? toDate(lastPage[lastPage.length - 1]!.date) : undefined,
    enabled: Boolean(uid)
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.session(id ?? ''),
    queryFn: () => getSession(id!),
    enabled: Boolean(id)
  });
}

const PROCESSING_POLL_MS = 1000;
const PROCESSING_MAX_POLLS = 30;

/** La Cloud Function marca la sesión como procesada al calcular XP y métricas. */
export function isProcessed(session: SwimSession | null | undefined) {
  return Boolean(session && (session.processingStatus === 'processed' || session.processedAt));
}

/**
 * Sesión recién creada: consulta cada segundo hasta que el servidor la procesa
 * (un arranque en frío de Functions puede tardar varios segundos) o hasta ~30 s.
 */
export function useProcessedSession(id: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [...queryKeys.session(id ?? ''), 'processed'] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => getSession(id!),
    enabled: Boolean(id),
    staleTime: 0,
    refetchInterval: (current) =>
      isProcessed(current.state.data) || current.state.dataUpdateCount >= PROCESSING_MAX_POLLS ? false : PROCESSING_POLL_MS
  });
  const polls = queryClient.getQueryState(queryKey)?.dataUpdateCount ?? 0;
  return { ...query, processingTimedOut: !isProcessed(query.data) && polls >= PROCESSING_MAX_POLLS };
}

export function useDistanceRoutes(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.routes(uid ?? ''),
    queryFn: () => listUserDistanceRoutes(uid!),
    enabled: Boolean(uid)
  });
}

export function useVisibleChallenges(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.challenges(uid ?? ''),
    queryFn: () => listVisibleChallenges(uid!),
    enabled: Boolean(uid)
  });
}

export function useLatestLeaderboard() {
  return useQuery({ queryKey: queryKeys.leaderboard, queryFn: getLatestLeaderboard });
}

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
}

/** Tras crear, editar o borrar una sesión: el servidor recalcula XP y estadísticas. */
export function useInvalidateSessions() {
  const queryClient = useQueryClient();
  return (sessionId?: string) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.allSessions });
    if (sessionId) void queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
  };
}

export function useInvalidateRoutes() {
  const queryClient = useQueryClient();
  return (uid: string) => queryClient.invalidateQueries({ queryKey: queryKeys.routes(uid) });
}
