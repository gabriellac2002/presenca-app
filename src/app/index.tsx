import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function Index() {
  const { firebaseUser, professor, isLoading } = useAuth();
  const colors = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!firebaseUser) return <Redirect href="/login" />;
  if (!professor) return <Redirect href="/cadastro" />;
  return <Redirect href="/professor" />;
}
