import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/AuthContext';
import { FirebaseTurmaRepository } from '@/infrastructure/repositories/FirebaseTurmaRepository';
import type { Turma } from '@/domain/entities/Turma';
import { createSession, stopSession, SESSION_DURATION_SECONDS } from '@/services/sessions';

const repo = new FirebaseTurmaRepository();

const DIAS_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function DisciplinaDetailScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { professor } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [turma, setTurma] = useState<Turma | null>(null);
  const [loadingTurma, setLoadingTurma] = useState(true);

  // QR session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [stoppingSession, setStoppingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    repo.findById(id).then(t => {
      setTurma(t);
      setLoadingTurma(false);
    });
  }, [id]);

  useEffect(() => {
    if (!sessionId) return;
    setSecondsLeft(SESSION_DURATION_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleGenerateQR = useCallback(async () => {
    if (!professor || !turma) return;
    setLoadingSession(true);
    setSessionError(null);
    try {
      const sid = await createSession(professor.id, turma.id);
      setExpired(false);
      setSessionId(sid);
    } catch {
      setSessionError('Erro ao gerar QR Code. Verifique sua conexão.');
    } finally {
      setLoadingSession(false);
    }
  }, [professor, turma]);

  const handleStopSession = useCallback(async () => {
    if (!sessionId) return;
    setStoppingSession(true);
    setSessionError(null);
    try {
      await stopSession(sessionId);
      setSessionId(null);
      setExpired(false);
      setSecondsLeft(0);
    } catch {
      setSessionError('Erro ao encerrar sessão. Tente novamente.');
    } finally {
      setStoppingSession(false);
    }
  }, [sessionId]);

  if (loadingTurma) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!turma) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Disciplina não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const todaySlot = turma.getTodaySlot();
  const hasClassToday = !!todaySlot;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>{turma.nome}</Text>
          <Text style={styles.headerSub}>{turma.codigo} · {turma.periodo}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={16} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Professor</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{turma.professorNome}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Período</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{turma.periodo}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.infoRowWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Horários</Text>
            </View>
            <View style={styles.horariosList}>
              {turma.horarios.map((h, i) => (
                <Text key={i} style={[styles.horarioItem, { color: colors.text }]}>
                  {DIAS_ABREV[h.weekday]}: {h.startTime} – {h.endTime}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* QR Code section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Presença — {DIAS_FULL[new Date().getDay()]}
        </Text>

        {!hasClassToday ? (
          <View style={[styles.noClassCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="moon-outline" size={28} color={colors.textSecondary} />
            <Text style={[styles.noClassText, { color: colors.textSecondary }]}>
              Sem aula hoje para esta disciplina
            </Text>
          </View>
        ) : (
          <View style={[styles.qrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {todaySlot && (
              <View style={[styles.todayBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <Text style={[styles.todayBadgeText, { color: colors.primary }]}>
                  Hoje: {todaySlot.startTime} – {todaySlot.endTime}
                </Text>
              </View>
            )}

            {sessionId ? (
              <>
                <View style={expired ? styles.qrExpired : undefined}>
                  <QRCode
                    value={sessionId}
                    size={200}
                    color={colors.text}
                    backgroundColor={colors.surface}
                  />
                </View>

                {expired ? (
                  <View style={[styles.statusBadge, { backgroundColor: colors.errorLight }]}>
                    <Text style={[styles.statusBadgeText, { color: colors.error }]}>QR Code expirado</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
                    <Text style={[styles.statusBadgeText, { color: colors.success }]}>
                      Expira em {formatTime(secondsLeft)}
                    </Text>
                  </View>
                )}

                {sessionError && (
                  <Text style={[styles.sessionError, { color: colors.error }]}>{sessionError}</Text>
                )}

                <View style={styles.sessionActions}>
                  {!expired && (
                    <TouchableOpacity
                      style={[styles.stopBtn, { borderColor: colors.error }, stoppingSession && styles.disabled]}
                      onPress={handleStopSession}
                      disabled={stoppingSession || loadingSession}
                      activeOpacity={0.8}>
                      {stoppingSession ? (
                        <ActivityIndicator color={colors.error} size="small" />
                      ) : (
                        <Text style={[styles.stopBtnText, { color: colors.error }]}>Encerrar</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.generateBtn, { backgroundColor: colors.primary }, loadingSession && styles.disabled]}
                    onPress={handleGenerateQR}
                    disabled={loadingSession || stoppingSession}
                    activeOpacity={0.8}>
                    {loadingSession ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.generateBtnText}>Gerar novo QR Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.qrPlaceholder, { borderColor: colors.border }]}>
                  <Ionicons name="qr-code-outline" size={56} color={colors.textSecondary} />
                  <Text style={[styles.qrPlaceholderText, { color: colors.textSecondary }]}>
                    Gere o QR Code para os alunos registrarem presença
                  </Text>
                </View>

                {sessionError && (
                  <Text style={[styles.sessionError, { color: colors.error }]}>{sessionError}</Text>
                )}

                <TouchableOpacity
                  style={[styles.generateBtn, { backgroundColor: colors.primary }, loadingSession && styles.disabled]}
                  onPress={handleGenerateQR}
                  disabled={loadingSession}
                  activeOpacity={0.8}>
                  {loadingSession ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="qr-code-outline" size={18} color="#fff" />
                      <Text style={styles.generateBtnText}>Gerar QR Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Alunos */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Alunos ({turma.alunos.length})
        </Text>
        <View style={[styles.emptyAlunos, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="people-outline" size={28} color={colors.textSecondary} />
          <Text style={[styles.emptyAlunosText, { color: colors.textSecondary }]}>
            Nenhum aluno matriculado
          </Text>
        </View>

        {/* Relatório */}
        <TouchableOpacity
          style={[styles.relatorioBtn, { borderColor: colors.primary }]}
          onPress={() => router.push({ pathname: '/professor/disciplinas/relatorio', params: { turmaId: turma.id } })}
          activeOpacity={0.8}>
          <Ionicons name="bar-chart-outline" size={18} color={colors.primary} />
          <Text style={[styles.relatorioBtnText, { color: colors.primary }]}>
            Ver relatório de faltas
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: Spacing.md },
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
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  infoCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoRowWrap: { gap: Spacing.xs },
  infoLabel: { fontSize: FontSize.sm, minWidth: 64 },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, flex: 1 },
  infoDivider: { height: 1 },
  horariosList: { gap: 2, paddingLeft: 24 },
  horarioItem: { fontSize: FontSize.sm },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  noClassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  noClassText: { fontSize: FontSize.sm, flex: 1 },
  qrCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  todayBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  qrExpired: { opacity: 0.25 },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  sessionError: { fontSize: FontSize.sm, textAlign: 'center' },
  sessionActions: { flexDirection: 'row', gap: Spacing.sm, alignSelf: 'stretch' },
  stopBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  generateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  generateBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  qrPlaceholderText: { fontSize: FontSize.sm, textAlign: 'center' },
  emptyAlunos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  emptyAlunosText: { fontSize: FontSize.sm, flex: 1 },
  relatorioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  relatorioBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, flex: 1, textAlign: 'center' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: FontSize.md },
  disabled: { opacity: 0.5 },
});
