import type { User as FirebaseUser } from 'firebase/auth';

export class Professor {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly photoUrl: string | null,
    public readonly matricula: string = '',
  ) {}

  static fromFirebaseUser(user: FirebaseUser): Professor {
    return new Professor(
      user.uid,
      user.email ?? '',
      user.displayName ?? 'Professor',
      user.photoURL ?? null,
    );
  }

  get initials(): string {
    return this.name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
}
