import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BiText, Button, Card, Chip, Field, PickerModal, RemoveButton, Row, Screen, SectionTitle, showAlert, tw, UrText } from '../../components/ui';
import { createOrder, getCustomer, listCustomers, listItems, type Customer, type Item } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { both, T, withSuffix } from '../../i18n/labels';
import { ml, round2, toNum } from '../../utils/format';
import { hp, wp } from '../../utils/responsive';

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
      showAlert(T.error, e.message);
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    if (!name.trim()) {
      return showAlert(T.required, T.enterCustomerName);
    }
    if (!lines.length) {
      return showAlert(T.noItemsTitle, T.addAtLeastOne);
    }
    if (calcs.some(c => c.qty <= 0)) {
      return showAlert(T.quantityMissing, T.enterMlForEvery);
    }
    if (disc > subtotal) {
      return showAlert(T.invalidDiscount, T.discountTooHigh);
    }
    const needed = new Map<number, number>();
    lines.forEach((l, i) => needed.set(l.item.id, (needed.get(l.item.id) ?? 0) + calcs[i].qty));
    const short = lines.filter((l, i, arr) => arr.findIndex(x => x.item.id === l.item.id) === i && (needed.get(l.item.id) ?? 0) > l.item.stock_ml);
    if (short.length) {
      const list = short.map(l => `${l.item.name}: ${both(T.have, ' · ')} ${ml(l.item.stock_ml)}`).join('\n');
      return Alert.alert(both(T.lowStock), `${list}\n\n${both(T.stockGoesNegative, '\n')}`, [
        { text: both(T.cancel), style: 'cancel' },
        { text: both(T.placeOrderAnyway), onPress: submit },
      ]);
    }
    submit();
  };

  return (
    <Screen scroll>
      <SectionTitle right={customers.length ? <Button small variant="secondary" title={T.pickExisting} onPress={() => setPicker('customer')} /> : null}>
        {T.customer}
      </SectionTitle>
      <Field
        label={T.customerName}
        value={name}
        onChangeText={v => {
          setName(v);
          setCustomerId(null);
        }}
        returnKeyType="next"
      />
      <Field label={T.whatsappNumber} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="03xx xxxxxxx" />
      <Field label={T.address} value={address} onChangeText={setAddress} multiline />

      <SectionTitle right={<Button small variant="secondary" title={T.addItemLine} onPress={() => setPicker('item')} />}>{T.items}</SectionTitle>
      {lines.length === 0 ? (
        <View style={{ marginBottom: hp(1.5) }}>
          <BiText label={T.noItemsAdded} inline style={tw`text-black`} urStyle={tw`text-black`} />
        </View>
      ) : null}
      {lines.map((l, i) => {
        const c = calcs[i];
        return (
          <Card key={l.key} style={{ padding: wp(3) }}>
            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`font-bold text-black`}>{l.item.name}</Text>
                <UrText style={tw`text-xs text-black`}>
                  {fmt(l.item.price_per_liter)}/1000ml · {both(T.stock, ' ')} {ml(l.item.stock_ml)}
                </UrText>
              </View>
              <RemoveButton onPress={() => removeLine(l.key)} />
            </View>
            <View style={[tw`flex-row flex-wrap`, { marginTop: hp(1) }]}>
              {QUICK_ML.map(q => (
                <Chip key={q} label={`${q}ml`} active={toNum(l.ml) === q} onPress={() => updateLine(l.key, { ml: String(q) })} />
              ))}
            </View>
            <View style={tw`flex-row`}>
              <View style={tw`flex-1 mr-2`}>
                <Field label={T.quantityMl} value={l.ml} onChangeText={v => updateLine(l.key, { ml: v })} keyboardType="decimal-pad" placeholder="ml" />
              </View>
              <View style={tw`flex-1`}>
                <Field label={T.marginPercent} value={l.margin} onChangeText={v => updateLine(l.key, { margin: v })} keyboardType="decimal-pad" placeholder="0" />
              </View>
            </View>
            <Row label={T.priceAuto} value={fmt(c.base)} />
            <Row label={withSuffix(T.margin, ` (${c.marginPercent}%)`)} value={`+ ${fmt(c.marginAmount)}`} />
            <Row label={T.lineTotal} value={fmt(c.amount)} bold />
          </Card>
        );
      })}

      <Field
        label={withSuffix(T.discount, ` (${settings.currency})`)}
        value={discount}
        onChangeText={setDiscount}
        keyboardType="decimal-pad"
        placeholder="0"
      />
      <Field label={T.notes} value={notes} onChangeText={setNotes} multiline placeholder={T.optional} />

      <Card>
        <Row label={T.subtotal} value={fmt(subtotal)} />
        <Row label={T.discount} value={`− ${fmt(disc)}`} color="text-red-600" />
        <Row label={T.total} value={fmt(total)} bold />
        <View style={[tw`border-t border-neutral-200`, { marginTop: hp(1), paddingTop: hp(1) }]}>
          <Row label={T.totalMargin} value={fmt(marginTotal)} />
          <Row label={T.profitAfterDiscount} value={fmt(profit)} bold color={profit >= 0 ? 'text-black' : 'text-red-600'} />
        </View>
      </Card>
      <Button title={T.placeOrder} onPress={save} loading={saving} />

      <PickerModal
        visible={picker === 'item'}
        title={T.selectItem}
        data={items}
        onClose={() => setPicker(null)}
        onSelect={addLine}
        getKey={i => i.id}
        getLabel={i => i.name}
        getSubtitle={i => `${fmt(i.price_per_liter)}/L · ${both(T.stock, ' ')} ${ml(i.stock_ml)}`}
      />
      <PickerModal
        visible={picker === 'customer'}
        title={T.selectCustomer}
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
