import {
  collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Turma, ScheduleSlot } from '@/domain/entities/Turma';

type CreateInput = {
  nome: string;
  codigo: string;
  periodo: string;
  professorId: string;
  professorNome: string;
  horarios: ScheduleSlot[];
};

export class FirebaseTurmaRepository {
  private readonly col = 'turmas';

  async create(input: CreateInput): Promise<Turma> {
    const ref = doc(collection(db, this.col));
    const now = new Date();
    const turma = new Turma(
      ref.id,
      input.nome,
      input.codigo,
      input.periodo,
      input.professorId,
      input.professorNome,
      [],
      input.horarios,
      now,
    );
    await setDoc(ref, {
      nome: turma.nome,
      codigo: turma.codigo,
      periodo: turma.periodo,
      professorId: turma.professorId,
      professorNome: turma.professorNome,
      alunos: turma.alunos,
      horarios: turma.horarios,
      criadaEm: Timestamp.fromDate(now),
    });
    return turma;
  }

  async findById(id: string): Promise<Turma | null> {
    const snap = await getDoc(doc(db, this.col, id));
    if (!snap.exists()) return null;
    return this.fromDoc(snap.id, snap.data());
  }

  async findByProfessorId(professorId: string): Promise<Turma[]> {
    const q = query(
      collection(db, this.col),
      where('professorId', '==', professorId),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => this.fromDoc(d.id, d.data()));
  }

  private fromDoc(id: string, data: any): Turma {
    return new Turma(
      id,
      data.nome,
      data.codigo,
      data.periodo,
      data.professorId,
      data.professorNome,
      data.alunos ?? [],
      data.horarios ?? [],
      data.criadaEm?.toDate() ?? new Date(),
    );
  }
}
