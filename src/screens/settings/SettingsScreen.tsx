import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, Switch, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Field, Screen, SectionTitle, tw } from '../../components/ui';
import { saveSettings, type Settings } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { settings, reload } = useSettings();
  const [form, setForm] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const set = (k: keyof Settings) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const pickLogo = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, maxWidth: 400, maxHeight: 400, quality: 0.8 });
    const asset = res.assets?.[0];
    if (res.errorMessage) {
      Alert.alert('Error', res.errorMessage);
    } else if (asset?.base64) {
      setForm(f => ({ ...f, shop_logo: `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}` }));
    }
  };

  const save = async () => {
    if (!form.shop_name.trim()) {
      return Alert.alert('Required', 'Enter shop name');
    }
    setSaving(true);
    try {
      await saveSettings(form);
      await reload();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <SectionTitle>Shop</SectionTitle>
      <Card style={tw`items-center`}>
        <Pressable onPress={pickLogo}>
          {form.shop_logo ? (
            <Image source={{ uri: form.shop_logo }} style={tw`h-24 w-24 rounded-2xl`} resizeMode="contain" />
          ) : (
            <View style={tw`h-24 w-24 rounded-2xl bg-slate-100 items-center justify-center border border-dashed border-slate-300`}>
              <Text style={tw`text-slate-400 text-center text-xs`}>Tap to add{'\n'}logo</Text>
            </View>
          )}
        </Pressable>
        <View style={tw`flex-row mt-3`}>
          <Button small variant="secondary" title={form.shop_logo ? 'Change logo' : 'Choose logo'} onPress={pickLogo} />
          {form.shop_logo ? <Button small variant="outline" title="Remove" style={tw`ml-2`} onPress={() => setForm(f => ({ ...f, shop_logo: '' }))} /> : null}
        </View>
      </Card>
      <Field label="Shop name *" value={form.shop_name} onChangeText={set('shop_name')} />
      <Field label="Address" value={form.shop_address} onChangeText={set('shop_address')} multiline />
      <Field label="WhatsApp number" value={form.shop_whatsapp} onChangeText={set('shop_whatsapp')} keyboardType="phone-pad" />
      <Field label="Phone number" value={form.shop_phone} onChangeText={set('shop_phone')} keyboardType="phone-pad" />

      <SectionTitle>Preferences</SectionTitle>
      <View style={tw`flex-row`}>
        <View style={tw`flex-1 mr-2`}>
          <Field label="Currency" value={form.currency} onChangeText={set('currency')} />
        </View>
        <View style={tw`flex-1`}>
          <Field label="Country code" value={form.country_code} onChangeText={set('country_code')} keyboardType="number-pad" hint="Used for WhatsApp (92 = PK)" />
        </View>
      </View>
      <View style={tw`flex-row`}>
        <View style={tw`flex-1 mr-2`}>
          <Field label="Default margin %" value={form.default_margin} onChangeText={set('default_margin')} keyboardType="decimal-pad" />
        </View>
        <View style={tw`flex-1`}>
          <Field label="Low stock alert (ml)" value={form.low_stock_ml} onChangeText={set('low_stock_ml')} keyboardType="decimal-pad" />
        </View>
      </View>
      <Field label="Receipt footer" value={form.receipt_footer} onChangeText={set('receipt_footer')} multiline />
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-slate-700 flex-1`}>Show profit on shared receipt</Text>
        <Switch value={form.show_profit_on_receipt === '1'} onValueChange={v => setForm(f => ({ ...f, show_profit_on_receipt: v ? '1' : '0' }))} />
      </View>
      <Button title="Save Settings" onPress={save} loading={saving} />
    </Screen>
  );
}
