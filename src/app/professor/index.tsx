import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfessorHome() {
  const colors = useTheme();
  const { professor, signOut } = useAuth();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleSignOut = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {professor?.photoUrl ? (
              <Image source={{ uri: professor.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={styles.avatarInitials}>{professor?.initials ?? '?'}</Text>
              </View>
            )}
            <View>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.professorName} numberOfLines={1}>
                {professor?.name ?? 'Professor'}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} hitSlop={8}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>{today}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Action cards */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações</Text>

        <TouchableOpacity
          style={[styles.primaryCard, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}>
          <View style={styles.primaryCardContent}>
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.primaryCardTitle}>Criar turma</Text>
              <Text style={styles.primaryCardDesc}>
                Crie uma nova turma e gere QR Code de presença
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.85}>
          <View style={styles.primaryCardContent}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.primaryLight }]}>
              <MaterialIcons name="bar-chart" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.secondaryCardTitle, { color: colors.text }]}>
                Acompanhar presenças
              </Text>
              <Text style={[styles.secondaryCardDesc, { color: colors.textSecondary }]}>
                Veja o histórico e frequência por turma
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Minhas turmas */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Minhas turmas</Text>
        </View>

        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="school-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma turma ainda</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Crie sua primeira turma para começar a registrar presenças
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  professorName: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold, maxWidth: 200 },
  signOutBtn: { padding: Spacing.xs },
  date: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, textTransform: 'capitalize' },
  scroll: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xl * 2 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  sectionHeader: { marginTop: Spacing.lg },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  primaryCardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1, gap: 2 },
  primaryCardTitle: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  primaryCardDesc: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  secondaryCardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  secondaryCardDesc: { fontSize: FontSize.sm },
  emptyState: {
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs },
  emptyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
