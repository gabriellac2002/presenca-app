import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/AuthContext';
import { FirebaseTurmaRepository } from '@/infrastructure/repositories/FirebaseTurmaRepository';
import type { Turma } from '@/domain/entities/Turma';

const repo = new FirebaseTurmaRepository();

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function ProfessorHome() {
  const colors = useTheme();
  const router = useRouter();
  const { professor, signOut } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const load = useCallback(async () => {
    if (!professor) return;
    try {
      const all = await repo.findByProfessorId(professor.id);
      setTurmas(all.filter(t => t.isScheduledToday()));
    } finally {
      setLoading(false);
    }
  }, [professor?.id]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [load]));

  const handleSignOut = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {professor?.photoUrl ? (
              <Image source={{ uri: professor.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
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
          <TouchableOpacity onPress={handleSignOut} hitSlop={8}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
        <Text style={styles.dateText}>{todayLabel}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Aulas de {DIAS[today.getDay()]}
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : turmas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Sem aulas hoje</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Nenhuma disciplina agendada para hoje
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {turmas.map(t => {
              const slot = t.getTodaySlot();
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: '/professor/disciplinas/[id]', params: { id: t.id } })}
                  activeOpacity={0.8}>
                  <View style={[styles.cardAccent, { backgroundColor: colors.primary }]} />
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardNome, { color: colors.text }]} numberOfLines={1}>
                      {t.nome}
                    </Text>
                    <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                      {t.codigo} · {t.periodo}
                    </Text>
                    {slot && (
                      <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={13} color={colors.primary} />
                        <Text style={[styles.timeText, { color: colors.primary }]}>
                          {slot.startTime} – {slot.endTime}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ marginRight: Spacing.md }} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  professorName: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    maxWidth: 200,
  },
  dateText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
  },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
    textTransform: 'capitalize',
  },
  list: { gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: Spacing.md, gap: 3 },
  cardNome: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  cardMeta: { fontSize: FontSize.sm },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  emptyCard: {
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
