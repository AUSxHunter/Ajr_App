import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format, subWeeks, addWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { EmptyState } from '../../components/ui';
import { CalendarStrip, SessionListItem } from '../../components/history';
import { useSessionStore } from '../../store/sessionStore';
import { useIbadahStore } from '../../store/ibadahStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function HistoryScreen() {
  const { t, isRTL } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const sessions = useSessionStore((state) => state.sessions);
  const sessionSets = useSessionStore((state) => state.sessionSets);
  const ibadahTypes = useIbadahStore((state) => state.ibadahTypes);

  const sessionsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    sessions.forEach((session) => {
      map.set(session.sessionDate, true);
    });
    return map;
  }, [sessions]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const filteredSessions = useMemo(() => {
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');
    return sessions
      .filter((s) => s.sessionDate >= startStr && s.sessionDate <= endStr)
      .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
  }, [sessions, weekStart, weekEnd]);

  const getSessionSets = (sessionId: string) => {
    return sessionSets.filter((s) => s.sessionId === sessionId);
  };

  const navigatePrevWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const navigateNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const handleSessionPress = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  const handleDeleteSession = (sessionId: string, dateLabel: string) => {
    Alert.alert(
      t('history.deleteSessionTitle'),
      t('history.deleteSessionMessage', { date: dateLabel }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            useSessionStore.getState().deleteSession(sessionId);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={navigatePrevWeek} style={styles.navButton}>
            <Feather name={isRTL ? 'chevron-right' : 'chevron-left'} size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          <TouchableOpacity onPress={navigateNextWeek} style={styles.navButton}>
            <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <CalendarStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          sessionsMap={sessionsMap}
        />

        <View style={styles.sessionSection}>
          <Text style={styles.sectionTitle}>{t('history.sessions')} ({filteredSessions.length})</Text>

          {filteredSessions.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={t('history.noSessionsTitle')}
              description={t('history.noSessionsDesc')}
            />
          ) : (
            <View style={styles.sessionList}>
              {filteredSessions.map((session) => {
                const dateLabel = format(new Date(session.sessionDate), 'MMMM d, yyyy');
                return (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    sets={getSessionSets(session.id)}
                    ibadahTypes={ibadahTypes}
                    onPress={() => handleSessionPress(session.id)}
                    onDelete={() => handleDeleteSession(session.id, dateLabel)}
                  />
                );
              })}
            </View>
          )}
        </View>
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
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.card,
  },
  weekLabel: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sessionSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sessionList: {
    gap: Spacing.md,
  },
});
