import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Chip, Field, PickerModal, Row, Screen, Segmented, SelectField, tw } from '../../components/ui';
import { createAdjustment, listItems, type Item } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { ml, toNum } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AdjustmentForm'>;

const REASONS = {
  plus: ['Opening stock', 'Counting correction', 'Returned by customer', 'Free sample received'],
  minus: ['Damaged / Leaked', 'Evaporation', 'Tester / Sample', 'Counting correction', 'Personal use'],
};

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
      return Alert.alert('Required', 'Select an item');
    }
    if (toNum(qty) <= 0) {
      return Alert.alert('Required', 'Enter quantity in ml');
    }
    if (!reason.trim()) {
      return Alert.alert('Required', 'Enter a reason');
    }
    setSaving(true);
    try {
      await createAdjustment(item.id, signed, reason);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <SelectField label="Item *" value={item?.name} placeholder="Select item" onPress={() => setPicker(true)} />
      <Segmented
        value={type}
        onChange={v => {
          setType(v);
          setReason('');
        }}
        options={[
          { label: '+ Add stock', value: 'plus', activeStyle: 'bg-emerald-600' },
          { label: '− Remove stock', value: 'minus', activeStyle: 'bg-rose-600' },
        ]}
      />
      <Field label="Quantity (ml) *" value={qty} onChangeText={setQty} keyboardType="decimal-pad" placeholder="e.g. 50" />
      <Text style={tw`text-xs font-semibold text-slate-600 mb-1`}>Reason *</Text>
      <View style={tw`flex-row flex-wrap`}>
        {REASONS[type].map(r => (
          <Chip key={r} label={r} active={reason === r} onPress={() => setReason(r)} />
        ))}
      </View>
      <Field value={reason} onChangeText={setReason} placeholder="Or type a reason" multiline />

      {item ? (
        <Card>
          <Row label="Current stock" value={ml(item.stock_ml)} />
          <Row label="Change" value={`${signed >= 0 ? '+' : ''}${ml(signed)}`} color={signed >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
          <Row label="New stock" value={ml(item.stock_ml + signed)} bold />
        </Card>
      ) : null}
      <Button title="Save Adjustment" onPress={save} loading={saving} variant={type === 'plus' ? 'success' : 'danger'} />

      <PickerModal
        visible={picker}
        title="Select item"
        data={items}
        onClose={() => setPicker(false)}
        onSelect={i => {
          setItem(i);
          setPicker(false);
        }}
        getKey={i => i.id}
        getLabel={i => i.name}
        getSubtitle={i => `Stock ${ml(i.stock_ml)} · ${fmt(i.price_per_liter)}/L`}
      />
    </Screen>
  );
}
