import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Screen, SectionTitle, tw } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { downloadBackup, importBackup, shareBackup } from '../../services/backup';

type Props = NativeStackScreenProps<RootStackParamList, 'Backup'>;

export default function BackupScreen({ navigation }: Props) {
  const { reload } = useSettings();
  const [busy, setBusy] = useState<'download' | 'share' | 'import' | null>(null);

  const wrap = (kind: typeof busy, fn: () => Promise<void>) => async () => {
    setBusy(kind);
    try {
      await fn();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  const onDownload = wrap('download', async () => {
    const name = await downloadBackup();
    if (name) {
      Alert.alert('Backup saved', `Saved as ${name}`);
    }
  });

  const onShare = wrap('share', shareBackup);

  const onImport = () =>
    Alert.alert('Restore backup?', 'All current data on this phone will be replaced by the backup file. Download a backup first if you are unsure.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Choose file',
        style: 'destructive',
        onPress: wrap('import', async () => {
          const done = await importBackup();
          if (done) {
            await reload();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Tabs' }] }));
            Alert.alert('Restored', 'Backup imported successfully.');
          }
        }),
      },
    ]);

  return (
    <Screen scroll>
      <SectionTitle>Download</SectionTitle>
      <Card>
        <Text style={tw`text-slate-600 mb-3`}>
          Saves the full SQLite database (items, vendors, purchases, stock, orders, customers and settings) as a single .sqlite file.
        </Text>
        <Button title="Download backup (.sqlite)" onPress={onDownload} loading={busy === 'download'} disabled={!!busy} />
        <Button title="Share backup (Drive, WhatsApp...)" variant="outline" style={tw`mt-2`} onPress={onShare} loading={busy === 'share'} disabled={!!busy} />
      </Card>

      <SectionTitle>Restore</SectionTitle>
      <Card>
        <Text style={tw`text-slate-600 mb-3`}>Import a .sqlite backup created by this app. Your current data will be replaced.</Text>
        <Button title="Import backup" variant="danger" onPress={onImport} loading={busy === 'import'} disabled={!!busy} />
      </Card>
    </Screen>
  );
}
