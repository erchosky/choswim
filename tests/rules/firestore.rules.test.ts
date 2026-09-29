/**
 * Tests de las reglas de Firestore contra el emulador:
 *   npm run test:rules
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

let env: RulesTestEnvironment;

const ALICE = { uid: 'alice', email: 'alice@example.com' };

function aliceDb() {
  return env.authenticatedContext(ALICE.uid, { email: ALICE.email }).firestore();
}

const baseUser = {
  uid: ALICE.uid,
  email: ALICE.email,
  displayName: 'Alice',
  role: 'user',
  profileCompleted: false,
  xp: 0,
  streakDays: 0
};

function manualSession(extra: Record<string, unknown> = {}) {
  return {
    userId: ALICE.uid,
    source: 'manual',
    date: Timestamp.now(),
    poolLengthMeters: 25,
    totalDistanceMeters: 1000,
    totalTimeMinutes: 45,
    activeTimeMinutes: 35,
    restTimeMinutes: 10,
    laps: 40,
    style: 'mixed',
    intensity: 6,
    perceivedEffort: 6,
    waterWeights: 'none',
    goal: 'endurance',
    processingStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...extra
  };
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-chooseswim-rules',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 }
  });
});

beforeEach(async () => {
  await env.clearFirestore();
});

after(async () => {
  await env.cleanup();
});

describe('perfil de usuario', () => {
  it('permite crear el perfil propio con campos de perfil', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'users/alice'), baseUser));
  });

  it('impide crear el perfil con estadísticas o XP inventados', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'users/alice'), { ...baseUser, weeklyXP: 99999 }));
    await assertFails(setDoc(doc(aliceDb(), 'users/alice'), { ...baseUser, xp: 5000 }));
  });

  it('impide auto-asignarse el rol de administrador', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'users/alice'), { ...baseUser, role: 'admin' }));
    await env.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), 'users/alice'), baseUser));
    await assertFails(updateDoc(doc(aliceDb(), 'users/alice'), { role: 'admin' }));
  });

  it('solo deja editar campos de perfil', async () => {
    await env.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), 'users/alice'), baseUser));
    await assertSucceeds(updateDoc(doc(aliceDb(), 'users/alice'), { weightKg: 70, updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(aliceDb(), 'users/alice'), { xp: 10 }));
  });
});

describe('sesiones', () => {
  it('permite crear una sesión manual válida y sin campos opcionales', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'swimSessions/s1'), manualSession()));
  });

  it('impide escribir el XP calculado por el servidor', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'swimSessions/s1'), manualSession({ computedXP: 9999 })));
  });

  it('impide crear sesiones a nombre de otro usuario', async () => {
    await assertFails(setDoc(doc(aliceDb(), 'swimSessions/s1'), manualSession({ userId: 'bob' })));
  });

  it('la app iOS puede comprobar si un entreno de Apple Health ya existe', async () => {
    // El uploader hace getDocument() antes de crear: sobre un documento inexistente.
    const snapshot = await assertSucceeds(getDoc(doc(aliceDb(), 'swimSessions/apple_health_alice_ABC-123')));
    assert.equal(snapshot.exists(), false);
  });

  it('no permite sondear identificadores de otros usuarios', async () => {
    await assertFails(getDoc(doc(aliceDb(), 'swimSessions/apple_health_bob_ABC-123')));
  });

  it('no permite leer sesiones ajenas', async () => {
    await env.withSecurityRulesDisabled((context) =>
      setDoc(doc(context.firestore(), 'swimSessions/bob-session'), manualSession({ userId: 'bob' }))
    );
    await assertFails(getDoc(doc(aliceDb(), 'swimSessions/bob-session')));
  });
});
