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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { Professor } from '@/domain/entities/Professor';
import { FirebaseProfessorRepository } from '@/infrastructure/repositories/FirebaseProfessorRepository';

type Role = 'professor' | 'aluno';

const professorRepo = new FirebaseProfessorRepository();

export default function CadastroScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { firebaseUser, professor, isLoading, completeRegistration } = useAuth();

  const [role, setRole] = useState<Role>('professor');
  const [name, setName] = useState(firebaseUser?.displayName ?? '');
  const [matricula, setMatricula] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!firebaseUser) return <Redirect href="/login" />;
  if (professor) return <Redirect href="/professor" />;

  const handleSave = async () => {
    if (role === 'aluno') {
      Alert.alert('Em breve', 'O cadastro para alunos estará disponível em breve.');
      return;
    }

    if (!name.trim()) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!matricula.trim()) {
      setError('Informe sua matrícula.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const prof = new Professor(
        firebaseUser.uid,
        firebaseUser.email ?? '',
        name.trim(),
        firebaseUser.photoURL ?? null,
        matricula.trim(),
      );
      await professorRepo.save(prof);
      completeRegistration(prof);
      router.replace('/professor');
    } catch {
      setError('Erro ao salvar. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSaving(false);
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
            <Text style={[styles.title, { color: colors.text }]}>Crie seu perfil</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Escolha como você vai usar o app
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Role cards */}
          <View style={styles.cards}>
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: role === 'professor' ? colors.primary : colors.surface,
                  borderColor: role === 'professor' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setRole('professor')}
              activeOpacity={0.8}>
              <View style={[styles.cardIcon, { backgroundColor: role === 'professor' ? 'rgba(255,255,255,0.2)' : colors.primaryLight }]}>
                <MaterialIcons
                  name="computer"
                  size={22}
                  color={role === 'professor' ? '#fff' : colors.primary}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: role === 'professor' ? '#fff' : colors.text }]}>
                  Professor
                </Text>
                <Text style={[styles.cardDesc, { color: role === 'professor' ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>
                  Gerar QR Code e gerenciar turmas
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={role === 'professor' ? '#fff' : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: role === 'aluno' ? colors.primary : colors.surface,
                  borderColor: role === 'aluno' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setRole('aluno')}
              activeOpacity={0.8}>
              <View style={[styles.cardIcon, { backgroundColor: role === 'aluno' ? 'rgba(255,255,255,0.2)' : colors.primaryLight }]}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={role === 'aluno' ? '#fff' : colors.primary}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: role === 'aluno' ? '#fff' : colors.text }]}>
                  Aluno
                </Text>
                <Text style={[styles.cardDesc, { color: role === 'aluno' ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>
                  Registrar presença e ver frequência
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={role === 'aluno' ? '#fff' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Professor form */}
          {role === 'professor' && (
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
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>
          )}

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              isSaving && styles.disabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}>
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {role === 'aluno' ? 'Em breve' : 'Criar perfil'}
              </Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
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
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  appTagline: {
    fontSize: FontSize.xs,
  },
  welcome: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.lg,
  },
  cards: {
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  cardDesc: {
    fontSize: FontSize.sm,
  },
  form: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
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
  errorText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
});
