import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Spacing, Radius, FontSize, FontWeight } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/AuthContext';
import { FirebaseTurmaRepository } from '@/infrastructure/repositories/FirebaseTurmaRepository';
import type { ScheduleSlot } from '@/domain/entities/Turma';

const repo = new FirebaseTurmaRepository();

const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type SlotDraft = { weekday: number; startTime: string; endTime: string };

function isValidTime(t: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(t)) return false;
  const [h, m] = t.split(':').map(Number);
  return h >= 0 && h < 24 && m >= 0 && m < 60;
}

export default function CriarDisciplinaScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { professor } = useAuth();

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [semestre, setSemestre] = useState<'1' | '3'>('1');
  const [slots, setSlots] = useState<SlotDraft[]>([
    { weekday: -1, startTime: '', endTime: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSlot = () =>
    setSlots(prev => [...prev, { weekday: -1, startTime: '', endTime: '' }]);

  const removeSlot = (i: number) =>
    setSlots(prev => prev.filter((_, idx) => idx !== i));

  const updateSlot = (i: number, field: keyof SlotDraft, value: string | number) =>
    setSlots(prev => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleCreate = async () => {
    setError(null);
    if (!nome.trim()) { setError('Informe o nome da disciplina.'); return; }
    if (!codigo.trim()) { setError('Informe o código da disciplina.'); return; }
    if (slots.length === 0) { setError('Adicione pelo menos um horário.'); return; }

    for (const s of slots) {
      if (s.weekday === -1) { setError('Selecione o dia da semana para todos os horários.'); return; }
      if (!isValidTime(s.startTime)) { setError('Use o formato HH:MM no horário de início.'); return; }
      if (!isValidTime(s.endTime)) { setError('Use o formato HH:MM no horário de fim.'); return; }
      if (s.startTime >= s.endTime) { setError('O horário de fim deve ser posterior ao de início.'); return; }
    }

    setIsLoading(true);
    try {
      await repo.create({
        nome: nome.trim(),
        codigo: codigo.trim().toUpperCase(),
        periodo: `${year}.${semestre}`,
        professorId: professor!.id,
        professorNome: professor!.name,
        horarios: slots as ScheduleSlot[],
      });
      router.back();
    } catch {
      setError('Erro ao criar disciplina. Tente novamente.');
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

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.topBarTitle, { color: colors.text }]}>Nova disciplina</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Nome */}
          <Text style={[styles.label, { color: colors.text }]}>Nome da disciplina</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="book-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ex: Sistemas Operacionais"
              placeholderTextColor={colors.textSecondary}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Código */}
          <Text style={[styles.label, { color: colors.text }]}>Código</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="barcode-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ex: SO001"
              placeholderTextColor={colors.textSecondary}
              value={codigo}
              onChangeText={setCodigo}
              autoCapitalize="characters"
              returnKeyType="next"
            />
          </View>

          {/* Período */}
          <Text style={[styles.label, { color: colors.text }]}>Período</Text>
          <View style={styles.periodoRow}>
            {/* Year stepper */}
            <View style={[styles.yearStepper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setYear(y => y - 1)}
                hitSlop={8}
                style={styles.stepperBtn}>
                <Ionicons name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.yearText, { color: colors.text }]}>{year}</Text>
              <TouchableOpacity
                onPress={() => setYear(y => y + 1)}
                hitSlop={8}
                style={styles.stepperBtn}>
                <Ionicons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Semester toggle */}
            <View style={[styles.semestreRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {(['1', '3'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.semestreBtn,
                    semestre === s && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSemestre(s)}>
                  <Text style={[
                    styles.semestreBtnText,
                    { color: semestre === s ? '#fff' : colors.text },
                  ]}>
                    .{s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={[styles.periodoPreview, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.periodoPreviewText, { color: colors.primary }]}>
                {year}.{semestre}
              </Text>
            </View>
          </View>

          {/* Horários */}
          <View style={styles.horariosHeader}>
            <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Horários</Text>
            <TouchableOpacity onPress={addSlot} style={styles.addSlotBtn} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.addSlotText, { color: colors.primary }]}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {slots.map((slot, i) => (
            <View
              key={i}
              style={[styles.slotCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Remove button */}
              {slots.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeSlot(i)}
                  style={styles.removeBtn}
                  hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              )}

              {/* Day chips */}
              <Text style={[styles.slotLabel, { color: colors.textSecondary }]}>Dia da semana</Text>
              <View style={styles.daysRow}>
                {DIAS_ABREV.map((dia, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => updateSlot(i, 'weekday', idx)}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: slot.weekday === idx ? colors.primary : colors.background,
                        borderColor: slot.weekday === idx ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[
                      styles.dayChipText,
                      { color: slot.weekday === idx ? '#fff' : colors.textSecondary },
                    ]}>
                      {dia}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Times */}
              <Text style={[styles.slotLabel, { color: colors.textSecondary }]}>Horário</Text>
              <View style={styles.timesRow}>
                <View style={[styles.timeInput, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <TextInput
                    style={[styles.timeInputText, { color: colors.text }]}
                    placeholder="19:00"
                    placeholderTextColor={colors.textSecondary}
                    value={slot.startTime}
                    onChangeText={v => updateSlot(i, 'startTime', v)}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    returnKeyType="next"
                  />
                </View>
                <Text style={[styles.timesSeparator, { color: colors.textSecondary }]}>até</Text>
                <View style={[styles.timeInput, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <TextInput
                    style={[styles.timeInputText, { color: colors.text }]}
                    placeholder="21:00"
                    placeholderTextColor={colors.textSecondary}
                    value={slot.endTime}
                    onChangeText={v => updateSlot(i, 'endTime', v)}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          ))}

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }, isLoading && styles.disabled]}
            onPress={handleCreate}
            disabled={isLoading}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Criar disciplina</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  topBarTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
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
  periodoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  yearStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  yearText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, minWidth: 44, textAlign: 'center' },
  semestreRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  semestreBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  semestreBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  periodoPreview: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  periodoPreviewText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  horariosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  addSlotBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addSlotText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  slotCard: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  removeBtn: { alignSelf: 'flex-end', marginBottom: -Spacing.xs },
  slotLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.4 },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  dayChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  dayChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  timeInputText: { fontSize: FontSize.md, textAlign: 'center' },
  timesSeparator: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  errorBanner: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  errorText: { fontSize: FontSize.sm, textAlign: 'center' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  submitBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  disabled: { opacity: 0.5 },
});
