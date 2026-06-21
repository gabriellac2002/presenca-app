import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { FirebaseTurmaRepository } from '@/infrastructure/repositories/FirebaseTurmaRepository';
import type { Turma } from '@/domain/entities/Turma';

const repo = new FirebaseTurmaRepository();

export default function RelatorioScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { turmaId } = useLocalSearchParams<{ turmaId: string }>();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!turmaId) { setLoading(false); return; }
    repo.findById(turmaId).then(t => {
      setTurma(t);
      setLoading(false);
    });
  }, [turmaId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Relatório de faltas</Text>
          {turma && (
            <Text style={styles.headerSub} numberOfLines={1}>{turma.nome}</Text>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="bar-chart-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Em breve</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>
              O relatório de presença e faltas estará disponível em breve. Aqui você poderá ver o histórico
              de todas as aulas, quais alunos compareceram e o percentual de frequência.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerText: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, marginTop: 2 },
  body: { flex: 1, justifyContent: 'center', padding: Spacing.lg },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  desc: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },
});
