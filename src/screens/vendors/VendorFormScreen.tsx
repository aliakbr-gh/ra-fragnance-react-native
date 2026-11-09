import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, HeaderButton, Screen } from '../../components/ui';
import { deleteVendor, getVendor, saveVendor } from '../../db/repo';
import type { RootStackParamList } from '../../navigation/types';

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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: id ? 'Edit Vendor' : 'New Vendor',
      headerRight: id
        ? () => (
            <HeaderButton
              title="Delete"
              color="text-rose-600"
              onPress={() =>
                Alert.alert('Delete vendor?', 'Existing purchases will keep the vendor name.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await deleteVendor(id);
                      navigation.goBack();
                    },
                  },
                ])
              }
            />
          )
        : undefined,
    });
  }, [navigation, id]);

  const save = async () => {
    if (!form.name.trim()) {
      return Alert.alert('Required', 'Please enter vendor name');
    }
    setSaving(true);
    try {
      await saveVendor({ id, ...form });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Field label="Vendor name *" value={form.name} onChangeText={set('name')} />
      <Field label="WhatsApp number" value={form.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" placeholder="03xx xxxxxxx" />
      <Field label="Phone number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <Field label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Address" value={form.address} onChangeText={set('address')} multiline />
      <Field label="Notes" value={form.notes} onChangeText={set('notes')} multiline />
      <Button title={id ? 'Update Vendor' : 'Save Vendor'} onPress={save} loading={saving} />
    </Screen>
  );
}
