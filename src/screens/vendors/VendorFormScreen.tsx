import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, confirmDestructive, DeleteButton, Field, Screen, showAlert } from '../../components/ui';
import { deleteVendor, getVendor, saveVendor } from '../../db/repo';
import type { RootStackParamList } from '../../navigation/types';
import { T } from '../../i18n/labels';

type Props = NativeStackScreenProps<RootStackParamList, 'VendorForm'>;

const EMPTY = { name: '', address: '', whatsapp: '', phone: '', email: '', notes: '' };

export default function VendorFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof EMPTY) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (id) {
      getVendor(id).then(v => {
        if (v) {
          setForm({
            name: v.name,
            address: v.address ?? '',
            whatsapp: v.whatsapp ?? '',
            phone: v.phone ?? '',
            email: v.email ?? '',
            notes: v.notes ?? '',
          });
        }
      });
    }
  }, [id]);

  const onDelete = (vendorId: number) =>
    confirmDestructive({
      title: T.deleteVendorQ,
      message: T.deleteVendorMsg,
      onConfirm: async () => {
        await deleteVendor(vendorId);
        navigation.goBack();
      },
    });

  const save = async () => {
    if (!form.name.trim()) {
      return showAlert(T.required, T.enterVendorName);
    }
    setSaving(true);
    try {
      await saveVendor({ id, ...form });
      navigation.goBack();
    } catch (e: any) {
      showAlert(T.error, e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll right={id ? <DeleteButton onPress={() => onDelete(id)} /> : undefined}>
      <Field label={T.vendorName} value={form.name} onChangeText={set('name')} />
      <Field label={T.whatsappNumber} value={form.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" placeholder="03xx xxxxxxx" />
      <Field label={T.phoneNumber} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <Field label={T.email} value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
      <Field label={T.address} value={form.address} onChangeText={set('address')} multiline />
      <Field label={T.notes} value={form.notes} onChangeText={set('notes')} multiline />
      <Button title={id ? T.updateVendor : T.saveVendor} onPress={save} loading={saving} />
    </Screen>
  );
}
