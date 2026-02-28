import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { format } from 'date-fns';
import { useSessionStore } from '../store/sessionStore';
import { useIbadahStore } from '../store/ibadahStore';
import { useSettingsStore } from '../store/settingsStore';
import { Session, SessionSet, IbadahType, UserSettings } from '../types';

interface ExportData {
  version: string;
  exportedAt: string;
  sessions: Session[];
  sessionSets: SessionSet[];
  ibadahTypes: IbadahType[];
  settings: Partial<UserSettings>;
}

const EXPORT_VERSION = '1.0.0';

export const exportAllData = async (): Promise<boolean> => {
  try {
    const sessionState = useSessionStore.getState();
    const ibadahState = useIbadahStore.getState();
    const settingsState = useSettingsStore.getState();

    const exportData: ExportData = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      sessions: sessionState.sessions,
      sessionSets: sessionState.sessionSets,
      ibadahTypes: ibadahState.ibadahTypes,
      settings: {
        minimumViableDays: settingsState.minimumViableDays,
        notificationsEnabled: settingsState.notificationsEnabled,
        notificationTime: settingsState.notificationTime,
        privacyModeEnabled: settingsState.privacyModeEnabled,
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `ajr-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Ajr Data',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('Export Complete', `Data saved to: ${fileName}`, [{ text: 'OK' }]);
    }

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    Alert.alert('Export Failed', 'An error occurred while exporting your data. Please try again.', [
      { text: 'OK' },
    ]);
    return false;
  }
};

const validateImportData = (data: unknown): data is ExportData => {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'string') return false;
  if (!Array.isArray(obj.sessions)) return false;
  if (!Array.isArray(obj.sessionSets)) return false;
  if (!Array.isArray(obj.ibadahTypes)) return false;

  return true;
};

export const importData = async (): Promise<boolean> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return false;
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let importData: unknown;
    try {
      importData = JSON.parse(fileContent);
    } catch {
      Alert.alert('Invalid File', 'The selected file is not a valid JSON file.', [{ text: 'OK' }]);
      return false;
    }

    if (!validateImportData(importData)) {
      Alert.alert('Invalid Data', 'The selected file does not contain valid Ajr backup data.', [
        { text: 'OK' },
      ]);
      return false;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Import Data',
        'This will replace all your current data with the imported data. This action cannot be undone. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                const settingsStore = useSettingsStore.getState();

                useSessionStore.setState({
                  sessions: importData.sessions.map((s) => ({
                    ...s,
                    startedAt: new Date(s.startedAt),
                    completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
                    createdAt: new Date(s.createdAt),
                    updatedAt: new Date(s.updatedAt),
                  })),
                  sessionSets: importData.sessionSets.map((s) => ({
                    ...s,
                    loggedAt: new Date(s.loggedAt),
                    createdAt: new Date(s.createdAt),
                    updatedAt: new Date(s.updatedAt),
                  })),
                });

                useIbadahStore.setState({
                  ibadahTypes: importData.ibadahTypes.map((t) => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt),
                  })),
                });

                if (importData.settings) {
                  const settings = importData.settings;
                  if (settings.minimumViableDays) {
                    settings.minimumViableDays.forEach((mvd) => {
                      settingsStore.setMinimumViableDay(mvd.ibadahTypeId, mvd.minimumValue);
                    });
                  }
                  if (typeof settings.notificationsEnabled === 'boolean') {
                    settingsStore.setNotificationsEnabled(settings.notificationsEnabled);
                  }
                  if (settings.notificationTime) {
                    settingsStore.setNotificationTime(settings.notificationTime);
                  }
                  if (typeof settings.privacyModeEnabled === 'boolean') {
                    settingsStore.setPrivacyModeEnabled(settings.privacyModeEnabled);
                  }
                }

                Alert.alert(
                  'Import Complete',
                  `Successfully imported ${importData.sessions.length} sessions and ${importData.ibadahTypes.length} ibadah types.`,
                  [{ text: 'OK' }]
                );
                resolve(true);
              } catch (error) {
                console.error('Import restore failed:', error);
                Alert.alert('Import Failed', 'An error occurred while restoring the data.', [
                  { text: 'OK' },
                ]);
                resolve(false);
              }
            },
          },
        ]
      );
    });
  } catch (error) {
    console.error('Import failed:', error);
    Alert.alert('Import Failed', 'An error occurred while importing your data. Please try again.', [
      { text: 'OK' },
    ]);
    return false;
  }
};
