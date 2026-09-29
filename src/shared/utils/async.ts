export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

export function toVisibleError(error: unknown, fallback: string): string {
  if (error instanceof TimeoutError) return error.message;
  if (isFirestoreIndexError(error)) {
    return 'Falta configurar un índice de Firestore. Revisa la consola o despliega firestore.indexes.json.';
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function isFirestoreIndexError(error: unknown): boolean {
  const maybeError = error as { code?: string; message?: string } | undefined;
  const message = maybeError?.message ?? '';
  return maybeError?.code === 'failed-precondition' && /requires an index|index/i.test(message);
}

const loggedScopes = new Set<string>();

export function logErrorOnce(scope: string, error: unknown) {
  if (!import.meta.env.DEV) return;
  const key = `${scope}:${error instanceof Error ? error.message : String(error)}`;
  if (loggedScopes.has(key)) return;
  loggedScopes.add(key);
  console.error(scope, error);
}
