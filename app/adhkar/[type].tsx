import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Vibration,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';
import { useAdhkarStore } from '../../store/adhkarStore';
import { useSessionStore } from '../../store/sessionStore';
import {
  AdhkarType,
  getAdhkarByType,
  getAdhkarTitle,
  Adhkar,
} from '../../constants/adhkar';
import { useTranslation } from '../../hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function addAyahNumbers(arabic: string): string {
  let count = 0;
  return arabic.replace(/۝/g, () => {
    count++;
    const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const num = String(count).split('').map(c => digits[parseInt(c)] ?? c).join('');
    return '۝' + num;
  });
}

interface AdhkarItemCardProps {
  adhkar: Adhkar;
  adhkarType: AdhkarType;
  onIncrement: () => void;
}

const AdhkarItemCard = React.memo(({
  adhkar,
  adhkarType,
  onIncrement,
}: AdhkarItemCardProps) => {
  const { t, isRTL } = useTranslation();
  const currentCount = useAdhkarStore(
    useCallback(
      (s) => {
        const progress = adhkarType === 'sabah'
          ? s.dailyState.sabahProgress
          : s.dailyState.masaaProgress;
        return progress[adhkar.id] || 0;
      },
      [adhkarType, adhkar.id]
    )
  );
  const isCompleted = currentCount >= adhkar.count;

  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  React.useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0);
  }, [isCompleted]);

  const handlePress = () => {
    if (isCompleted) return;
    
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    
    Vibration.vibrate(10);
    onIncrement();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const remainingCount = Math.max(0, adhkar.count - currentCount);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={isCompleted}
      >
        <Card style={[styles.adhkarCard, isCompleted && styles.adhkarCardCompleted]}>
          <ScrollView
            style={styles.arabicScrollView}
            contentContainerStyle={styles.arabicScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.arabicWrapper}>
              <Text style={styles.arabicText}>{addAyahNumbers(adhkar.arabic)}</Text>
            </View>
          </ScrollView>

          {!isRTL && (
            <View style={styles.translationContainer}>
              <Text style={styles.translationText} numberOfLines={3}>
                {adhkar.translation}
              </Text>
            </View>
          )}

          {!isRTL && adhkar.source && (
            <Text style={styles.sourceText}>{adhkar.source}</Text>
          )}

          <View style={styles.counterSection}>
            {isCompleted ? (
              <Animated.View style={[styles.completedContainer, checkAnimatedStyle]}>
                <Feather name="check-circle" size={32} color={Colors.semantic.success} />
                <Text style={styles.completedText}>{t('adhkarReader.completed')}</Text>
              </Animated.View>
            ) : (
              <>
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterCurrent}>{currentCount}</Text>
                  <Text style={styles.counterSeparator}>/</Text>
                  <Text style={styles.counterTotal}>{adhkar.count}</Text>
                </View>
                <Text style={styles.tapHint}>
                  {t('adhkarReader.tapHint', {
                    count: remainingCount,
                    times: remainingCount === 1 ? t('adhkarReader.tapHintTime') : t('adhkarReader.tapHintTimes'),
                  })}
                </Text>
              </>
            )}
          </View>

          {!isRTL && adhkar.virtue && !isCompleted && (
            <View style={styles.virtueContainer}>
              <Feather name="star" size={12} color={Colors.semantic.warning} />
              <Text style={styles.virtueText} numberOfLines={2}>
                {adhkar.virtue}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function AdhkarReaderScreen() {
  const { t, tUnit, isRTL } = useTranslation();
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const adhkarType = (type as AdhkarType) || 'sabah';
  const adhkarList = useMemo(() => getAdhkarByType(adhkarType), [adhkarType]);
  const title = getAdhkarTitle(adhkarType);

  const getProgress = useAdhkarStore((state) => state.getProgress);
  const incrementCount = useAdhkarStore((state) => state.incrementCount);
  const markComplete = useAdhkarStore((state) => state.markComplete);
  const checkAndResetIfNewDay = useAdhkarStore((state) => state.checkAndResetIfNewDay);
  const isSessionCompleted = useAdhkarStore((state) => state.isCompleted(adhkarType));
  const { completed, total } = useAdhkarStore(useShallow((state) => state.getTotalProgress(adhkarType)));

  useEffect(() => {
    checkAndResetIfNewDay();
  }, []);

  const addSet = useSessionStore((state) => state.addSet);
  const startSession = useSessionStore((state) => state.startSession);
  const sessions = useSessionStore((state) => state.sessions);

  const [currentIndex, setCurrentIndex] = useState(0);

  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  const handleComplete = useCallback(() => {
    markComplete(adhkarType);

    const todayDateString = new Date().toISOString().split('T')[0];
    let todaySession = sessions.find(
      (s) => s.sessionDate === todayDateString && !s.completedAt
    );

    if (!todaySession) {
      todaySession = sessions.find((s) => s.sessionDate === todayDateString);
    }

    if (!todaySession) {
      todaySession = startSession();
    }

    if (todaySession) {
      addSet({
        sessionId: todaySession.id,
        ibadahTypeId: 'adhkar',
        value: 1,
        notes: adhkarType === 'sabah' ? t('adhkarReader.morningAdhkar') : t('adhkarReader.eveningAdhkar'),
      });
    }

    Alert.alert(
      t('adhkarReader.mashaAllah'),
      t('adhkarReader.completionMessage', { title: isRTL ? title.arabic : title.english }),
      [
        {
          text: t('adhkarReader.ameen'),
          onPress: () => router.back(),
        },
      ]
    );
  }, [adhkarType, markComplete, sessions, startSession, addSet, title.english, router]);

  const handleIncrement = useCallback(
    (adhkarId: string, requiredCount: number) => {
      incrementCount(adhkarType, adhkarId);

      const newCount = getProgress(adhkarType, adhkarId);

      if (newCount >= requiredCount) {
        const newCompletedCount = adhkarList.filter((a) => {
          if (a.id === adhkarId) return true;
          const count = getProgress(adhkarType, a.id);
          return count >= a.count;
        }).length;

        if (newCompletedCount === adhkarList.length && !isSessionCompleted) {
          handleComplete();
        }
      }
    },
    [adhkarType, adhkarList, getProgress, incrementCount, isSessionCompleted, handleComplete]
  );

  const incrementHandlers = useMemo(
    () => new Map(adhkarList.map(a => [a.id, () => handleIncrement(a.id, a.count)])),
    [adhkarList, handleIncrement]
  );

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const cardHeight = 400;
    const newIndex = Math.round(offsetY / cardHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < adhkarList.length) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText}>
                {isRTL ? title.arabic : title.english}
              </Text>
              {!isRTL && <Text style={styles.headerTitleArabic}>{title.arabic}</Text>}
            </View>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]} edges={['bottom']}>
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>{t('adhkarReader.progress')}</Text>
            <Text style={styles.progressDot}>·</Text>
            <Text style={styles.progressCount}>
              {completed}/{total} {tUnit('adhkar', total)} · {Math.round(progressPercent)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {adhkarList.map((adhkar, index) => (
            <View key={adhkar.id} style={styles.cardWrapper}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
              <AdhkarItemCard
                adhkar={adhkar}
                adhkarType={adhkarType}
                onIncrement={incrementHandlers.get(adhkar.id)!}
              />
            </View>
          ))}

          {isSessionCompleted && (
            <View style={styles.completionMessage}>
              <Feather name="award" size={48} color={Colors.semantic.success} />
              <Text style={styles.completionTitle}>{t('adhkarReader.allDone')}</Text>
              <Text style={styles.completionSubtitle}>
                {t('adhkarReader.allDoneSubtitle', { title: isRTL ? title.arabic : title.english })}
              </Text>
            </View>
          )}
        </ScrollView>

        {!isSessionCompleted && completed === total && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Feather name="check-circle" size={20} color={Colors.text.primary} />
            <Text style={styles.completeButtonText}>{t('adhkarReader.markComplete')}</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerTitleArabic: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  progressHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
  },
  progressDot: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
  },
  progressCount: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.elevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.ibadah.adhkar,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  cardWrapper: {
    marginBottom: Spacing.lg,
  },
  indexBadge: {
    position: 'absolute',
    top: -8,
    start: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ibadah.adhkar,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  indexText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  adhkarCard: {
    padding: Spacing.lg,
  },
  adhkarCardCompleted: {
    borderColor: Colors.semantic.success,
    borderWidth: 1,
    opacity: 0.8,
  },
  arabicScrollView: {
    maxHeight: 150,
    marginBottom: Spacing.md,
  },
  arabicScrollContent: {
    flexGrow: 1,
  },
  arabicWrapper: {
    width: '100%',
    direction: 'rtl',
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 38,
    color: Colors.text.primary,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  translationContainer: {
    marginBottom: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  translationText: {
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: 22,
    color: Colors.text.secondary,
  },
  sourceText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    marginBottom: Spacing.md,
  },
  counterSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  counterDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterCurrent: {
    fontSize: Typography.fontSize.display,
    fontWeight: '700',
    color: Colors.ibadah.adhkar,
  },
  counterSeparator: {
    fontSize: Typography.fontSize.h2,
    color: Colors.text.muted,
    marginHorizontal: 4,
  },
  counterTotal: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '500',
    color: Colors.text.muted,
  },
  tapHint: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  completedContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  completedText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.semantic.success,
  },
  virtueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: `${Colors.semantic.warning}10`,
    borderRadius: BorderRadius.md,
  },
  virtueText: {
    flex: 1,
    fontSize: Typography.fontSize.caption,
    color: Colors.semantic.warning,
    lineHeight: 18,
  },
  completionMessage: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  completionTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.semantic.success,
  },
  completionSubtitle: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    margin: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.semantic.success,
    borderRadius: BorderRadius.lg,
  },
  completeButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
