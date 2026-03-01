import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { subDays, format } from 'date-fns';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';

interface IbadahStreakDotsProps {
  ibadahTypeId: string;
  color: string;
}

type DayStatus = 'completed' | 'today' | 'missed';

export const IbadahStreakDots: React.FC<IbadahStreakDotsProps> = ({ ibadahTypeId, color }) => {
  const sessions = useSessionStore((state) => state.sessions);
  const sessionSets = useSessionStore((state) => state.sessionSets);

  const { days, streak } = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const hasLogOnDate = (dateStr: string) => {
      const session = sessions.find((s) => s.sessionDate === dateStr);
      return session
        ? sessionSets.some((ss) => ss.sessionId === session.id && ss.ibadahTypeId === ibadahTypeId)
        : false;
    };

    // Rolling 7-day window
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isToday = dateStr === todayStr;
      const hasLog = hasLogOnDate(dateStr);

      let status: DayStatus;
      if (hasLog) {
        status = 'completed';
      } else if (isToday) {
        status = 'today';
      } else {
        status = 'missed';
      }

      return { label: format(date, 'EEEEE'), status };
    });

    // Continuous streak: count consecutive days going back from today
    let streak = 0;
    let checkDay = today;
    while (true) {
      const dateStr = format(checkDay, 'yyyy-MM-dd');
      if (hasLogOnDate(dateStr)) {
        streak++;
        checkDay = subDays(checkDay, 1);
      } else {
        // Allow today to not break the streak yet
        if (dateStr === todayStr) {
          checkDay = subDays(checkDay, 1);
          continue;
        }
        break;
      }
    }

    return { days, streak };
  }, [sessions, sessionSets, ibadahTypeId]);

  return (
    <View style={styles.container}>
      {/* Streak counter */}
      <View style={styles.streakBadge}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>day{streak !== 1 ? 's' : ''}</Text>
      </View>

      {/* 7-day dots */}
      <View style={styles.dotsRow}>
        {days.map((day, index) => (
          <View key={index} style={styles.dayItem}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            {day.status === 'completed' ? (
              <View style={[styles.dotFull, { backgroundColor: color }]}>
                <Feather name="check" size={11} color="#fff" />
              </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: 2,
    gap: Spacing.md,
  },
  streakBadge: {
    alignItems: 'center',
    minWidth: 28,
  },
  streakNumber: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 16,
  },
  streakLabel: {
    fontSize: 9,
    color: Colors.text.muted,
    lineHeight: 11,
  },
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
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
