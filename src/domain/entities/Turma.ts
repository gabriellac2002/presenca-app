export interface ScheduleSlot {
  weekday: number;   // 0=Domingo … 6=Sábado
  startTime: string; // "21:00"
  endTime: string;   // "23:00"
}

const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

export class Turma {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly codigo: string,
    public readonly periodo: string,       // e.g. "2025.1"
    public readonly professorId: string,
    public readonly professorNome: string,
    public readonly alunos: string[],      // UIDs (empty until enrollment is built)
    public readonly horarios: ScheduleSlot[],
    public readonly criadaEm: Date,
  ) {}

  get horariosFormatados(): string {
    return this.horarios
      .map(h => `${DIAS_ABREV[h.weekday]}: ${h.startTime}–${h.endTime}`)
      .join('  |  ');
  }

  isScheduledToday(): boolean {
    const today = new Date().getDay();
    return this.horarios.some(h => h.weekday === today);
  }

  getTodaySlot(): ScheduleSlot | undefined {
    const today = new Date().getDay();
    return this.horarios.find(h => h.weekday === today);
  }
}
