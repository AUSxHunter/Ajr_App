import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Modal, Button, NumberInput } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { IbadahType } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface AddSetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: number, notes?: string, durationSeconds?: number) => void;
  ibadahType: IbadahType | null;
  initialValue?: number;
  timerSeconds?: number;
  isEditing?: boolean;
}

export const AddSetModal: React.FC<AddSetModalProps> = ({
  visible,
  onClose,
  onSave,
  ibadahType,
  initialValue,
  timerSeconds,
  isEditing = false,
}) => {
  const [value, setValue] = useState('');
  const [binaryValue, setBinaryValue] = useState<boolean | null>(null);

  useEffect(() => {
    if (visible) {
      if (ibadahType?.unit === 'binary') {
        setBinaryValue(initialValue === 1 ? true : null);
        setValue('');
      } else if (initialValue) {
        setValue(initialValue.toString());
        setBinaryValue(null);
      } else if (timerSeconds && ibadahType?.unit === 'minutes') {
        setValue(Math.ceil(timerSeconds / 60).toString());
        setBinaryValue(null);
      } else {
        setValue('');
        setBinaryValue(null);
      }
    }
  }, [visible, initialValue, timerSeconds, ibadahType]);

  const { t, tUnit } = useTranslation();

  if (!ibadahType) return null;

  const isBinary = ibadahType.unit === 'binary';

  const handleSave = () => {
    if (isBinary) {
      if (binaryValue === true) {
        onSave(1, undefined, timerSeconds);
        onClose();
      }
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    onSave(numValue, undefined, timerSeconds);
    onClose();
  };

  const presetValues = getPresetValues(ibadahType.unit);

  if (isBinary) {
    const handleYes = () => {
      onSave(1, undefined, timerSeconds);
      onClose();
    };

    return (
      <Modal
        visible={visible}
        onClose={onClose}
        title={t('addSetModal.logTitle', { name: ibadahType.name })}
        position="bottom"
      >
        <View style={styles.content}>
          <Text style={styles.binaryQuestion}>{t('addSetModal.didYouFast')}</Text>
          <View style={styles.binaryOptions}>
            <TouchableOpacity
              style={styles.binaryButton}
              onPress={handleYes}
            >
              <Feather
                name="check-circle"
                size={40}
                color={Colors.semantic.success}
              />
              <Text style={[styles.binaryButtonText, styles.binaryButtonTextActive]}>
                {t('common.yes')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.binaryButton}
              onPress={onClose}
            >
              <Feather
                name="x-circle"
                size={40}
                color={Colors.semantic.error}
              />
              <Text style={[styles.binaryButtonText, styles.binaryButtonTextInactive]}>
                {t('common.no')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEditing ? t('addSetModal.editTitle') : t('addSetModal.logTitle', { name: ibadahType.name })}
      position="bottom"
    >
      <View style={styles.content}>
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => {
                const current = parseFloat(value) || 0;
                if (current > 1) setValue((current - 1).toString());
              }}
            >
              <Feather name="minus" size={24} color={Colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.valueContainer}>
              <NumberInput
                value={value}
                onChangeText={setValue}
                style={styles.valueInput}
                placeholder="0"
                min={0}
              />
              <Text style={styles.unitLabel}>{tUnit(ibadahType.unit, 2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => {
                const current = parseFloat(value) || 0;
                setValue((current + 1).toString());
              }}
            >
              <Feather name="plus" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.presets}>
          {presetValues.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                value === preset.toString() && styles.presetButtonActive,
              ]}
              onPress={() => setValue(preset.toString())}
            >
              <Text
                style={[styles.presetText, value === preset.toString() && styles.presetTextActive]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {timerSeconds && timerSeconds > 0 && (
          <View style={styles.timerInfo}>
            <Feather name="clock" size={16} color={Colors.text.muted} />
            <Text style={styles.timerText}>
              {t('addSetModal.timer', {
                minutes: Math.floor(timerSeconds / 60),
                seconds: timerSeconds % 60,
              })}
            </Text>
          </View>
        )}

        <Button
          title={isEditing ? t('addSetModal.updateSet') : t('addSetModal.logSet')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSave}
          disabled={!value || parseFloat(value) <= 0}
        />
      </View>
    </Modal>
  );
};

const getPresetValues = (unit: string): number[] => {
  switch (unit) {
    case 'pages':
      return [1, 2, 3, 5, 10, 20];
    case 'minutes':
      return [5, 10, 15, 20, 30, 60];
    case 'count':
      return [33, 34, 99, 100, 200, 500];
    case 'currency':
      return [5, 10, 20, 50, 100, 500];
    case 'ayat':
      return [10, 50, 100, 200, 500, 1000];
    case 'binary':
      return [];
    default:
      return [1, 5, 10, 20, 50, 100];
  }
};

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  inputSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  adjustButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  valueInput: {
    fontSize: Typography.fontSize.displayLarge,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  unitLabel: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  presetButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.elevated,
    minWidth: 56,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: Colors.accent.primary,
  },
  presetText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  presetTextActive: {
    color: Colors.text.primary,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.md,
  },
  timerText: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
  },
  binaryQuestion: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  binaryOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  binaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.elevated,
    minWidth: 100,
    gap: Spacing.sm,
  },
  binaryButtonActive: {
    backgroundColor: `${Colors.semantic.success}20`,
    borderWidth: 2,
    borderColor: Colors.semantic.success,
  },
  binaryButtonInactive: {
    backgroundColor: `${Colors.semantic.error}20`,
    borderWidth: 2,
    borderColor: Colors.semantic.error,
  },
  binaryButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  binaryButtonTextActive: {
    color: Colors.semantic.success,
  },
  binaryButtonTextInactive: {
    color: Colors.semantic.error,
  },
});

export default AddSetModal;
