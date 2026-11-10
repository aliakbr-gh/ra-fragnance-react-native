import React, { useState } from 'react';
import { View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BiText, Button, Card, confirmDestructive, Screen, SectionTitle, showAlert, tw } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { T } from '../../i18n/labels';
import { downloadBackup, importBackup, shareBackup } from '../../services/backup';
import { hp } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Backup'>;

export default function BackupScreen({ navigation }: Props) {
  const { reload } = useSettings();
  const [busy, setBusy] = useState<'download' | 'share' | 'import' | null>(null);

  const wrap = (kind: typeof busy, fn: () => Promise<void>) => async () => {
    setBusy(kind);
    try {
      await fn();
    } catch (e: any) {
      showAlert(T.error, e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  const onDownload = wrap('download', async () => {
    const name = await downloadBackup();
    if (name) {
      showAlert(T.backupSaved, T.savedAs(name));
    }
  });

  const onShare = wrap('share', shareBackup);

  const onImport = () =>
    confirmDestructive({
      title: T.restoreQ,
      message: T.restoreMsg,
      confirmText: T.chooseFile,
      onConfirm: wrap('import', async () => {
        const done = await importBackup();
        if (done) {
          await reload();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Tabs' }] }));
          showAlert(T.restored, T.restoredMsg);
        }
      }),
    });

  return (
    <Screen scroll>
      <SectionTitle>{T.download}</SectionTitle>
      <Card>
        <View style={{ marginBottom: hp(1.5) }}>
          <BiText label={T.downloadDesc} style={tw`text-black`} urStyle={tw`text-sm mt-1`} />
        </View>
        <Button title={T.downloadBackup} onPress={onDownload} loading={busy === 'download'} disabled={!!busy} />
        <Button title={T.shareBackup} variant="outline" style={{ marginTop: hp(1) }} onPress={onShare} loading={busy === 'share'} disabled={!!busy} />
      </Card>

      <SectionTitle>{T.restore}</SectionTitle>
      <Card>
        <View style={{ marginBottom: hp(1.5) }}>
          <BiText label={T.restoreDesc} style={tw`text-black`} urStyle={tw`text-sm mt-1`} />
        </View>
        <Button title={T.importBackup} variant="danger" onPress={onImport} loading={busy === 'import'} disabled={!!busy} />
      </Card>
    </Screen>
  );
}
