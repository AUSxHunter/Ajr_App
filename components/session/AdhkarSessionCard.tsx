import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { IbadahType } from '../../types';
import { useAdhkarStore } from '../../store/adhkarStore';
import { AdhkarType } from '../../constants/adhkar';
import { IbadahStreakDots } from './IbadahStreakDots';

interface AdhkarSessionCardProps {
  ibadahType: IbadahType;
}

interface AdhkarRowProps {
  type: AdhkarType;
  label: string;
  labelArabic: string;
  icon: 'sunrise' | 'sunset';
}

const AdhkarRow: React.FC<AdhkarRowProps> = ({ type, label, labelArabic, icon }) => {
  const router = useRouter();
  const isCompleted = useAdhkarStore((state) => state.isCompleted(type));
  const { completed, total } = useAdhkarStore(useShallow((state) => state.getTotalProgress(type)));
  
  const handlePress = () => {
    router.push({ pathname: '/adhkar/[type]', params: { type } });
  };

  const progressPercent = total > 0 ? (completed / total) * 100 : 0;
  const hasStarted = completed > 0;

  return (
    <TouchableOpacity style={styles.adhkarRow} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, isCompleted && styles.rowIconCompleted]}>
          <Feather
            name={icon}
            size={18}
            color={isCompleted ? Colors.semantic.success : Colors.ibadah.adhkar}
          />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowLabelArabic}>{labelArabic}</Text>
        </View>
      </View>
      
      <View style={styles.rowRight}>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Feather name="check" size={14} color={Colors.semantic.success} />
            <Text style={styles.completedText}>Done</Text>
          </View>
        ) : hasStarted ? (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{completed}/{total}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        ) : (
          <View style={styles.startButton}>
            <Feather name="play" size={14} color={Colors.ibadah.adhkar} />
            <Text style={styles.startText}>Start</Text>
          </View>
        )}
        <Feather name="chevron-right" size={20} color={Colors.text.muted} />
      </View>
    </TouchableOpacity>
  );
};

export const AdhkarSessionCard: React.FC<AdhkarSessionCardProps> = ({ ibadahType }) => {
  const checkAndResetIfNewDay = useAdhkarStore((state) => state.checkAndResetIfNewDay);
  const sabahCompleted = useAdhkarStore((state) => state.isCompleted('sabah'));
  const masaaCompleted = useAdhkarStore((state) => state.isCompleted('masaa'));
  const bothCompleted = sabahCompleted && masaaCompleted;

  useEffect(() => {
    checkAndResetIfNewDay();
  }, []);

  return (
    <Card padding="none" variant="outlined" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${ibadahType.color}20` }]}>
            <Feather
              name={ibadahType.icon as keyof typeof Feather.glyphMap}
              size={20}
              color={ibadahType.color}
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.ibadahName}>{ibadahType.name}</Text>
            <Text style={styles.ibadahNameArabic}>{ibadahType.nameArabic}</Text>
          </View>
        </View>

        {bothCompleted && (
          <View style={styles.allCompleteBadge}>
            <Feather name="check-circle" size={14} color={Colors.semantic.success} />
            <Text style={styles.allCompleteText}>Complete</Text>
          </View>
        )}
      </View>

      <IbadahStreakDots ibadahTypeId={ibadahType.id} color={ibadahType.color} />

      <View style={styles.divider} />

      <View style={styles.adhkarList}>
        <AdhkarRow
          type="sabah"
          label="Morning"
          labelArabic="أذكار الصباح"
          icon="sunrise"
        />
        <View style={styles.rowDivider} />
        <AdhkarRow
          type="masaa"
          label="Evening"
          labelArabic="أذكار المساء"
          icon="sunset"
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    gap: 2,
  },
  ibadahName: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  ibadahNameArabic: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  allCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: `${Colors.semantic.success}20`,
    borderRadius: BorderRadius.md,
  },
  allCompleteText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.semantic.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginHorizontal: Spacing.md,
  },
  adhkarList: {
    padding: Spacing.sm,
  },
  adhkarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.ibadah.adhkar}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconCompleted: {
    backgroundColor: `${Colors.semantic.success}15`,
  },
  rowInfo: {
    gap: 2,
  },
  rowLabel: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  rowLabelArabic: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: `${Colors.semantic.success}15`,
    borderRadius: BorderRadius.sm,
  },
  completedText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.semantic.success,
  },
  progressContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: Colors.background.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.ibadah.adhkar,
    borderRadius: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: `${Colors.ibadah.adhkar}15`,
    borderRadius: BorderRadius.sm,
  },
  startText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.ibadah.adhkar,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginVertical: Spacing.xs,
    marginLeft: 52,
  },
});

export default AdhkarSessionCard;
