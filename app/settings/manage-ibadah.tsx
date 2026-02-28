import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Modal, Input, ConfirmModal } from '../../components/ui';
import { useIbadahStore } from '../../store/ibadahStore';
import { IbadahUnit } from '../../types';

const UNIT_OPTIONS: { value: IbadahUnit; label: string }[] = [
  { value: 'pages', label: 'Pages' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'count', label: 'Count' },
  { value: 'currency', label: 'Currency' },
];

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
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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

  const handleArchive = (id: string) => {
    setArchiveConfirmId(id);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Manage Ibadah Types' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Active Ibadah Types</Text>
          <View style={styles.list}>
            {ibadahTypes.map((type) => (
              <Card key={type.id} style={styles.ibadahCard}>
                <View style={styles.ibadahRow}>
                  <View style={[styles.iconContainer, { backgroundColor: `${type.color}20` }]}>
                    <Feather
                      name={type.icon as keyof typeof Feather.glyphMap}
                      size={20}
                      color={type.color}
                    />
                  </View>
                  <View style={styles.ibadahInfo}>
                    <Text style={styles.ibadahName}>{type.name}</Text>
                    {type.nameArabic && <Text style={styles.ibadahArabic}>{type.nameArabic}</Text>}
                    <Text style={styles.ibadahUnit}>{type.unit}</Text>
                  </View>
                  {!type.isDefault && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => handleArchive(type.id)}
                        style={styles.actionButton}
                      >
                        <Feather name="archive" size={18} color={Colors.text.muted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(type.id)}
                        style={styles.actionButton}
                      >
                        <Feather name="trash-2" size={18} color={Colors.semantic.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>

          <Button
            title="Add Custom Ibadah"
            variant="secondary"
            icon={<Feather name="plus" size={18} color={Colors.text.primary} />}
            onPress={() => setAddModalVisible(true)}
            fullWidth
          />

          {archivedTypes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Archived</Text>
              <View style={styles.list}>
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
                        <Text style={[styles.ibadahName, { opacity: 0.5 }]}>{type.name}</Text>
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
            </>
          )}
        </ScrollView>

        <Modal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          title="Add Custom Ibadah"
          position="bottom"
        >
          <View style={styles.modalContent}>
            <Input
              label="Name"
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g., Tahajjud"
            />
            <Input
              label="Arabic Name (optional)"
              value={newNameArabic}
              onChangeText={setNewNameArabic}
              placeholder="e.g., التهجد"
            />

            <Text style={styles.fieldLabel}>Unit</Text>
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

            <Text style={styles.fieldLabel}>Icon</Text>
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

            <Text style={styles.fieldLabel}>Color</Text>
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
              title="Add Ibadah"
              variant="primary"
              fullWidth
              onPress={handleAddIbadah}
              disabled={!newName.trim()}
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
          title="Archive Ibadah"
          message="This will hide this ibadah type from your tracking. You can restore it later."
          confirmText="Archive"
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
          title="Delete Ibadah"
          message="This will permanently delete this custom ibadah type and cannot be undone. Any logged sets will remain in your history."
          confirmText="Delete"
          variant="danger"
        />
      </SafeAreaView>
    </>
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
