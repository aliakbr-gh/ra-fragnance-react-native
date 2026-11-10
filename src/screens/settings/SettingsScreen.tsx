import React, { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BiText, Button, Card, Field, Screen, SectionTitle, showAlert, ThemedSwitch, tw } from '../../components/ui';
import { saveSettings, type Settings } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { T } from '../../i18n/labels';
import { hp, wp } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { settings, reload } = useSettings();
  const [form, setForm] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const logo = wp(24);

  useEffect(() => setForm(settings), [settings]);

  const set = (k: keyof Settings) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const pickLogo = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, maxWidth: 400, maxHeight: 400, quality: 0.8 });
    const asset = res.assets?.[0];
    if (res.errorMessage) {
      showAlert(T.error, res.errorMessage);
    } else if (asset?.base64) {
      setForm(f => ({ ...f, shop_logo: `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}` }));
    }
  };

  const save = async () => {
    if (!form.shop_name.trim()) {
      return showAlert(T.required, T.enterShopName);
    }
    setSaving(true);
    try {
      await saveSettings(form);
      await reload();
      navigation.goBack();
    } catch (e: any) {
      showAlert(T.error, e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <SectionTitle>{T.shop}</SectionTitle>
      <Card style={tw`items-center`}>
        <Pressable onPress={pickLogo}>
          {form.shop_logo ? (
            <Image source={{ uri: form.shop_logo }} style={[tw`rounded-2xl`, { height: logo, width: logo }]} resizeMode="contain" />
          ) : (
            <View
              style={[tw`rounded-2xl bg-neutral-100 items-center justify-center border border-dashed border-neutral-400`, { height: logo, width: logo, padding: wp(2) }]}>
              <BiText label={T.tapToAddLogo} style={tw`text-black text-center text-xs`} />
            </View>
          )}
        </Pressable>
        <View style={[tw`flex-row`, { marginTop: hp(1.5) }]}>
          <Button small variant="secondary" title={form.shop_logo ? T.changeLogo : T.chooseLogo} onPress={pickLogo} />
          {form.shop_logo ? <Button small variant="danger" title={T.remove} style={tw`ml-2`} onPress={() => setForm(f => ({ ...f, shop_logo: '' }))} /> : null}
        </View>
      </Card>
      <Field label={T.shopName} value={form.shop_name} onChangeText={set('shop_name')} />
      <Field label={T.address} value={form.shop_address} onChangeText={set('shop_address')} multiline />
      <Field label={T.whatsappNumber} value={form.shop_whatsapp} onChangeText={set('shop_whatsapp')} keyboardType="phone-pad" />
      <Field label={T.phoneNumber} value={form.shop_phone} onChangeText={set('shop_phone')} keyboardType="phone-pad" />

      <SectionTitle>{T.preferences}</SectionTitle>
      <View style={tw`flex-row`}>
        <View style={tw`flex-1 mr-2`}>
          <Field label={T.currency} value={form.currency} onChangeText={set('currency')} />
        </View>
        <View style={tw`flex-1`}>
          <Field label={T.countryCode} value={form.country_code} onChangeText={set('country_code')} keyboardType="number-pad" hint={T.countryCodeHint} />
        </View>
      </View>
      <View style={tw`flex-row`}>
        <View style={tw`flex-1 mr-2`}>
          <Field label={T.defaultMargin} value={form.default_margin} onChangeText={set('default_margin')} keyboardType="decimal-pad" />
        </View>
        <View style={tw`flex-1`}>
          <Field label={T.lowStockAlert} value={form.low_stock_ml} onChangeText={set('low_stock_ml')} keyboardType="decimal-pad" />
        </View>
      </View>
      <Field label={T.receiptFooter} value={form.receipt_footer} onChangeText={set('receipt_footer')} multiline />
      <View style={[tw`flex-row items-center justify-between`, { marginBottom: hp(2) }]}>
        <View style={tw`flex-1 mr-2`}>
          <BiText label={T.showProfitOnReceipt} style={tw`text-black`} />
        </View>
        <ThemedSwitch value={form.show_profit_on_receipt === '1'} onValueChange={v => setForm(f => ({ ...f, show_profit_on_receipt: v ? '1' : '0' }))} />
      </View>
      <Button title={T.saveSettings} onPress={save} loading={saving} />
    </Screen>
  );
}
