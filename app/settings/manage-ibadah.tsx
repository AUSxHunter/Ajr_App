import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import DraggableFlatList, { ScaleDecorator, ShadowDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Modal, Input, ConfirmModal } from '../../components/ui';
import { ReminderModal } from '../../components/notifications/ReminderModal';
import { useIbadahStore } from '../../store/ibadahStore';
import { IbadahType, IbadahUnit } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useColors } from '../../hooks/useColors';

const ICON_OPTIONS = [
  'book-open',
  'moon',
  'heart',
  'gift',
  'sunrise',
  'message-circle',
  'star',
  'sun',
  'feather',
  'droplet',
  'award',
  'bookmark',
];

const COLOR_OPTIONS = [
  '#22C55E',
  '#8B5CF6',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#14B8A6',
  '#6366F1',
  '#EF4444',
  '#F97316',
  '#84CC16',
];

export default function ManageIbadahScreen() {
  const { t, isRTL } = useTranslation();
  const Colors = useColors();
  const params = useLocalSearchParams<{ openAdd?: string }>();

  const UNIT_OPTIONS: { value: IbadahUnit; label: string }[] = [
    { value: 'pages', label: t('manageIbadah.unitLabels.pages') },
    { value: 'minutes', label: t('manageIbadah.unitLabels.minutes') },
    { value: 'count', label: t('manageIbadah.unitLabels.count') },
    { value: 'currency', label: t('manageIbadah.unitLabels.currency') },
    { value: 'yesno', label: t('manageIbadah.unitLabels.yesno') },
  ];
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    if (params.openAdd === 'true') {
      setAddModalVisible(true);
    }
  }, []);
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reminderIbadah, setReminderIbadah] = useState<IbadahType | null>(null);
  const [newName, setNewName] = useState('');
  const [newNameArabic, setNewNameArabic] = useState('');
  const [newUnit, setNewUnit] = useState<IbadahUnit>('count');
  const [newIcon, setNewIcon] = useState('star');
  const [newColor, setNewColor] = useState('#6366F1');

  const ibadahTypesRaw = useIbadahStore((state) => state.ibadahTypes);
  const addIbadahType = useIbadahStore((state) => state.addIbadahType);
  const archiveIbadahType = useIbadahStore((state) => state.archiveIbadahType);
  const restoreIbadahType = useIbadahStore((state) => state.restoreIbadahType);
  const deleteIbadahType = useIbadahStore((state) => state.deleteIbadahType);
  const reorderIbadahTypes = useIbadahStore((state) => state.reorderIbadahTypes);
  const ibadahTypes = useMemo(
    () =>
      ibadahTypesRaw.filter((type) => !type.isArchived).sort((a, b) => a.sortOrder - b.sortOrder),
    [ibadahTypesRaw]
  );
  const archivedTypes = useMemo(() => ibadahTypesRaw.filter((t) => t.isArchived), [ibadahTypesRaw]);

  const handleAddIbadah = () => {
    if (!newName.trim()) return;

    addIbadahType({
      name: newName.trim(),
      nameArabic: newNameArabic.trim() || undefined,
      unit: newUnit,
      icon: newIcon,
      color: newColor,
    });

    setNewName('');
    setNewNameArabic('');
    setNewUnit('count');
    setNewIcon('star');
    setNewColor('#6366F1');
    setAddModalVisible(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const styles = makeStyles(Colors);

  const renderDraggableItem = useCallback(
    ({ item: type, drag, isActive }: RenderItemParams<IbadahType>) => (
      <ShadowDecorator>
        <ScaleDecorator activeScale={1.03}>
        <Card style={[styles.ibadahCard, isActive && styles.ibadahCardActive]}>
          <View style={styles.ibadahRow}>
            <TouchableOpacity
              onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); drag(); }}
              style={styles.dragHandle}
              activeOpacity={0.6}
            >
              <Feather name="menu" size={18} color={Colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { backgroundColor: `${type.color}20` }]}>
              <Feather
                name={type.icon as keyof typeof Feather.glyphMap}
                size={20}
                color={type.color}
              />
            </View>
            <View style={styles.ibadahInfo}>
              <Text style={styles.ibadahName}>
                {isRTL ? (type.nameArabic || type.name) : type.name}
              </Text>
              {!isRTL && type.nameArabic && (
                <Text style={styles.ibadahArabic}>{type.nameArabic}</Text>
              )}
              <Text style={styles.ibadahUnit}>{type.unit}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => setReminderIbadah(type)}
                style={styles.actionButton}
              >
                <Feather
                  name="bell"
                  size={18}
                  color={type.reminderEnabled ? Colors.accent.primary : Colors.text.muted}
                />
              </TouchableOpacity>
              {!type.isDefault && (
                <>
                  <TouchableOpacity
                    onPress={() => setArchiveConfirmId(type.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="archive" size={18} color={Colors.text.muted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDeleteConfirmId(type.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="trash-2" size={18} color={Colors.semantic.error} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Card>
        </ScaleDecorator>
      </ShadowDecorator>
    ),
    [isRTL, Colors, styles]
  );

  return (
    <>
      <Stack.Screen options={{ title: t('manageIbadah.title') }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <DraggableFlatList
          data={ibadahTypes}
          keyExtractor={(item) => item.id}
          renderItem={renderDraggableItem}
          onDragEnd={({ data }) => reorderIbadahTypes(data.map((t) => t.id))}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          dragItemOverflow={true}
          animationConfig={{ duration: 200, easing: (t: number) => t * (2 - t) }}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { marginBottom: Spacing.sm }]}>
              {t('manageIbadah.activeTypes')}
            </Text>
          }
          ListFooterComponent={
            archivedTypes.length > 0 ? (
              <View style={styles.archivedSection}>
                <Text style={styles.sectionTitle}>{t('manageIbadah.archived')}</Text>
                <View style={[styles.list, { marginTop: Spacing.sm }]}>
                  {archivedTypes.map((type) => (
                    <Card key={type.id} style={styles.ibadahCard}>
                      <View style={styles.ibadahRow}>
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: `${type.color}20`, opacity: 0.5 },
                          ]}
                        >
                          <Feather
                            name={type.icon as keyof typeof Feather.glyphMap}
                            size={20}
                            color={type.color}
                          />
                        </View>
                        <View style={styles.ibadahInfo}>
                          <Text style={[styles.ibadahName, { opacity: 0.5 }]}>
                            {isRTL ? (type.nameArabic || type.name) : type.name}
                          </Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            onPress={() => restoreIbadahType(type.id)}
                            style={styles.actionButton}
                          >
                            <Feather name="refresh-cw" size={18} color={Colors.accent.primary} />
                          </TouchableOpacity>
                          {!type.isDefault && (
                            <TouchableOpacity
                              onPress={() => handleDelete(type.id)}
                              style={styles.actionButton}
                            >
                              <Feather name="trash-2" size={18} color={Colors.semantic.error} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        <Modal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          title={t('manageIbadah.addCustomTitle')}
          position="bottom"
        >
          <View style={styles.modalContent}>
            <Input
              label={t('manageIbadah.name')}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g., Tahajjud"
            />
            <Input
              label={t('manageIbadah.arabicName')}
              value={newNameArabic}
              onChangeText={setNewNameArabic}
              placeholder="مثلاً، التهجد"
            />

            <Text style={styles.fieldLabel}>{t('manageIbadah.unit')}</Text>
            <View style={styles.optionsRow}>
              {UNIT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    newUnit === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setNewUnit(option.value)}
                >
                  <Text
                    style={[styles.optionText, newUnit === option.value && styles.optionTextActive]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>{t('manageIbadah.icon')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconGrid}
            >
              {ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, newIcon === icon && styles.iconOptionActive]}
                  onPress={() => setNewIcon(icon)}
                >
                  <Feather
                    name={icon as keyof typeof Feather.glyphMap}
                    size={20}
                    color={newIcon === icon ? Colors.text.primary : Colors.text.muted}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>{t('manageIbadah.color')}</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newColor === color && styles.colorOptionActive,
                  ]}
                  onPress={() => setNewColor(color)}
                >
                  {newColor === color && <Feather name="check" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={t('manageIbadah.addIbadah')}
              variant="primary"
              fullWidth
              onPress={handleAddIbadah}
              disabled={!newName.trim() || !newNameArabic.trim()}
            />
          </View>
        </Modal>

        <ConfirmModal
          visible={archiveConfirmId !== null}
          onClose={() => setArchiveConfirmId(null)}
          onConfirm={() => {
            if (archiveConfirmId) {
              archiveIbadahType(archiveConfirmId);
            }
          }}
          title={t('manageIbadah.archiveTitle')}
          message={t('manageIbadah.archiveMessage')}
          confirmText={t('manageIbadah.archive')}
          variant="default"
        />

        <ConfirmModal
          visible={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            if (deleteConfirmId) {
              deleteIbadahType(deleteConfirmId);
            }
          }}
          title={t('manageIbadah.deleteTitle')}
          message={t('manageIbadah.deleteMessage')}
          confirmText={t('common.delete')}
          variant="danger"
        />

        <ReminderModal
          ibadah={reminderIbadah}
          visible={reminderIbadah !== null}
          onClose={() => setReminderIbadah(null)}
        />
      </SafeAreaView>
    </>
  );
}

const makeStyles = (Colors: ReturnType<typeof import('../../hooks/useColors').useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background.primary,
    },
    content: {
      padding: Spacing.md,
      gap: Spacing.lg,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.caption,
      fontWeight: '600',
      color: Colors.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    list: {
      gap: Spacing.sm,
    },
    ibadahCard: {
      padding: Spacing.md,
    },
    ibadahRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ibadahInfo: {
      flex: 1,
    },
    ibadahName: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: Colors.text.primary,
    },
    ibadahArabic: {
      fontSize: Typography.fontSize.caption,
      color: Colors.text.muted,
    },
    ibadahUnit: {
      fontSize: Typography.fontSize.caption,
      color: Colors.accent.primary,
      marginTop: 2,
    },
    dragHandle: {
      padding: Spacing.sm,
      marginRight: 2,
    },
    ibadahCardActive: {
      borderColor: Colors.accent.primary + '40',
      borderWidth: 1,
    },
    archivedSection: {
      gap: Spacing.sm,
      marginTop: Spacing.lg,
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    actionButton: {
      padding: Spacing.sm,
    },
    modalContent: {
      gap: Spacing.lg,
    },
    fieldLabel: {
      fontSize: Typography.fontSize.bodySmall,
      fontWeight: '500',
      color: Colors.text.secondary,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    optionButton: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: Colors.background.elevated,
    },
    optionButtonActive: {
      backgroundColor: Colors.accent.primary,
    },
    optionText: {
      fontSize: Typography.fontSize.bodySmall,
      color: Colors.text.secondary,
    },
    optionTextActive: {
      color: Colors.text.primary,
      fontWeight: '600',
    },
    iconGrid: {
      gap: Spacing.sm,
    },
    iconOption: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconOptionActive: {
      backgroundColor: Colors.accent.primary,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    colorOption: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorOptionActive: {
      borderWidth: 3,
      borderColor: Colors.text.primary,
    },
  });
