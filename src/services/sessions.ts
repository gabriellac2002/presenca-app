import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const SESSION_DURATION_SECONDS = 2 * 60 * 60; // 2 hours

export async function createSession(teacherId: string, turmaId?: string): Promise<string> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000);

  const docRef = await addDoc(collection(db, 'sessions'), {
    teacherId,
    turmaId: turmaId ?? null,
    createdAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    date: now.toISOString().split('T')[0],
    active: true,
  });

  return docRef.id;
}

export async function stopSession(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), { active: false });
}
