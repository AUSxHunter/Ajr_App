import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { IbadahType } from '../../types';
import { useSessionStore } from '../../store/sessionStore';

interface ManageIbadahModalProps {
  visible: boolean;
  onClose: () => void;
  ibadahTypes: IbadahType[];
}

export const ManageIbadahModal: React.FC<ManageIbadahModalProps> = ({
  visible,
  onClose,
  ibadahTypes,
}) => {
  const hiddenIbadahTypeIds = useSessionStore((state) => state.hiddenIbadahTypeIds);
  const toggleIbadahTypeVisibility = useSessionStore((state) => state.toggleIbadahTypeVisibility);
  const resetHiddenIbadahTypes = useSessionStore((state) => state.resetHiddenIbadahTypes);

  const visibleCount = ibadahTypes.filter((t) => !hiddenIbadahTypeIds.includes(t.id)).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Manage Ibadah</Text>
            <Text style={styles.subtitle}>
              {visibleCount} of {ibadahTypes.length} showing
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          Toggle which ibadah types appear on your session. Hidden types won't show in the main view but remain available in settings.
        </Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {ibadahTypes.map((ibadahType) => {
            const isVisible = !hiddenIbadahTypeIds.includes(ibadahType.id);
            return (
              <TouchableOpacity
                key={ibadahType.id}
                style={styles.itemRow}
                onPress={() => toggleIbadahTypeVisibility(ibadahType.id)}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${ibadahType.color}20` },
                      !isVisible && styles.iconContainerHidden,
                    ]}
                  >
                    <Feather
                      name={ibadahType.icon as keyof typeof Feather.glyphMap}
                      size={20}
                      color={isVisible ? ibadahType.color : Colors.text.muted}
                    />
                  </View>
                  <View>
                    <Text style={[styles.itemName, !isVisible && styles.itemNameHidden]}>
                      {ibadahType.name}
                    </Text>
                    {ibadahType.nameArabic && (
                      <Text style={styles.itemArabic}>{ibadahType.nameArabic}</Text>
                    )}
                  </View>
                </View>
                <Switch
                  value={isVisible}
                  onValueChange={() => toggleIbadahTypeVisibility(ibadahType.id)}
                  trackColor={{ false: Colors.border.default, true: Colors.accent.primary }}
                  thumbColor={Colors.text.inverse}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {hiddenIbadahTypeIds.length > 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={resetHiddenIbadahTypes}>
            <Feather name="refresh-cw" size={16} color={Colors.accent.primary} />
            <Text style={styles.resetButtonText}>Show All</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerHidden: {
    backgroundColor: Colors.background.elevated,
  },
  itemName: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  itemNameHidden: {
    color: Colors.text.muted,
  },
  itemArabic: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    marginTop: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.md,
  },
  resetButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
});

export default ManageIbadahModal;
