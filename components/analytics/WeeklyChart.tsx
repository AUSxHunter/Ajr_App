import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Card } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { DailyStats } from '../../types';

interface WeeklyChartProps {
  dailyStats: DailyStats[];
  title?: string;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ dailyStats, title = 'This Week' }) => {
  const maxVolume = Math.max(...dailyStats.map((d) => d.totalVolume), 1);

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {dailyStats.map((day) => {
          const height = (day.totalVolume / maxVolume) * 100;
          const dayLabel = format(parseISO(day.date), 'EEE');
          const isToday = format(new Date(), 'yyyy-MM-dd') === day.date;

          return (
            <View key={day.date} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(height, 4)}%`,
                      backgroundColor: isToday ? Colors.accent.primary : Colors.accent.muted,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{dayLabel}</Text>
              <Text style={styles.volumeLabel}>{day.totalVolume > 0 ? day.totalVolume : '-'}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: Spacing.md,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bar: {
    width: '80%',
    borderRadius: BorderRadius.sm,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: Colors.accent.primary,
  },
  volumeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.muted,
  },
});

export default WeeklyChart;
