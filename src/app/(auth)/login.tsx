import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { FirebaseAuthService } from '@/infrastructure/auth/FirebaseAuthService';

const authService = FirebaseAuthService.getInstance();

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
};

function parseError(code: string): string {
  return FIREBASE_ERRORS[code] ?? 'Erro inesperado. Tente novamente.';
}

export default function LoginScreen() {
  const colors = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authService.signIn(email.trim(), password);
    } catch (e: any) {
      setError(parseError(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Ionicons name="wifi" size={26} color="#fff" />
            </View>
            <View>
              <Text style={[styles.appName, { color: colors.text }]}>presença</Text>
              <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
                Registro de presenças
              </Text>
            </View>
          </View>

          <View style={styles.welcome}>
            <Text style={[styles.title, { color: colors.text }]}>Bem-vindo</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Entre com seu e-mail e senha
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Form */}
          <View style={styles.form}>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="E-mail"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Senha"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.primary }, isLoading && styles.disabled]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/registro')} style={styles.linkRow}>
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                Não tem conta?{' '}
                <Text style={{ color: colors.primary, fontWeight: FontWeight.semibold }}>Criar conta</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  appTagline: { fontSize: FontSize.xs },
  welcome: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.md },
  divider: { height: 1, marginBottom: Spacing.lg },
  form: { gap: Spacing.sm },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
  },
  errorBanner: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  errorText: { fontSize: FontSize.sm, textAlign: 'center' },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  btnPrimary: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },
  disabled: { opacity: 0.5 },
  linkRow: { alignItems: 'center', paddingVertical: Spacing.xs },
  linkText: { fontSize: FontSize.sm },
});
