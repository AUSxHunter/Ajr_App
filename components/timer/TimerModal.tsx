import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { Modal, Button } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTimerStore } from '../../store/timerStore';
import { TimerMode } from '../../types';
import { PRESET_COUNTDOWN_DURATIONS } from '../../constants/defaults';

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: (seconds: number) => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({ visible, onClose, onComplete }) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showPresets, setShowPresets] = useState(true);

  const mode = useTimerStore((state) => state.mode);
  const isRunning = useTimerStore((state) => state.isRunning);
  const elapsedSeconds = useTimerStore((state) => state.elapsedSeconds);
  const targetSeconds = useTimerStore((state) => state.targetSeconds);
  const startTimer = useTimerStore((state) => state.startTimer);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);
  const resumeTimer = useTimerStore((state) => state.resumeTimer);
  const resetTimer = useTimerStore((state) => state.resetTimer);
  const updateElapsed = useTimerStore((state) => state.updateElapsed);
  const getFormattedTime = useTimerStore((state) => state.getFormattedTime);
  const isComplete = useTimerStore((state) => state.isComplete);

  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        updateElapsed(elapsedSeconds + 1);
      }, 1000);

      pulseAnim.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
      );
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      cancelAnimation(pulseAnim);
      pulseAnim.value = 1;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, elapsedSeconds, updateElapsed, pulseAnim]);

  useEffect(() => {
    if (isComplete() && isRunning) {
      pauseTimer();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isComplete, isRunning, pauseTimer]);

  const handleStartStopwatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTimer('stopwatch');
    setShowPresets(false);
  };

  const handleStartCountdown = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTimer('countdown', seconds);
    setShowPresets(false);
  };

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetTimer();
    setShowPresets(true);
  };

  const handleDone = () => {
    const finalSeconds =
      mode === 'countdown' && targetSeconds
        ? Math.min(elapsedSeconds, targetSeconds)
        : elapsedSeconds;

    if (finalSeconds > 0 && onComplete) {
      onComplete(finalSeconds);
    }
    resetTimer();
    setShowPresets(true);
    onClose();
  };

  const handleClose = () => {
    if (elapsedSeconds > 0 || isRunning) {
      Alert.alert('Timer Active', 'You have an active timer. What would you like to do?', [
        {
          text: 'Keep Timer',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            resetTimer();
            setShowPresets(true);
            onClose();
          },
        },
        {
          text: 'Log & Close',
          onPress: handleDone,
        },
      ]);
    } else {
      onClose();
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const progress =
    mode === 'countdown' && targetSeconds ? Math.min(1, elapsedSeconds / targetSeconds) : 0;

  return (
    <Modal visible={visible} onClose={handleClose} title="Timer" position="bottom" size="lg">
      <View style={styles.container}>
        {showPresets ? (
          <View style={styles.presetContainer}>
            <TouchableOpacity style={styles.modeButton} onPress={handleStartStopwatch}>
              <View style={styles.modeIcon}>
                <Feather name="play" size={32} color={Colors.accent.primary} />
              </View>
              <Text style={styles.modeTitle}>Stopwatch</Text>
              <Text style={styles.modeDescription}>Track time without a limit</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.presetsTitle}>Countdown</Text>
            <View style={styles.presetGrid}>
              {PRESET_COUNTDOWN_DURATIONS.map((preset) => (
                <TouchableOpacity
                  key={preset.seconds}
                  style={styles.presetButton}
                  onPress={() => handleStartCountdown(preset.seconds)}
                >
                  <Text style={styles.presetText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.timerContainer}>
            <Animated.View style={[styles.timerDisplay, pulseStyle]}>
              {mode === 'countdown' && (
                <View style={styles.progressRing}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress * 100}%`,
                      },
                    ]}
                  />
                </View>
              )}
              <Text style={styles.timerText}>{getFormattedTime()}</Text>
              <Text style={styles.timerMode}>
                {mode === 'stopwatch' ? 'Stopwatch' : 'Countdown'}
              </Text>
            </Animated.View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
                <Feather name="rotate-ccw" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.playButton, isRunning && styles.playButtonActive]}
                onPress={handlePlayPause}
              >
                <Feather
                  name={isRunning ? 'pause' : 'play'}
                  size={32}
                  color={Colors.text.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={handleDone}>
                <Feather name="check" size={24} color={Colors.semantic.success} />
              </TouchableOpacity>
            </View>

            {elapsedSeconds > 0 && (
              <Button
                title="Log Time & Close"
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleDone}
                style={styles.doneButton}
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 400,
  },
  presetContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  modeButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  modeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.accent.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  modeTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modeDescription: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.default,
  },
  dividerText: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
  },
  presetsTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.secondary,
    alignSelf: 'flex-start',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
  },
  presetButton: {
    width: '31%',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  presetText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timerContainer: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.background.elevated,
    position: 'relative',
    overflow: 'hidden',
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.border.default,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
  },
  timerText: {
    fontSize: Typography.fontSize.displayLarge,
    fontWeight: '700',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  timerMode: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: Colors.semantic.warning,
  },
  doneButton: {
    marginTop: Spacing.md,
  },
});

export default TimerModal;
