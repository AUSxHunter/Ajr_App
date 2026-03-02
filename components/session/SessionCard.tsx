import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Card, ConfirmModal } from '../ui';
import { SetRow } from './SetRow';
import { QiyamAyatTracker } from './QiyamAyatTracker';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { IbadahType, SessionSet } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { useSessionStore } from '../../store/sessionStore';
import { IbadahStreakDots } from './IbadahStreakDots';
import { useTranslation } from '../../hooks/useTranslation';

interface SessionCardProps {
  ibadahType: IbadahType;
  sets: SessionSet[];
  onAddSet: () => void;
  onEditSet: (set: SessionSet) => void;
  onDeleteSet: (setId: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  ibadahType,
  sets,
  onAddSet,
  onEditSet,
  onDeleteSet,
}) => {
  const { t, tUnit, isRTL } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(sets.length > 0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const rotation = useSharedValue(sets.length > 0 ? 1 : 0);

  const totalValue = sets.reduce((sum, set) => sum + set.value, 0);
  const isBinary = ibadahType.unit === 'binary';
  const hasFasted = isBinary && totalValue >= 1;
  const isQiyam = ibadahType.id === 'qiyam';

  const mvdValue = useSettingsStore((state) => state.getMinimumViableDay(ibadahType.id));
  const mvdMet = mvdValue !== undefined && totalValue >= mvdValue;

  const qiyamAyatCount = useSessionStore((state) => state.qiyamAyatCount);
  const setQiyamAyatCount = useSessionStore((state) => state.setQiyamAyatCount);

  const toggleExpand = () => {
    if (isBinary) return;
    setIsExpanded(!isExpanded);
    rotation.value = withTiming(isExpanded ? 0 : 1, { duration: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  const formatTotal = () => {
    if (ibadahType.unit === 'currency') {
      return `${totalValue.toFixed(0)} AED`;
    }
    if (ibadahType.unit === 'binary') {
      return totalValue >= 1 ? t('sessionCard.fasted') : t('sessionCard.notLogged');
    }
    return `${totalValue} ${tUnit(ibadahType.unit, totalValue)}`;
  };

  const handleBinaryToggle = () => {
    if (hasFasted && sets.length > 0) {
      setDeleteConfirmId(sets[0].id);
    } else {
      onAddSet();
    }
  };

  if (isBinary) {
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
              <Text style={styles.ibadahName}>
                {isRTL ? (ibadahType.nameArabic || ibadahType.name) : ibadahType.name}
              </Text>
              {!isRTL && ibadahType.nameArabic && (
                <Text style={styles.ibadahNameArabic}>{ibadahType.nameArabic}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.binaryToggle,
              hasFasted && styles.binaryToggleActive,
            ]}
            onPress={handleBinaryToggle}
          >
            <Feather
              name={hasFasted ? 'check' : 'plus'}
              size={18}
              color={hasFasted ? Colors.semantic.success : Colors.text.muted}
            />
            <Text
              style={[
                styles.binaryToggleText,
                hasFasted && styles.binaryToggleTextActive,
              ]}
            >
              {hasFasted ? t('sessionCard.fasted') : t('sessionCard.log')}
            </Text>
          </TouchableOpacity>
        </View>

        <IbadahStreakDots ibadahTypeId={ibadahType.id} color={ibadahType.color} />

        <ConfirmModal
          visible={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            if (deleteConfirmId) {
              onDeleteSet(deleteConfirmId);
              setDeleteConfirmId(null);
            }
          }}
          title={t('sessionCard.removeFasting')}
          message={t('sessionCard.removeFastingMessage')}
          confirmText={t('common.remove')}
          variant="danger"
        />
      </Card>
    );
  }

  return (
    <Card padding="none" variant="outlined" style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${ibadahType.color}20` }]}>
            <Feather
              name={ibadahType.icon as keyof typeof Feather.glyphMap}
              size={20}
              color={ibadahType.color}
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.ibadahName}>
              {isRTL ? (ibadahType.nameArabic || ibadahType.name) : ibadahType.name}
            </Text>
            {!isRTL && ibadahType.nameArabic && (
              <Text style={styles.ibadahNameArabic}>{ibadahType.nameArabic}</Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.stats}>
            <Text style={styles.totalValue}>{formatTotal()}</Text>
            {mvdValue !== undefined ? (
              <View style={styles.mvdRow}>
                {mvdMet && (
                  <Feather name="check-circle" size={12} color={Colors.semantic.success} />
                )}
                <Text style={[styles.mvdTarget, mvdMet && styles.mvdTargetMet]}>
                  {t('sessionCard.min', { value: mvdValue, unit: tUnit(ibadahType.unit, mvdValue) })}
                </Text>
              </View>
            ) : (
              <Text style={styles.setCount}>
                {sets.length} {sets.length === 1 ? t('sessionCard.set') : t('sessionCard.sets')}
              </Text>
            )}
          </View>
          <Animated.View style={chevronStyle}>
            <Feather name="chevron-down" size={20} color={Colors.text.muted} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <IbadahStreakDots ibadahTypeId={ibadahType.id} color={ibadahType.color} />

      {isExpanded && (
        <View style={styles.content}>
          {sets.length > 0 && (
            <View style={styles.setsList}>
              {sets.map((set, index) => (
                <SetRow
                  key={set.id}
                  set={set}
                  ibadahType={ibadahType}
                  index={index}
                  onEdit={() => onEditSet(set)}
                  onDelete={() => setDeleteConfirmId(set.id)}
                />
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.addButton} onPress={onAddSet}>
            <Feather name="plus" size={18} color={Colors.accent.primary} />
            <Text style={styles.addButtonText}>{t('sessionCard.addSet')}</Text>
          </TouchableOpacity>

          {isQiyam && (
            <QiyamAyatTracker
              ayatCount={qiyamAyatCount}
              onAyatCountChange={setQiyamAyatCount}
            />
          )}
        </View>
      )}

      <ConfirmModal
        visible={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            onDeleteSet(deleteConfirmId);
          }
        }}
        title={t('sessionCard.deleteSet')}
        message={t('sessionCard.deleteSetMessage')}
        confirmText={t('common.delete')}
        variant="danger"
      />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stats: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.accent.primary,
  },
  setCount: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  mvdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mvdTarget: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  mvdTargetMet: {
    color: Colors.semantic.success,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  setsList: {
    gap: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
  binaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.elevated,
  },
  binaryToggleActive: {
    backgroundColor: `${Colors.semantic.success}20`,
  },
  binaryToggleText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  binaryToggleTextActive: {
    color: Colors.semantic.success,
  },
});

export default SessionCard;
