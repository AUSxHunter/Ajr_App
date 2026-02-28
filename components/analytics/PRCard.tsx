import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Card } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PersonalRecord, IbadahType } from '../../types';
import { UNIT_LABELS } from '../../constants/defaults';

interface PRCardProps {
  record: PersonalRecord;
  ibadahType: IbadahType;
}

export const PRCard: React.FC<PRCardProps> = ({ record, ibadahType }) => {
  const unitLabel = UNIT_LABELS[ibadahType.unit];
  const formattedValue =
    ibadahType.unit === 'currency'
      ? `$${record.value.toFixed(2)}`
      : `${record.value} ${record.value === 1 ? unitLabel.singular : unitLabel.plural}`;

  const recordTypeLabel = record.recordType === 'daily_volume' ? 'Best Day' : 'Best Set';

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${ibadahType.color}20` }]}>
          <Feather
            name={ibadahType.icon as keyof typeof Feather.glyphMap}
            size={18}
            color={ibadahType.color}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.ibadahName}>{ibadahType.name}</Text>
          <Text style={styles.recordType}>{recordTypeLabel}</Text>
        </View>
        <Feather name="award" size={20} color={Colors.semantic.warning} />
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{formattedValue}</Text>
        <Text style={styles.date}>{format(parseISO(record.achievedDate), 'MMM d, yyyy')}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  ibadahName: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  recordType: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  value: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.accent.primary,
  },
  date: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
});

export default PRCard;
