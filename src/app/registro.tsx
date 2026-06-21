import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { FirebaseAuthService } from '@/infrastructure/auth/FirebaseAuthService';
import { FirebaseProfessorRepository } from '@/infrastructure/repositories/FirebaseProfessorRepository';
import { Professor } from '@/domain/entities/Professor';
import { storage } from '@/config/firebase';

type Role = 'professor' | 'aluno';
type Step = 1 | 2;

const authService = FirebaseAuthService.getInstance();
const professorRepo = new FirebaseProfessorRepository();

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
};

function parseError(code: string): string {
  return FIREBASE_ERRORS[code] ?? 'Erro inesperado. Tente novamente.';
}

async function uploadProfilePhoto(uid: string, uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile-photos/${uid}.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch {
    return null;
  }
}

export default function RegistroScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { professor, isLoading: authLoading, completeRegistration } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>('professor');

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (professor) return <Redirect href="/professor" />;

  const handleContinue = () => {
    setError(null);
    if (!email.trim() || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (role === 'aluno') {
      Alert.alert('Em breve', 'O cadastro para alunos estará disponível em breve.');
      return;
    }
    setStep(2);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleCreateAccount = async () => {
    setError(null);
    if (!name.trim()) { setError('Informe seu nome completo.'); return; }
    if (!matricula.trim()) { setError('Informe sua matrícula.'); return; }

    setIsLoading(true);
    try {
      const user = await authService.createAccount(email.trim(), password);

      const photoUrl = photoUri ? await uploadProfilePhoto(user.uid, photoUri) : null;

      const prof = new Professor(
        user.uid,
        user.email ?? '',
        name.trim(),
        photoUrl,
        matricula.trim(),
      );
      await professorRepo.save(prof);
      completeRegistration(prof);
      router.replace('/professor');
    } catch (e: any) {
      setError(parseError(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            {step === 2 && (
              <TouchableOpacity onPress={() => { setStep(1); setError(null); }} style={styles.backBtn} hitSlop={8}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
            )}
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Ionicons name="wifi" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appName, { color: colors.text }]}>presença</Text>
              <Text style={[styles.appTagline, { color: colors.textSecondary }]}>Criar conta</Text>
            </View>
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.stepLine, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
            <View style={[styles.stepDot, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
          </View>

          <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
            Etapa {step} de 2 — {step === 1 ? 'Suas informações' : 'Perfil do professor'}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {step === 1 ? (
            <>
              {/* Email */}
              <View style={styles.form}>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="E-mail institucional"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </View>

                {/* Senha */}
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Senha"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Confirmar senha */}
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirmar senha"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Role cards */}
              <Text style={[styles.roleLabel, { color: colors.text }]}>Você é:</Text>
              <View style={styles.cards}>
                <TouchableOpacity
                  style={[styles.card, { backgroundColor: role === 'professor' ? colors.primary : colors.surface, borderColor: role === 'professor' ? colors.primary : colors.border }]}
                  onPress={() => setRole('professor')}
                  activeOpacity={0.8}>
                  <View style={[styles.cardIcon, { backgroundColor: role === 'professor' ? 'rgba(255,255,255,0.2)' : colors.primaryLight }]}>
                    <MaterialIcons name="computer" size={20} color={role === 'professor' ? '#fff' : colors.primary} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: role === 'professor' ? '#fff' : colors.text }]}>Professor</Text>
                    <Text style={[styles.cardDesc, { color: role === 'professor' ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>Gerar QR Code e gerenciar turmas</Text>
                  </View>
                  <Ionicons name={role === 'professor' ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={role === 'professor' ? '#fff' : colors.border} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.card, { backgroundColor: role === 'aluno' ? colors.primary : colors.surface, borderColor: role === 'aluno' ? colors.primary : colors.border }]}
                  onPress={() => setRole('aluno')}
                  activeOpacity={0.8}>
                  <View style={[styles.cardIcon, { backgroundColor: role === 'aluno' ? 'rgba(255,255,255,0.2)' : colors.primaryLight }]}>
                    <Ionicons name="person-outline" size={20} color={role === 'aluno' ? '#fff' : colors.primary} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: role === 'aluno' ? '#fff' : colors.text }]}>Aluno</Text>
                    <Text style={[styles.cardDesc, { color: role === 'aluno' ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>Registrar presença e ver frequência</Text>
                  </View>
                  <Ionicons name={role === 'aluno' ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={role === 'aluno' ? '#fff' : colors.border} />
                </TouchableOpacity>
              </View>

              {error && <View style={[styles.errorBanner, { backgroundColor: colors.errorLight }]}><Text style={[styles.errorText, { color: colors.error }]}>{error}</Text></View>}

              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleContinue} activeOpacity={0.8}>
                <Text style={styles.btnPrimaryText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  Já tem conta?{' '}
                  <Text style={{ color: colors.primary, fontWeight: FontWeight.semibold }}>Entrar</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Step 2: Professor profile */}
              <View style={styles.photoSection}>
                <TouchableOpacity onPress={pickPhoto} style={styles.photoBtn}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                  ) : (
                    <View style={[styles.photoPlaceholder, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="camera-outline" size={34} color={colors.primary} />
                    </View>
                  )}
                  <View style={[styles.photoBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="add" size={14} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
                  {photoUri ? 'Toque para trocar a foto' : 'Toque para adicionar foto'}
                </Text>
              </View>

              <View style={styles.form}>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Nome completo"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Matrícula"
                    placeholderTextColor={colors.textSecondary}
                    value={matricula}
                    onChangeText={setMatricula}
                    autoCapitalize="characters"
                    returnKeyType="done"
                    onSubmitEditing={handleCreateAccount}
                  />
                </View>
              </View>

              {error && <View style={[styles.errorBanner, { backgroundColor: colors.errorLight }]}><Text style={[styles.errorText, { color: colors.error }]}>{error}</Text></View>}

              <TouchableOpacity
                style={[styles.btnPrimary, { backgroundColor: colors.primary }, isLoading && styles.disabled]}
                onPress={handleCreateAccount}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.btnPrimaryText}>Criar conta</Text>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  backBtn: { padding: 4 },
  logoBox: { width: 40, height: 40, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  appTagline: { fontSize: FontSize.xs },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: 0,
  },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { flex: 1, height: 2, marginHorizontal: Spacing.xs },
  stepLabel: { fontSize: FontSize.sm, marginTop: Spacing.xs, marginBottom: Spacing.md },
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
  input: { flex: 1, paddingVertical: Spacing.md, fontSize: FontSize.md },
  roleLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  cards: { gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  cardIcon: { width: 38, height: 38, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  cardDesc: { fontSize: FontSize.sm },
  errorBanner: { marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md },
  errorText: { fontSize: FontSize.sm, textAlign: 'center' },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  btnPrimaryText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
  linkRow: { alignItems: 'center', marginTop: Spacing.lg },
  linkText: { fontSize: FontSize.sm },
  disabled: { opacity: 0.5 },
  photoSection: { alignItems: 'center', marginBottom: Spacing.lg },
  photoBtn: { position: 'relative', marginBottom: Spacing.sm },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: { fontSize: FontSize.sm },
});
