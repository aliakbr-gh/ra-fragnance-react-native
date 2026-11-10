import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BiText, Button, Card, Chip, Field, PickerModal, Row, Screen, Segmented, SelectField, showAlert, tw } from '../../components/ui';
import { createAdjustment, listItems, type Item } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { both, T } from '../../i18n/labels';
import { ml, toNum } from '../../utils/format';
import { hp } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'AdjustmentForm'>;

export default function AdjustmentFormScreen({ navigation, route }: Props) {
  const { fmt } = useSettings();
  const [items, setItems] = useState<Item[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [type, setType] = useState<'plus' | 'minus'>('plus');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listItems().then(list => {
      setItems(list);
      const preset = route.params?.itemId;
      if (preset) {
        setItem(list.find(i => i.id === preset) ?? null);
      }
    });
  }, [route.params?.itemId]);

  const signed = (type === 'plus' ? 1 : -1) * toNum(qty);

  const save = async () => {
    if (!item) {
      return showAlert(T.required, T.selectAnItem);
    }
    if (toNum(qty) <= 0) {
      return showAlert(T.required, T.enterQtyMl);
    }
    if (!reason.trim()) {
      return showAlert(T.required, T.enterReason);
    }
    setSaving(true);
    try {
      await createAdjustment(item.id, signed, reason);
      navigation.goBack();
    } catch (e: any) {
      showAlert(T.error, e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <SelectField label={T.itemRequired} value={item?.name} placeholder={T.selectItem} onPress={() => setPicker(true)} />
      <Segmented
        value={type}
        onChange={v => {
          setType(v);
          setReason('');
        }}
        options={[
          { label: T.addStock, value: 'plus' },
          { label: T.removeStock, value: 'minus', activeStyle: 'bg-red-600' },
        ]}
      />
      <Field label={T.quantityMlRequired} value={qty} onChangeText={setQty} keyboardType="decimal-pad" placeholder="e.g. 50" />
      <View style={tw`flex-row justify-between mb-1`}>
        <BiText label={T.reasonRequired} inline style={tw`text-xs font-semibold text-black`} />
      </View>
      <View style={tw`flex-row flex-wrap`}>
        {T.reasons[type].map(r => (
          <Chip key={r.en} label={r} active={reason === r.en} onPress={() => setReason(r.en)} />
        ))}
      </View>
      <Field value={reason} onChangeText={setReason} placeholder={T.typeReason} multiline />

      {item ? (
        <Card style={{ marginTop: hp(0.5) }}>
          <Row label={T.currentStock} value={ml(item.stock_ml)} />
          <Row label={T.change} value={`${signed >= 0 ? '+' : ''}${ml(signed)}`} color={signed >= 0 ? 'text-black' : 'text-red-600'} />
          <Row label={T.newStock} value={ml(item.stock_ml + signed)} bold />
        </Card>
      ) : null}
      <Button title={T.saveAdjustment} onPress={save} loading={saving} variant={type === 'plus' ? 'primary' : 'danger'} />

      <PickerModal
        visible={picker}
        title={T.selectItem}
        data={items}
        onClose={() => setPicker(false)}
        onSelect={i => {
          setItem(i);
          setPicker(false);
        }}
        getKey={i => i.id}
        getLabel={i => i.name}
        getSubtitle={i => `${both(T.stock, ' ')} ${ml(i.stock_ml)} · ${fmt(i.price_per_liter)}/L`}
      />
    </Screen>
  );
}
