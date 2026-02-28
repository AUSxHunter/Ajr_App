import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';
import { WeeklyChart, PRCard, IbadahBreakdown } from '../../components/analytics';
import { SuggestionCard, BurnoutWarningCard } from '../../components/insights';
import { useSessionStore } from '../../store/sessionStore';
import { useIbadahStore } from '../../store/ibadahStore';
import { calculateStreak, findPersonalRecords } from '../../utils/calculations';
import { generateOverloadSuggestions } from '../../utils/suggestions';
import { detectBurnout } from '../../utils/burnout';
import { DailyStats } from '../../types';

export default function AnalyticsScreen() {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [dismissedBurnout, setDismissedBurnout] = useState(false);

  const sessions = useSessionStore((state) => state.sessions);
  const sessionSets = useSessionStore((state) => state.sessionSets);
  const ibadahTypes = useIbadahStore((state) => state.ibadahTypes);

  const streak = calculateStreak(sessions);
  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);
  const totalSets = sessionSets.length;

  const suggestions = useMemo(() => {
    return generateOverloadSuggestions({
      sessions,
      sessionSets,
      ibadahTypes,
    }).filter((s) => !dismissedSuggestions.includes(s.ibadahTypeId));
  }, [sessions, sessionSets, ibadahTypes, dismissedSuggestions]);

  const burnoutWarning = useMemo(() => {
    return detectBurnout({ sessions, sessionSets });
  }, [sessions, sessionSets]);

  const weeklyStats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day): DailyStats => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const session = sessions.find((s) => s.sessionDate === dateStr);

      if (!session) {
        return {
          date: dateStr,
          totalVolume: 0,
          setCount: 0,
          ibadahBreakdown: [],
        };
      }

      const sets = sessionSets.filter((s) => s.sessionId === session.id);

      const ibadahBreakdown = ibadahTypes
        .map((type) => {
          const typeSets = sets.filter((s) => s.ibadahTypeId === type.id);
          const rawValue = typeSets.reduce((sum, s) => sum + s.value, 0);
          return {
            ibadahTypeId: type.id,
            ibadahName: type.name,
            totalValue: rawValue,
            setCount: typeSets.length,
          };
        })
        .filter((breakdown) => breakdown.setCount > 0);

      const weightedVolume = sets.reduce((sum, s) => {
        const ibadahType = ibadahTypes.find((t) => t.id === s.ibadahTypeId);
        const weight = ibadahType?.weight ?? 1;
        return sum + s.value * weight;
      }, 0);

      return {
        date: dateStr,
        totalVolume: weightedVolume,
        setCount: sets.length,
        ibadahBreakdown,
      };
    });
  }, [sessions, sessionSets, ibadahTypes]);

  const personalRecords = useMemo(() => {
    return findPersonalRecords(sessions, sessionSets);
  }, [sessions, sessionSets]);

  const dailyVolumeRecords = personalRecords.filter((pr) => pr.recordType === 'daily_volume');

  const averageDailyVolume = totalSessions > 0 ? (totalVolume / totalSessions).toFixed(1) : '0';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {burnoutWarning.detected && !dismissedBurnout && (
          <BurnoutWarningCard
            warning={burnoutWarning}
            onDismiss={() => setDismissedBurnout(true)}
          />
        )}

        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            {suggestions.slice(0, 2).map((suggestion) => (
              <SuggestionCard
                key={suggestion.ibadahTypeId}
                suggestion={suggestion}
                onDismiss={() =>
                  setDismissedSuggestions((prev) => [...prev, suggestion.ibadahTypeId])
                }
              />
            ))}
          </View>
        )}

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Feather name="zap" size={24} color={Colors.semantic.warning} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <Feather name="calendar" size={24} color={Colors.accent.primary} />
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Card>

          <Card style={styles.statCard}>
            <Feather name="activity" size={24} color={Colors.semantic.success} />
            <Text style={styles.statValue}>{totalVolume}</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </Card>

          <Card style={styles.statCard}>
            <Feather name="target" size={24} color={Colors.ibadah.qiyam} />
            <Text style={styles.statValue}>{averageDailyVolume}</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </Card>
        </View>

        <WeeklyChart dailyStats={weeklyStats} title="This Week" />

        <IbadahBreakdown ibadahTypes={ibadahTypes} sessionSets={sessionSets} />

        {dailyVolumeRecords.length > 0 && (
          <View style={styles.prSection}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <View style={styles.prList}>
              {dailyVolumeRecords.slice(0, 5).map((record) => {
                const ibadahType = ibadahTypes.find((t) => t.id === record.ibadahTypeId);
                if (!ibadahType) return null;
                return <PRCard key={record.id} record={record} ibadahType={ibadahType} />;
              })}
            </View>
          </View>
        )}

        <Card style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Feather name="info" size={20} color={Colors.accent.primary} />
            <Text style={styles.insightTitle}>Insight</Text>
          </View>
          <Text style={styles.insightText}>
            {streak >= 7
              ? `Amazing! You've maintained a ${streak}-day streak. Keep up the excellent consistency.`
              : streak >= 3
                ? `Good progress! ${7 - streak} more days to reach a week-long streak.`
                : totalSessions > 0
                  ? 'Start building your streak by logging ibadah consistently.'
                  : 'Begin your journey by starting your first session today.'}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  suggestionsSection: {
    gap: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.display,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.secondary,
  },
  prSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  prList: {
    gap: Spacing.md,
  },
  insightCard: {
    gap: Spacing.sm,
    backgroundColor: `${Colors.accent.primary}10`,
    borderColor: Colors.accent.muted,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  insightTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
  insightText: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.5,
  },
});
