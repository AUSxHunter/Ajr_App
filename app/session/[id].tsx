import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, EmptyState, ConfirmModal } from '../../components/ui';
import { AddSetModal } from '../../components/session';
import { useSessionStore } from '../../store/sessionStore';
import { useIbadahStore } from '../../store/ibadahStore';
import { SessionSet, IbadahType } from '../../types';
import { UNIT_LABELS } from '../../constants/defaults';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedSet, setSelectedSet] = useState<SessionSet | null>(null);
  const [selectedIbadah, setSelectedIbadah] = useState<IbadahType | null>(null);

  const sessions = useSessionStore((state) => state.sessions);
  const sessionSetsAll = useSessionStore((state) => state.sessionSets);
  const updateSet = useSessionStore((state) => state.updateSet);
  const deleteSet = useSessionStore((state) => state.deleteSet);
  const ibadahTypes = useIbadahStore((state) => state.ibadahTypes);

  const session = useMemo(() => sessions.find((s) => s.id === id), [sessions, id]);
  const sets = useMemo(
    () =>
      session
        ? sessionSetsAll
            .filter((s) => s.sessionId === session.id)
            .sort((a, b) => a.setOrder - b.setOrder)
        : [],
    [sessionSetsAll, session]
  );
  const getIbadahTypeById = (typeId: string) => ibadahTypes.find((t) => t.id === typeId);

  const handleEditSet = (set: SessionSet) => {
    const ibadahType = getIbadahTypeById(set.ibadahTypeId);
    if (ibadahType) {
      setSelectedSet(set);
      setSelectedIbadah(ibadahType);
      setEditModalVisible(true);
    }
  };

  const handleSaveSet = (value: number, notes?: string, durationSeconds?: number) => {
    if (selectedSet) {
      updateSet(selectedSet.id, { value, notes, durationSeconds });
    }
  };

  const handleDeletePress = (set: SessionSet) => {
    setSelectedSet(set);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSet) {
      deleteSet(selectedSet.id);
      setDeleteModalVisible(false);
      setSelectedSet(null);
    }
  };

  const formattedDate = session ? format(parseISO(session.sessionDate), 'EEEE, MMMM d, yyyy') : '';

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle"
          title="Session Not Found"
          description="This session could not be found."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <Text style={styles.dateLabel}>Session Date</Text>
          <Text style={styles.dateValue}>{formattedDate}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{session.totalVolume}</Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{sets.length}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Sets</Text>
        {sets.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No sets logged for this session</Text>
          </Card>
        ) : (
          <View style={styles.setsList}>
            {sets.map((set, index) => {
              const ibadahType = getIbadahTypeById(set.ibadahTypeId);
              const unitLabel = ibadahType ? UNIT_LABELS[ibadahType.unit] : null;
              const displayValue =
                ibadahType?.unit === 'currency'
                  ? `$${set.value.toFixed(2)}`
                  : `${set.value} ${unitLabel ? (set.value === 1 ? unitLabel.singular : unitLabel.plural) : ''}`;

              return (
                <Card key={set.id} style={styles.setCard}>
                  <View style={styles.setHeaderRow}>
                    <View style={styles.setHeader}>
                      <View
                        style={[
                          styles.setIndicator,
                          { backgroundColor: ibadahType?.color || Colors.accent.primary },
                        ]}
                      />
                      <Text style={styles.setNumber}>Set {index + 1}</Text>
                    </View>
                    <View style={styles.setActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditSet(set)}
                      >
                        <Feather name="edit-2" size={16} color={Colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeletePress(set)}
                      >
                        <Feather name="trash-2" size={16} color={Colors.semantic.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.ibadahName}>{ibadahType?.name || 'Unknown'}</Text>
                  <Text style={styles.setValue}>{displayValue}</Text>
                  {set.notes && <Text style={styles.setNotes}>{set.notes}</Text>}
                </Card>
              );
            })}
          </View>
        )}

        {session.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Card>
              <Text style={styles.notesText}>{session.notes}</Text>
            </Card>
          </>
        )}
      </ScrollView>

      <AddSetModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSet(null);
          setSelectedIbadah(null);
        }}
        onSave={handleSaveSet}
        ibadahType={selectedIbadah}
        initialValue={selectedSet?.value}
        isEditing={true}
      />

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Set"
        message="Are you sure you want to delete this set? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedSet(null);
        }}
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
    gap: Spacing.lg,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  dateLabel: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
  },
  dateValue: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.h1,
    fontWeight: '700',
    color: Colors.accent.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.secondary,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  setsList: {
    gap: Spacing.sm,
  },
  setCard: {
    gap: Spacing.xs,
  },
  setHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  setIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  setNumber: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  ibadahName: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  setValue: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.accent.primary,
  },
  setNotes: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  notesText: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.5,
  },
});
