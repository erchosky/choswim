import { httpsCallable } from 'firebase/functions';
import { requireFirebase } from '../lib/firebase';

export async function generateAiSessionReport(sessionId: string) {
  const { functions } = requireFirebase();
  const callable = httpsCallable(functions, 'generateAiSessionReport');
  const result = await callable({ sessionId });
  return result.data as { report: string };
}

export async function generateWeeklyPlan(goal: string) {
  const { functions } = requireFirebase();
  const callable = httpsCallable(functions, 'generateWeeklyPlan');
  const result = await callable({ goal });
  return result.data as { plan: string };
}
