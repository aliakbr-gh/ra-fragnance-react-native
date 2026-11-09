import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Field, HeaderButton, Screen, SectionTitle, tw } from '../../components/ui';
import { deleteItem, getItem, itemMovements, saveItem, type Item, type StockMovement } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { formatDate, ml, round2, toNum } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemForm'>;

export default function ItemFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const { fmt } = useSettings();
  const [item, setItem] = useState<Item | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    (async () => {
      const it = await getItem(id);
      if (it) {
        setItem(it);
        setName(it.name);
        setBrand(it.brand ?? '');
        setPrice(String(it.price_per_liter));
        setNotes(it.notes ?? '');
        setMovements(await itemMovements(id));
      }
    })();
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: id ? 'Edit Item' : 'New Item',
      headerRight: id
        ? () => (
            <HeaderButton
              title="Delete"
              color="text-rose-600"
              onPress={() =>
                Alert.alert('Delete item?', 'Past orders and purchases keep their record, but stock adjustments for this item will be removed.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await deleteItem(id);
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
    if (!name.trim()) {
      return Alert.alert('Required', 'Please enter item name');
    }
    if (toNum(price) <= 0) {
      return Alert.alert('Required', 'Please enter price per 1000ml');
    }
    setSaving(true);
    try {
      await saveItem({ id, name, brand, price_per_liter: toNum(price), notes });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const p = toNum(price);

  return (
    <Screen scroll>
      <Field label="Item name *" value={name} onChangeText={setName} placeholder="e.g. Oud Wood" />
      <Field label="Brand / Inspired by" value={brand} onChangeText={setBrand} placeholder="Optional" />
      <Field
        label="Price per 1000ml (1 Litre) *"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="0"
        hint={p > 0 ? `= ${fmt(round2(p / 1000))} per ml · ${fmt(round2(p / 1000) * 50)} per 50ml` : undefined}
      />
      <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
      <Button title={id ? 'Update Item' : 'Save Item'} onPress={save} loading={saving} />

      {item ? (
        <>
          <Card style={tw`mt-4 flex-row justify-between items-center`}>
            <Text style={tw`text-slate-600 font-semibold`}>Current stock</Text>
            <Text style={tw`text-xl font-extrabold ${item.stock_ml <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{ml(item.stock_ml)}</Text>
          </Card>
          <Button title="Adjust stock" variant="secondary" onPress={() => navigation.navigate('AdjustmentForm', { itemId: item.id })} />
          <SectionTitle>Stock history</SectionTitle>
          {movements.length === 0 ? <Text style={tw`text-slate-400`}>No movements yet</Text> : null}
          {movements.map((m, idx) => (
            <View key={`${m.kind}-${m.ref_id}-${idx}`} style={tw`flex-row justify-between py-2 border-b border-slate-100`}>
              <View style={tw`flex-1`}>
                <Text style={tw`font-semibold text-slate-800 capitalize`}>
                  {m.kind} {m.kind !== 'adjustment' ? `#${m.ref_id}` : ''}
                </Text>
                <Text style={tw`text-xs text-slate-500`}>
                  {m.note ? `${m.note} · ` : ''}
                  {formatDate(m.created_at)}
                </Text>
              </View>
              <Text style={tw`font-bold ${m.ml >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m.ml >= 0 ? '+' : ''}
                {ml(m.ml)}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
