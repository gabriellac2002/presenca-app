import type { Professor } from '@/domain/entities/Professor';

export interface IProfessorRepository {
  findById(id: string): Promise<Professor | null>;
  save(professor: Professor): Promise<void>;
  exists(id: string): Promise<boolean>;
}
