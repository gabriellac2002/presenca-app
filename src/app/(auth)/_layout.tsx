import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { firebaseUser, professor, isLoading } = useAuth();

  if (!isLoading && professor) return <Redirect href="/professor" />;
  if (!isLoading && firebaseUser) return <Redirect href="/cadastro" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
