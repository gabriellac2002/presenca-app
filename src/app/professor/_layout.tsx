import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProfessorLayout() {
  const { firebaseUser, professor, isLoading } = useAuth();

  if (!isLoading && !professor) {
    return <Redirect href={firebaseUser ? '/cadastro' : '/login'} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
