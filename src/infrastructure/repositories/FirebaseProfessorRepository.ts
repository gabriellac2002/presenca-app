import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Professor } from '@/domain/entities/Professor';
import type { IProfessorRepository } from '@/domain/repositories/IProfessorRepository';

export class FirebaseProfessorRepository implements IProfessorRepository {
  private readonly collection = 'professors';

  async findById(id: string): Promise<Professor | null> {
    const snap = await getDoc(doc(db, this.collection, id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return new Professor(id, data.email, data.name, data.photoUrl ?? null, data.matricula ?? '');
  }

  async save(professor: Professor): Promise<void> {
    await setDoc(
      doc(db, this.collection, professor.id),
      { email: professor.email, name: professor.name, photoUrl: professor.photoUrl, matricula: professor.matricula },
      { merge: true },
    );
  }

  async exists(id: string): Promise<boolean> {
    const snap = await getDoc(doc(db, this.collection, id));
    return snap.exists();
  }
}
