import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Chip, Field, PickerModal, Row, Screen, SectionTitle, tw } from '../../components/ui';
import { createOrder, getCustomer, listCustomers, listItems, type Customer, type Item } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { ml, round2, toNum } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderForm'>;

type Line = { key: string; item: Item; ml: string; margin: string };

const QUICK_ML = [3, 6, 10, 30, 50, 100];

function calc(l: Line) {
  const qty = toNum(l.ml);
  const base = round2((l.item.price_per_liter * qty) / 1000);
  const marginPercent = toNum(l.margin);
  const marginAmount = round2((base * marginPercent) / 100);
  return { qty, base, marginPercent, marginAmount, amount: round2(base + marginAmount) };
}

export default function OrderFormScreen({ navigation, route }: Props) {
  const { settings, fmt } = useSettings();
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [picker, setPicker] = useState<'item' | 'customer' | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listItems().then(setItems);
      listCustomers().then(setCustomers);
    }, []),
  );

  const pickCustomer = (c: Customer) => {
    setPicker(null);
    setCustomerId(c.id);
    setName(c.name);
    setWhatsapp(c.whatsapp ?? '');
    setAddress(c.address ?? '');
  };

  useEffect(() => {
    const id = route.params?.customerId;
    if (id) {
      getCustomer(id).then(c => c && pickCustomer(c));
    }
  }, [route.params?.customerId]);

  const addLine = (item: Item) => {
    setPicker(null);
    setLines(ls => [...ls, { key: `${item.id}-${Date.now()}`, item, ml: '', margin: settings.default_margin || '0' }]);
  };
  const updateLine = (key: string, patch: Partial<Line>) => setLines(ls => ls.map(l => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key: string) => setLines(ls => ls.filter(l => l.key !== key));

  const calcs = lines.map(calc);
  const subtotal = round2(calcs.reduce((s, c) => s + c.amount, 0));
  const marginTotal = round2(calcs.reduce((s, c) => s + c.marginAmount, 0));
  const disc = toNum(discount);
  const total = round2(subtotal - disc);
  const profit = round2(marginTotal - disc);

  const submit = async () => {
    setSaving(true);
    try {
      const id = await createOrder({
        customer_id: customerId,
        customer_name: name,
        whatsapp,
        address,
        discount: disc,
        notes,
        countryCode: settings.country_code,
        lines: lines.map((l, i) => ({
          item_id: l.item.id,
          item_name: l.item.name,
          ml: calcs[i].qty,
          price_per_liter: l.item.price_per_liter,
          base_amount: calcs[i].base,
          margin_percent: calcs[i].marginPercent,
          margin_amount: calcs[i].marginAmount,
          amount: calcs[i].amount,
        })),
      });
      navigation.replace('OrderDetail', { id });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    if (!name.trim()) {
      return Alert.alert('Required', 'Enter customer name');
    }
    if (!lines.length) {
      return Alert.alert('No items', 'Add at least one item');
    }
    if (calcs.some(c => c.qty <= 0)) {
      return Alert.alert('Quantity missing', 'Enter ml for every item');
    }
    if (disc > subtotal) {
      return Alert.alert('Invalid discount', 'Discount cannot be more than subtotal');
    }
    const needed = new Map<number, number>();
    lines.forEach((l, i) => needed.set(l.item.id, (needed.get(l.item.id) ?? 0) + calcs[i].qty));
    const short = lines.filter((l, i, arr) => arr.findIndex(x => x.item.id === l.item.id) === i && (needed.get(l.item.id) ?? 0) > l.item.stock_ml);
    if (short.length) {
      return Alert.alert(
        'Low stock',
        `${short.map(l => `${l.item.name}: have ${ml(l.item.stock_ml)}`).join('\n')}\n\nPlace order anyway? Stock will go negative.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Place order', onPress: submit },
        ],
      );
    }
    submit();
  };

  return (
    <Screen scroll>
      <SectionTitle right={customers.length ? <Button small variant="secondary" title="Pick existing" onPress={() => setPicker('customer')} /> : null}>
        Customer
      </SectionTitle>
      <Field
        label="Customer name *"
        value={name}
        onChangeText={v => {
          setName(v);
          setCustomerId(null);
        }}
      />
      <Field label="WhatsApp number" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="03xx xxxxxxx" />
      <Field label="Address" value={address} onChangeText={setAddress} multiline />

      <SectionTitle right={<Button small variant="secondary" title="+ Add item" onPress={() => setPicker('item')} />}>Items</SectionTitle>
      {lines.length === 0 ? <Text style={tw`text-slate-400 mb-3`}>No items added</Text> : null}
      {lines.map((l, i) => {
        const c = calcs[i];
        return (
          <Card key={l.key} style={tw`p-3`}>
            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-1`}>
                <Text style={tw`font-bold text-slate-900`}>{l.item.name}</Text>
                <Text style={tw`text-xs text-slate-500`}>
                  {fmt(l.item.price_per_liter)}/1000ml · Stock {ml(l.item.stock_ml)}
                </Text>
              </View>
              <Pressable onPress={() => removeLine(l.key)} hitSlop={10}>
                <Text style={tw`text-rose-600 font-bold`}>Remove</Text>
              </Pressable>
            </View>
            <View style={tw`flex-row flex-wrap mt-2`}>
              {QUICK_ML.map(q => (
                <Chip key={q} label={`${q}ml`} active={toNum(l.ml) === q} onPress={() => updateLine(l.key, { ml: String(q) })} />
              ))}
            </View>
            <View style={tw`flex-row`}>
              <View style={tw`flex-1 mr-2`}>
                <Field label="Quantity (ml)" value={l.ml} onChangeText={v => updateLine(l.key, { ml: v })} keyboardType="decimal-pad" placeholder="ml" />
              </View>
              <View style={tw`flex-1`}>
                <Field label="Margin %" value={l.margin} onChangeText={v => updateLine(l.key, { margin: v })} keyboardType="decimal-pad" placeholder="0" />
              </View>
            </View>
            <Row label="Price (auto)" value={fmt(c.base)} />
            <Row label={`Margin (${c.marginPercent}%)`} value={`+ ${fmt(c.marginAmount)}`} color="text-emerald-600" />
            <Row label="Line total" value={fmt(c.amount)} bold />
          </Card>
        );
      })}

      <Field label={`Discount (${settings.currency})`} value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" placeholder="0" />
      <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />

      <Card>
        <Row label="Subtotal" value={fmt(subtotal)} />
        <Row label="Discount" value={`− ${fmt(disc)}`} color="text-rose-600" />
        <Row label="Total" value={fmt(total)} bold />
        <View style={tw`border-t border-slate-100 mt-2 pt-2`}>
          <Row label="Total margin" value={fmt(marginTotal)} />
          <Row label="Profit (after discount)" value={fmt(profit)} bold color={profit >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
        </View>
      </Card>
      <Button title="Place Order" onPress={save} loading={saving} />

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
      <PickerModal
        visible={picker === 'customer'}
        title="Select customer"
        data={customers}
        onClose={() => setPicker(null)}
        onSelect={pickCustomer}
        getKey={c => c.id}
        getLabel={c => c.name}
        getSubtitle={c => [c.whatsapp, c.address].filter(Boolean).join(' · ')}
      />
    </Screen>
  );
}
