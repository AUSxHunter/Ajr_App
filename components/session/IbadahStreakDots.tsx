import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { subDays, format } from 'date-fns';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';

interface IbadahStreakDotsProps {
  ibadahTypeId: string;
  color: string;
}

type DayStatus = 'completed' | 'today' | 'missed';

interface DayInfo {
  date: Date;
  label: string;
  status: DayStatus;
  isToday: boolean;
}

export const IbadahStreakDots: React.FC<IbadahStreakDotsProps> = ({ ibadahTypeId, color }) => {
  const sessions = useSessionStore((state) => state.sessions);
  const sessionSets = useSessionStore((state) => state.sessionSets);

  const days = useMemo<DayInfo[]>(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isToday = dateStr === todayStr;

      const session = sessions.find((s) => s.sessionDate === dateStr);
      const hasLog = session
        ? sessionSets.some(
            (ss) => ss.sessionId === session.id && ss.ibadahTypeId === ibadahTypeId
          )
        : false;

      let status: DayStatus;
      if (hasLog) {
        status = 'completed';
      } else if (isToday) {
        status = 'today';
      } else {
        status = 'missed';
      }

      return {
        date,
        label: format(date, 'EEEEE'),
        status,
        isToday,
      };
    });
  }, [sessions, sessionSets, ibadahTypeId]);

  return (
    <View style={styles.container}>
      {days.map((day, index) => (
        <View key={index} style={styles.dayItem}>
          <Text style={styles.dayLabel}>{day.label}</Text>
          {day.status === 'completed' ? (
            <View style={[styles.dotFull, { backgroundColor: color }]} />
          ) : day.status === 'today' ? (
            <View style={[styles.dotOutline, { borderColor: color }]} />
          ) : (
            <View style={styles.dotSlot}>
              <View style={styles.dotMissed} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: 2,
  },
  dayItem: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.muted,
  },
  dotFull: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dotOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  dotSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotMissed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.muted,
  },
});

export default IbadahStreakDots;
