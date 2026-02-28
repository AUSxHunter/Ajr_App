import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { IbadahType, SessionSet } from '../../types';
import { UNIT_LABELS } from '../../constants/defaults';

interface IbadahBreakdownProps {
  ibadahTypes: IbadahType[];
  sessionSets: SessionSet[];
}

interface BreakdownItem {
  ibadahType: IbadahType;
  totalValue: number;
  weightedValue: number;
  setCount: number;
  percentage: number;
}

export const IbadahBreakdown: React.FC<IbadahBreakdownProps> = ({ ibadahTypes, sessionSets }) => {
  const breakdown: BreakdownItem[] = ibadahTypes
    .map((type) => {
      const sets = sessionSets.filter((s) => s.ibadahTypeId === type.id);
      const totalValue = sets.reduce((sum, s) => sum + s.value, 0);
      const weight = type.weight ?? 1;
      const weightedValue = totalValue * weight;
      return {
        ibadahType: type,
        totalValue,
        weightedValue,
        setCount: sets.length,
        percentage: 0,
      };
    })
    .filter((item) => item.setCount > 0)
    .sort((a, b) => b.weightedValue - a.weightedValue);

  const totalWeightedVolume = breakdown.reduce((sum, item) => sum + item.weightedValue, 0);
  breakdown.forEach((item) => {
    item.percentage = totalWeightedVolume > 0 ? (item.weightedValue / totalWeightedVolume) * 100 : 0;
  });

  if (breakdown.length === 0) {
    return (
      <Card style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Log some ibadah to see your breakdown</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>By Ibadah Type</Text>
      <View style={styles.list}>
        {breakdown.map((item) => {
          const unitLabel = UNIT_LABELS[item.ibadahType.unit];
          let displayValue: string;
          if (item.ibadahType.unit === 'currency') {
            displayValue = `${item.totalValue.toFixed(0)} AED`;
          } else if (item.ibadahType.unit === 'binary') {
            displayValue = `${item.totalValue} ${item.totalValue === 1 ? 'day' : 'days'}`;
          } else {
            displayValue = `${item.totalValue} ${unitLabel.abbreviation}`;
          }

          return (
            <View key={item.ibadahType.id} style={styles.item}>
              <View style={styles.itemLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: `${item.ibadahType.color}20` }]}
                >
                  <Feather
                    name={item.ibadahType.icon as keyof typeof Feather.glyphMap}
                    size={16}
                    color={item.ibadahType.color}
                  />
                </View>
                <View>
                  <Text style={styles.ibadahName}>{item.ibadahType.name}</Text>
                  <Text style={styles.setCount}>
                    {item.setCount} {item.setCount === 1 ? 'set' : 'sets'}
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.value}>{displayValue}</Text>
                <Text style={styles.percentage}>{item.percentage.toFixed(0)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.progressBarContainer}>
        {breakdown.map((item) => (
          <View
            key={item.ibadahType.id}
            style={[
              styles.progressSegment,
              {
                flex: item.percentage,
                backgroundColor: item.ibadahType.color,
              },
            ]}
          />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.muted,
  },
  title: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  list: {
    gap: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ibadahName: {
    fontSize: Typography.fontSize.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  setCount: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  percentage: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  progressSegment: {
    minWidth: 4,
    borderRadius: 4,
  },
});

export default IbadahBreakdown;
