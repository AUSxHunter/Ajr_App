import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  sessionsMap: Map<string, boolean>;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onDateSelect,
  sessionsMap,
}) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasSession = sessionsMap.get(dateStr);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dayContainer, isSelected && styles.dayContainerSelected]}
              onPress={() => onDateSelect(day)}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                {format(day, 'EEE')}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isCurrentDay && !isSelected && styles.dayNumberToday,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {hasSession && (
                <View style={[styles.indicator, isSelected && styles.indicatorSelected]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  dayContainer: {
    width: 48,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  dayContainerSelected: {
    backgroundColor: Colors.accent.primary,
  },
  dayName: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  dayNameSelected: {
    color: Colors.text.primary,
  },
  dayNumber: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  dayNumberSelected: {
    color: Colors.text.primary,
  },
  dayNumberToday: {
    color: Colors.accent.primary,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.semantic.success,
  },
  indicatorSelected: {
    backgroundColor: Colors.text.primary,
  },
});

export default CalendarStrip;
