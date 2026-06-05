import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { createSession, SESSION_DURATION_SECONDS } from '@/lib/sessions';

export default function ProfessorScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Gerar Presença</Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>{today}</Text>

      <View style={styles.qrArea}>
        {sessionId ? (
          <>
            <View style={[styles.qrWrapper, { backgroundColor: colors.backgroundElement }]}>
              <View style={expired ? styles.qrExpired : undefined}>
                <QRCode
                  value={sessionId}
                  size={220}
                  color={colors.text}
                  backgroundColor={colors.backgroundElement}
                />
              </View>
            </View>

            {expired ? (
              <Text style={styles.expiredText}>QR Code expirado</Text>
            ) : (
              <Text style={[styles.countdown, { color: colors.textSecondary }]}>
                Expira em {formatTime(secondsLeft)}
              </Text>
            )}
          </>
        ) : (
          <View style={[styles.qrPlaceholder, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Gere um QR Code para os alunos registrarem presença
            </Text>
          </View>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerateQR}
        disabled={loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {sessionId ? 'Gerar Novo QR Code' : 'Gerar QR Code'}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  date: {
    fontSize: 14,
    marginBottom: Spacing.three,
    textTransform: 'capitalize',
  },
  qrArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  qrWrapper: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  qrExpired: {
    opacity: 0.3,
  },
  qrPlaceholder: {
    width: 260,
    height: 260,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  countdown: {
    fontSize: 18,
    fontWeight: '500',
  },
  expiredText: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '600',
  },
  errorText: {
    color: '#E53E3E',
    textAlign: 'center',
    fontSize: 14,
    marginHorizontal: Spacing.three,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.three,
    alignItems: 'center',
    minWidth: 220,
    marginBottom: Spacing.four,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
