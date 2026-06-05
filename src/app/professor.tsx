import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { createSession, stopSession, SESSION_DURATION_SECONDS } from '@/services/sessions';

export default function ProfessorScreen() {
  const colors = useTheme();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);

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

  const handleStopSession = useCallback(async () => {
    if (!sessionId) return;
    setStopping(true);
    setError(null);
    try {
      await stopSession(sessionId);
      setSessionId(null);
      setExpired(false);
      setSecondsLeft(0);
    } catch {
      setError('Erro ao encerrar sessão. Tente novamente.');
    } finally {
      setStopping(false);
    }
  }, [sessionId]);

  const handleGenerateQR = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = await createSession();
      setExpired(false);
      setSessionId(id);
    } catch {
      setError('Erro ao gerar QR Code. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Gerar Presença</Text>
        <Text style={styles.headerDate}>{today}</Text>
      </View>

      <View style={styles.qrArea}>
        {sessionId ? (
          <>
            <View style={[styles.qrCard, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
              <View style={expired ? styles.qrExpired : undefined}>
                <QRCode
                  value={sessionId}
                  size={220}
                  color={colors.text}
                  backgroundColor={colors.surface}
                />
              </View>
            </View>

            {expired ? (
              <View style={[styles.badge, { backgroundColor: colors.errorLight }]}>
                <Text style={[styles.badgeText, { color: colors.error }]}>QR Code expirado</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>
                  Expira em {formatTime(secondsLeft)}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.qrPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Gere um QR Code para os alunos registrarem presença
            </Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorLight }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        {sessionId && !expired && (
          <TouchableOpacity
            style={[styles.buttonOutline, { borderColor: colors.error }, stopping && styles.buttonDisabled]}
            onPress={handleStopSession}
            disabled={stopping || loading}
            activeOpacity={0.8}>
            {stopping ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={[styles.buttonOutlineText, { color: colors.error }]}>Encerrar QR Code</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleGenerateQR}
          disabled={loading || stopping}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {sessionId ? 'Gerar Novo QR Code' : 'Gerar QR Code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  headerDate: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'capitalize',
  },
  qrArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  qrCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  qrExpired: {
    opacity: 0.25,
  },
  qrPlaceholder: {
    width: 268,
    height: 268,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  errorBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  errorText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  buttonOutline: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  buttonOutlineText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
