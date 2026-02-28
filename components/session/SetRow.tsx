import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { SessionSet, IbadahType } from '../../types';
import { formatDuration } from '../../utils/calculations';
import { UNIT_LABELS } from '../../constants/defaults';

interface SetRowProps {
  set: SessionSet;
  ibadahType: IbadahType;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({ set, ibadahType, index, onEdit, onDelete }) => {
  const unitLabel = UNIT_LABELS[ibadahType.unit];
  
  let displayValue: string;
  if (ibadahType.unit === 'currency') {
    displayValue = `${set.value.toFixed(0)} AED`;
  } else if (ibadahType.unit === 'binary') {
    displayValue = set.value >= 1 ? 'Fasted' : 'Not fasted';
  } else {
    displayValue = `${set.value} ${set.value === 1 ? unitLabel.singular : unitLabel.plural}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.setNumber, { backgroundColor: `${ibadahType.color}20` }]}>
          <Text style={[styles.setNumberText, { color: ibadahType.color }]}>{index + 1}</Text>
        </View>
        <View style={styles.setInfo}>
          <Text style={styles.value}>{displayValue}</Text>
          {set.durationSeconds && set.durationSeconds > 0 && (
            <Text style={styles.duration}>{formatDuration(set.durationSeconds)}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Feather name="edit-2" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Feather name="trash-2" size={16} color={Colors.semantic.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
  },
  setInfo: {
    gap: 2,
  },
  value: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  duration: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
});

export default SetRow;
