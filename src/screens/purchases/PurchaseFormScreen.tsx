import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Field, PickerModal, Row, Screen, SectionTitle, SelectField, tw } from '../../components/ui';
import { createPurchase, listItems, listVendors, type Item, type Vendor } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { ml, round2, todayISO, toNum } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'PurchaseForm'>;

type Line = { key: string; item: Item; ml: string; rate: string };

export default function PurchaseFormScreen({ navigation }: Props) {
  const { fmt } = useSettings();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [updatePrices, setUpdatePrices] = useState(false);
  const [picker, setPicker] = useState<'vendor' | 'item' | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listVendors().then(setVendors);
      listItems().then(setItems);
    }, []),
  );

  const addLine = (item: Item) => {
    setPicker(null);
    setLines(ls => [...ls, { key: `${item.id}-${Date.now()}`, item, ml: '', rate: String(item.price_per_liter) }]);
  };
  const updateLine = (key: string, patch: Partial<Line>) => setLines(ls => ls.map(l => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key: string) => setLines(ls => ls.filter(l => l.key !== key));

  const amountOf = (l: Line) => round2((toNum(l.rate) * toNum(l.ml)) / 1000);
  const total = lines.reduce((s, l) => s + amountOf(l), 0);
  const totalMl = lines.reduce((s, l) => s + toNum(l.ml), 0);

  const save = async () => {
    if (!lines.length) {
      return Alert.alert('No items', 'Add at least one item');
    }
    if (lines.some(l => toNum(l.ml) <= 0)) {
      return Alert.alert('Quantity missing', 'Enter ml for every item');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Alert.alert('Invalid date', 'Use format YYYY-MM-DD');
    }
    setSaving(true);
    try {
      const id = await createPurchase({
        vendor_id: vendor?.id ?? null,
        vendor_name: vendor?.name ?? null,
        date,
        notes,
        updateItemPrices: updatePrices,
        lines: lines.map(l => ({
          item_id: l.item.id,
          item_name: l.item.name,
          ml: toNum(l.ml),
          price_per_liter: toNum(l.rate),
          amount: amountOf(l),
        })),
      });
      navigation.replace('PurchaseDetail', { id });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <SelectField label="Vendor" value={vendor?.name} placeholder="Select vendor" onPress={() => setPicker('vendor')} />
      {vendors.length === 0 ? (
        <Pressable onPress={() => navigation.navigate('VendorForm')} style={tw`-mt-2 mb-3`}>
          <Text style={tw`text-violet-700 font-semibold`}>+ Add a vendor first</Text>
        </Pressable>
      ) : null}
      <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />

      <SectionTitle right={<Button small variant="secondary" title="+ Add item" onPress={() => setPicker('item')} />}>
        Items
      </SectionTitle>
      {lines.length === 0 ? <Text style={tw`text-slate-400 mb-3`}>No items added</Text> : null}
      {lines.map(l => (
        <Card key={l.key} style={tw`p-3`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold text-slate-900`}>{l.item.name}</Text>
              <Text style={tw`text-xs text-slate-500`}>Current stock: {ml(l.item.stock_ml)}</Text>
            </View>
            <Pressable onPress={() => removeLine(l.key)} hitSlop={10}>
              <Text style={tw`text-rose-600 font-bold`}>Remove</Text>
            </Pressable>
          </View>
          <View style={tw`flex-row`}>
            <View style={tw`flex-1 mr-2`}>
              <Field label="Quantity (ml)" value={l.ml} onChangeText={v => updateLine(l.key, { ml: v })} keyboardType="decimal-pad" placeholder="e.g. 1000" />
            </View>
            <View style={tw`flex-1`}>
              <Field label="Rate / 1000ml" value={l.rate} onChangeText={v => updateLine(l.key, { rate: v })} keyboardType="decimal-pad" />
            </View>
          </View>
          <Row label="Amount" value={fmt(amountOf(l))} bold />
        </Card>
      ))}

      {lines.length ? (
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <Text style={tw`text-slate-700 flex-1`}>Update item price to these rates</Text>
          <Switch value={updatePrices} onValueChange={setUpdatePrices} />
        </View>
      ) : null}

      <Field label="Notes" value={notes} onChangeText={setNotes} multiline />

      <Card>
        <Row label="Total quantity" value={ml(totalMl)} />
        <Row label="Total amount" value={fmt(total)} bold />
      </Card>
      <Button title="Save Purchase" onPress={save} loading={saving} />

      <PickerModal
        visible={picker === 'vendor'}
        title="Select vendor"
        data={vendors}
        onClose={() => setPicker(null)}
        onSelect={v => {
          setVendor(v);
          setPicker(null);
        }}
        getKey={v => v.id}
        getLabel={v => v.name}
        getSubtitle={v => [v.whatsapp, v.address].filter(Boolean).join(' · ')}
      />
      <PickerModal
        visible={picker === 'item'}
        title="Select item"
        data={items}
        onClose={() => setPicker(null)}
        onSelect={addLine}
        getKey={i => i.id}
        getLabel={i => i.name}
        getSubtitle={i => `${fmt(i.price_per_liter)}/L · Stock ${ml(i.stock_ml)}`}
      />
    </Screen>
  );
}
