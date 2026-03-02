import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, EmptyState } from '../../components/ui';
import { SessionCard, AddSetModal, ManageIbadahModal, AdhkarSessionCard } from '../../components/session';
import { useSessionStore } from '../../store/sessionStore';
import { useIbadahStore } from '../../store/ibadahStore';
import { IbadahType, SessionSet } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

export default function TodayScreen() {
  const { t } = useTranslation();
  const [addSetModalVisible, setAddSetModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [selectedIbadah, setSelectedIbadah] = useState<IbadahType | null>(null);
  const [editingSet, setEditingSet] = useState<SessionSet | null>(null);
  const hasCheckedExpiry = useRef(false);

  const sessions = useSessionStore((state) => state.sessions);
  const sessionSetsAll = useSessionStore((state) => state.sessionSets);
  const addSet = useSessionStore((state) => state.addSet);
  const updateSet = useSessionStore((state) => state.updateSet);
  const deleteSet = useSessionStore((state) => state.deleteSet);
  const startSession = useSessionStore((state) => state.startSession);
  const continueSession = useSessionStore((state) => state.continueSession);
  const endSession = useSessionStore((state) => state.endSession);
  const hiddenIbadahTypeIds = useSessionStore((state) => state.hiddenIbadahTypeIds);

  const ibadahTypesRaw = useIbadahStore((state) => state.ibadahTypes);
  const allActiveIbadahTypes = useMemo(
    () =>
      ibadahTypesRaw.filter((type) => !type.isArchived).sort((a, b) => a.sortOrder - b.sortOrder),
    [ibadahTypesRaw]
  );
  const ibadahTypes = useMemo(
    () => allActiveIbadahTypes.filter((type) => !hiddenIbadahTypeIds.includes(type.id)),
    [allActiveIbadahTypes, hiddenIbadahTypeIds]
  );

  useEffect(() => {
    if (hasCheckedExpiry.current) return;
    hasCheckedExpiry.current = true;
    useSessionStore.getState().checkAndExpireSession();
  }, []);

  const todayDateString = format(new Date(), 'yyyy-MM-dd');
  const yesterdayDateString = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  
  const activeSession = useMemo(
    () => sessions.find((s) => s.sessionDate === todayDateString && !s.completedAt),
    [sessions, todayDateString]
  );
  
  const completedTodaySession = useMemo(
    () => sessions.find((s) => s.sessionDate === todayDateString && s.completedAt),
    [sessions, todayDateString]
  );
  
  const yesterdaySession = useMemo(
    () => sessions.find((s) => s.sessionDate === yesterdayDateString),
    [sessions, yesterdayDateString]
  );

  const todaySession = activeSession;
  const hasActiveSession = !!activeSession;
  const canContinueSession = !hasActiveSession && !!completedTodaySession;
  
  const sessionSets = useMemo(
    () =>
      todaySession
        ? sessionSetsAll
            .filter((s) => s.sessionId === todaySession.id)
            .sort((a, b) => a.setOrder - b.setOrder)
        : [],
    [sessionSetsAll, todaySession]
  );

  const ibadahSetsMap = useMemo(() => {
    const map = new Map<string, SessionSet[]>();
    sessionSets.forEach((set) => {
      const existing = map.get(set.ibadahTypeId) || [];
      map.set(set.ibadahTypeId, [...existing, set]);
    });
    return map;
  }, [sessionSets]);

  const todayDate = format(new Date(), 'EEEE, MMMM d');
  const totalVolume = todaySession?.totalVolume || 0;
  const totalSets = sessionSets.length;
  const yesterdayVolume = yesterdaySession?.totalVolume || 0;
  const volumeDiff = yesterdayVolume > 0 ? ((totalVolume - yesterdayVolume) / yesterdayVolume) * 100 : 0;

  const handleStartSession = () => {
    startSession();
  };

  const handleContinueSession = () => {
    if (completedTodaySession) {
      continueSession(completedTodaySession.id);
    }
  };

  const handleEndSession = () => {
    if (!todaySession) return;

    Alert.alert(
      t('today.endSessionTitle'),
      t('today.endSessionMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('today.endSession'),
          style: 'destructive',
          onPress: () => {
            endSession(todaySession.id);
          },
        },
      ]
    );
  };

  const getOrCreateTodaySession = () => {
    if (todaySession) return todaySession;
    return startSession();
  };

  const handleAddSet = (ibadahType: IbadahType) => {
    setSelectedIbadah(ibadahType);
    setEditingSet(null);
    setAddSetModalVisible(true);
  };

  const handleEditSet = (set: SessionSet) => {
    const ibadahType = ibadahTypes.find((t) => t.id === set.ibadahTypeId);
    if (ibadahType) {
      setSelectedIbadah(ibadahType);
      setEditingSet(set);
      setAddSetModalVisible(true);
    }
  };

  const handleSaveSet = (value: number, notes?: string, durationSeconds?: number) => {
    if (!selectedIbadah) return;

    if (editingSet) {
      updateSet(editingSet.id, { value, notes, durationSeconds });
    } else {
      const session = getOrCreateTodaySession();
      addSet({
        sessionId: session.id,
        ibadahTypeId: selectedIbadah.id,
        value,
        notes,
        durationSeconds,
      });
    }
  };

  const handleDeleteSet = (setId: string) => {
    deleteSet(setId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('today.greeting')}</Text>
            <Text style={styles.date}>{todayDate}</Text>
          </View>
          <View style={styles.headerButtons}>
            {hasActiveSession && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => setManageModalVisible(true)}
              >
                <Feather name="sliders" size={16} color={Colors.accent.primary} />
              </TouchableOpacity>
            )}
            {hasActiveSession && (
              <TouchableOpacity style={styles.endSessionButton} onPress={handleEndSession}>
                <Feather name="check-circle" size={16} color={Colors.semantic.error} />
                <Text style={styles.endSessionText}>{t('today.end')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {hasActiveSession && (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryStat}>
                <Feather name="activity" size={20} color={Colors.accent.primary} />
                <View>
                  <Text style={styles.summaryValue}>{Math.round(totalVolume)}</Text>
                  <Text style={styles.summaryLabel}>{t('today.volume')}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryStat}>
                <Feather name="layers" size={20} color={Colors.semantic.success} />
                <View>
                  <Text style={styles.summaryValue}>{totalSets}</Text>
                  <Text style={styles.summaryLabel}>{t('today.sets')}</Text>
                </View>
              </View>
            </View>
            {yesterdayVolume > 0 && (
              <View style={styles.comparisonRow}>
                <Feather
                  name={volumeDiff >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={volumeDiff >= 0 ? Colors.semantic.success : Colors.semantic.warning}
                />
                <Text
                  style={[
                    styles.comparisonText,
                    { color: volumeDiff >= 0 ? Colors.semantic.success : Colors.semantic.warning },
                  ]}
                >
                  {volumeDiff >= 0 ? '+' : ''}
                  {t('today.vsYesterday', {
                    diff: volumeDiff.toFixed(0),
                    volume: Math.round(yesterdayVolume),
                  })}
                </Text>
              </View>
            )}
          </Card>
        )}

        {!hasActiveSession ? (
          <View style={styles.emptyContainer}>
            {canContinueSession ? (
              <EmptyState
                icon="play"
                title={t('today.continueSessionTitle')}
                description={t('today.continueSessionDesc', {
                  volume: Math.round(completedTodaySession?.totalVolume || 0),
                })}
                actionLabel={t('today.continueSession')}
                onAction={handleContinueSession}
              />
            ) : (
              <EmptyState
                icon="sun"
                title={t('today.readyToBegin')}
                description={t('today.readyToBeginDesc')}
                actionLabel={t('today.beginSession')}
                onAction={handleStartSession}
              />
            )}
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {ibadahTypes.map((ibadahType) => {
              if (ibadahType.unit === 'adhkar') {
                return (
                  <AdhkarSessionCard
                    key={ibadahType.id}
                    ibadahType={ibadahType}
                  />
                );
              }
              
              const sets = ibadahSetsMap.get(ibadahType.id) || [];
              return (
                <SessionCard
                  key={ibadahType.id}
                  ibadahType={ibadahType}
                  sets={sets}
                  onAddSet={() => handleAddSet(ibadahType)}
                  onEditSet={handleEditSet}
                  onDeleteSet={handleDeleteSet}
                />
              );
            })}
          </View>
        )}

        {hasActiveSession && (
          <View style={styles.quickAddSection}>
            <Text style={styles.quickAddTitle}>{t('today.quickAdd')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickAddButtons}
            >
              {ibadahTypes
                .filter((type) => type.unit !== 'adhkar')
                .map((ibadahType) => (
                  <TouchableOpacity
                    key={ibadahType.id}
                    style={[styles.quickAddButton, { backgroundColor: `${ibadahType.color}20` }]}
                    onPress={() => handleAddSet(ibadahType)}
                  >
                    <Feather
                      name={ibadahType.icon as keyof typeof Feather.glyphMap}
                      size={18}
                      color={ibadahType.color}
                    />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        {hasActiveSession && (
          <TouchableOpacity style={styles.finishSessionButton} onPress={handleEndSession}>
            <Feather name="check-circle" size={20} color={Colors.text.primary} />
            <Text style={styles.finishSessionText}>{t('today.finishSession')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <AddSetModal
        visible={addSetModalVisible}
        onClose={() => {
          setAddSetModalVisible(false);
          setSelectedIbadah(null);
          setEditingSet(null);
        }}
        onSave={handleSaveSet}
        ibadahType={selectedIbadah}
        initialValue={editingSet?.value}
        isEditing={!!editingSet}
      />

      <ManageIbadahModal
        visible={manageModalVisible}
        onClose={() => setManageModalVisible(false)}
        ibadahTypes={allActiveIbadahTypes}
      />
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
    paddingBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.fontSize.h1,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  date: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  manageButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.accent.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.semantic.error}15`,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.semantic.error}30`,
  },
  endSessionText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.semantic.error,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.default,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
  },
  cardsContainer: {
    gap: Spacing.md,
  },
  quickAddSection: {
    marginTop: Spacing.xl,
  },
  quickAddTitle: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.text.muted,
    marginBottom: Spacing.sm,
  },
  quickAddButtons: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  quickAddButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  comparisonText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '500',
  },
  finishSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.lg,
  },
  finishSessionText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
