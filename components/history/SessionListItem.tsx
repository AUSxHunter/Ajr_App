import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Card } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Session, SessionSet, IbadahType } from '../../types';

interface SessionListItemProps {
  session: Session;
  sets: SessionSet[];
  ibadahTypes: IbadahType[];
  onPress: () => void;
  onDelete?: () => void;
}

export const SessionListItem: React.FC<SessionListItemProps> = ({
  session,
  sets,
  ibadahTypes,
  onPress,
  onDelete,
}) => {
  const sessionDate = parseISO(session.sessionDate);
  const dateLabel = format(sessionDate, 'EEEE, MMMM d');

  const uniqueIbadahIds = [...new Set(sets.map((s) => s.ibadahTypeId))];
  const displayedIbadah = uniqueIbadahIds.slice(0, 4);
  const extraCount = uniqueIbadahIds.length - 4;

  return (
    <Card pressable onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.setCount}>
            {sets.length} {sets.length === 1 ? 'set' : 'sets'} logged
          </Text>
        </View>
        <View style={styles.volumeContainer}>
          <Text style={styles.volume}>{session.totalVolume}</Text>
          <Text style={styles.volumeLabel}>volume</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.ibadahIcons}>
          {displayedIbadah.map((ibadahId) => {
            const type = ibadahTypes.find((t) => t.id === ibadahId);
            if (!type) return null;
            return (
              <View
                key={ibadahId}
                style={[styles.ibadahIcon, { backgroundColor: `${type.color}20` }]}
              >
                <Feather
                  name={type.icon as keyof typeof Feather.glyphMap}
                  size={14}
                  color={type.color}
                />
              </View>
            );
          })}
          {extraCount > 0 && (
            <View style={styles.extraCount}>
              <Text style={styles.extraCountText}>+{extraCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {onDelete && (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }} 
              style={styles.deleteButton}
            >
              <Feather name="trash-2" size={18} color={Colors.semantic.danger} />
            </TouchableOpacity>
          )}
          <Feather name="chevron-right" size={20} color={Colors.text.muted} />
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  setCount: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
    marginTop: 2,
  },
  volumeContainer: {
    alignItems: 'flex-end',
  },
  volume: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.accent.primary,
  },
  volumeLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ibadahIcons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  ibadahIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraCount: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraCountText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
});

export default SessionListItem;
