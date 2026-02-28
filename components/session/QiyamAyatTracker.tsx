import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface QiyamAyatTrackerProps {
  ayatCount: number;
  onAyatCountChange: (count: number) => void;
}

const MILESTONES = [
  { value: 10, label: '10 Ayat', icon: 'star' as const, color: '#FFB800' },
  { value: 100, label: '100 Ayat', icon: 'award' as const, color: '#FF6B35' },
  { value: 1000, label: '1000 Ayat', icon: 'zap' as const, color: '#8B5CF6' },
];

const QUICK_ADD_VALUES = [10, 20, 50, 100];

export const QiyamAyatTracker: React.FC<QiyamAyatTrackerProps> = ({
  ayatCount,
  onAyatCountChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleQuickAdd = (value: number) => {
    onAyatCountChange(ayatCount + value);
  };

  const handleCustomAdd = () => {
    const value = parseInt(customValue, 10);
    if (!isNaN(value) && value > 0) {
      onAyatCountChange(ayatCount + value);
      setCustomValue('');
    }
  };

  const handleReset = () => {
    onAyatCountChange(0);
  };

  const getNextMilestone = () => {
    for (const milestone of MILESTONES) {
      if (ayatCount < milestone.value) {
        return milestone;
      }
    }
    return null;
  };

  const nextMilestone = getNextMilestone();
  const progressToNext = nextMilestone
    ? (ayatCount / nextMilestone.value) * 100
    : 100;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.ayatIcon}>
            <Feather name="book" size={14} color={Colors.ibadah.quran} />
          </View>
          <Text style={styles.title}>Ayat Recited</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.countText}>{ayatCount}</Text>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.text.muted}
          />
        </View>
      </TouchableOpacity>

      {ayatCount > 0 && (
        <View style={styles.milestonesRow}>
          {MILESTONES.map((milestone) => {
            const achieved = ayatCount >= milestone.value;
            return (
              <View
                key={milestone.value}
                style={[
                  styles.milestoneChip,
                  achieved && { backgroundColor: `${milestone.color}20` },
                ]}
              >
                <Feather
                  name={achieved ? 'check-circle' : milestone.icon}
                  size={12}
                  color={achieved ? milestone.color : Colors.text.muted}
                />
                <Text
                  style={[
                    styles.milestoneText,
                    achieved && { color: milestone.color },
                  ]}
                >
                  {milestone.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {nextMilestone && ayatCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progressToNext, 100)}%`,
                  backgroundColor: nextMilestone.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {nextMilestone.value - ayatCount} more to {nextMilestone.label}
          </Text>
        </View>
      )}

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.quickAddLabel}>Quick Add</Text>
          <View style={styles.quickAddRow}>
            {QUICK_ADD_VALUES.map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.quickAddButton}
                onPress={() => handleQuickAdd(value)}
              >
                <Text style={styles.quickAddButtonText}>+{value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              value={customValue}
              onChangeText={setCustomValue}
              placeholder="Custom"
              placeholderTextColor={Colors.text.muted}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleCustomAdd}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !customValue && styles.addButtonDisabled,
              ]}
              onPress={handleCustomAdd}
              disabled={!customValue}
            >
              <Feather name="plus" size={18} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {ayatCount > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Feather name="refresh-cw" size={14} color={Colors.semantic.error} />
              <Text style={styles.resetText}>Reset Count</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ayatIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${Colors.ibadah.quran}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.ibadah.quran,
  },
  milestonesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  milestoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
  },
  milestoneText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '500',
    color: Colors.text.muted,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.background.primary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  quickAddLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '500',
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  quickAddButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  quickAddButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.ibadah.quran,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  customInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.ibadah.quran,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.background.primary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  resetText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '500',
    color: Colors.semantic.error,
  },
});

export default QiyamAyatTracker;
