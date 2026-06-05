import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export const SESSION_DURATION_SECONDS = 5 * 60;

export async function createSession(teacherId = 'professor-demo'): Promise<string> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000);

  const docRef = await addDoc(collection(db, 'sessions'), {
    teacherId,
    createdAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    date: now.toISOString().split('T')[0],
    active: true,
  });

  return docRef.id;
}
