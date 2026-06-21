import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SectionList,
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

type Section = { title: string; data: Turma[] };

export default function DisciplinasScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { professor } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!professor) return;
    try {
      const all = await repo.findByProfessorId(professor.id);
      const grouped: Record<string, Turma[]> = {};
      for (const t of all) {
        if (!grouped[t.periodo]) grouped[t.periodo] = [];
        grouped[t.periodo].push(t);
      }
      const sorted = Object.keys(grouped)
        .sort()
        .reverse()
        .map(p => ({ title: p, data: grouped[p] }));
      setSections(sorted);
    } finally {
      setLoading(false);
    }
  }, [professor?.id]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [load]));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Disciplinas</Text>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          onPress={() => router.push('/professor/disciplinas/criar')}
          activeOpacity={0.8}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.createBtnText}>Criar disciplina</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="book-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma disciplina</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Crie sua primeira disciplina para começar
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/professor/disciplinas/criar')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Criar disciplina</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={t => t.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item: t }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: '/professor/disciplinas/[id]', params: { id: t.id } })}
              activeOpacity={0.8}>
              <View style={[styles.cardAccent, { backgroundColor: colors.primary }]} />
              <View style={styles.cardBody}>
                <Text style={[styles.cardNome, { color: colors.text }]} numberOfLines={1}>
                  {t.nome}
                </Text>
                <Text style={[styles.cardCodigo, { color: colors.textSecondary }]}>
                  {t.codigo}
                </Text>
                <Text style={[styles.cardHorarios, { color: colors.textSecondary }]} numberOfLines={1}>
                  {t.horariosFormatados}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ marginRight: Spacing.md }} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  headerTitle: { color: '#fff', fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  createBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
  },
  sectionHeaderText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: Spacing.md, gap: 2 },
  cardNome: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  cardCodigo: { fontSize: FontSize.sm },
  cardHorarios: { fontSize: FontSize.xs, marginTop: 2 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  emptyBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
