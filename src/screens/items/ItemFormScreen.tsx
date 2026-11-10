import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BiText,
  Button,
  Card,
  confirmDestructive,
  DeleteButton,
  Field,
  Screen,
  SectionTitle,
  showAlert,
  tw,
  UrText,
} from '../../components/ui';
import { deleteItem, getItem, itemMovements, saveItem, type Item, type StockMovement } from '../../db/repo';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { both, T } from '../../i18n/labels';
import { formatDate, ml, round2, toNum } from '../../utils/format';
import { hp } from '../../utils/responsive';

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

  const onDelete = (itemId: number) =>
    confirmDestructive({
      title: T.deleteItemQ,
      message: T.deleteItemMsg,
      onConfirm: async () => {
        await deleteItem(itemId);
        navigation.goBack();
      },
    });

  const save = async () => {
    if (!name.trim()) {
      return showAlert(T.required, T.enterItemName);
    }
    if (toNum(price) <= 0) {
      return showAlert(T.required, T.enterPrice);
    }
    setSaving(true);
    try {
      await saveItem({ id, name, brand, price_per_liter: toNum(price), notes });
      navigation.goBack();
    } catch (e: any) {
      showAlert(T.error, e.message);
    } finally {
      setSaving(false);
    }
  };

  const p = toNum(price);

  return (
    <Screen scroll right={id ? <DeleteButton onPress={() => onDelete(id)} /> : undefined}>
      <Field label={T.itemName} value={name} onChangeText={setName} placeholder="e.g. Oud Wood" />
      <Field label={T.brand} value={brand} onChangeText={setBrand} placeholder={T.optional} />
      <Field
        label={T.pricePerLitre}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="0"
        hint={p > 0 ? `= ${fmt(round2(p / 1000))} / ml · ${fmt(round2(p / 1000) * 50)} / 50ml` : undefined}
      />
      <Field label={T.notes} value={notes} onChangeText={setNotes} multiline placeholder={T.optional} />
      <Button title={id ? T.updateItem : T.saveItem} onPress={save} loading={saving} />

      {item ? (
        <>
          <Card style={[tw`flex-row justify-between items-center`, { marginTop: hp(2) }]}>
            <View>
              <BiText label={T.currentStock} style={tw`text-black font-semibold`} />
            </View>
            <Text style={tw`text-xl font-extrabold ${item.stock_ml <= 0 ? 'text-red-600' : 'text-black'}`}>{ml(item.stock_ml)}</Text>
          </Card>
          <Button title={T.adjustStock} variant="secondary" onPress={() => navigation.navigate('AdjustmentForm', { itemId: item.id })} />
          <SectionTitle>{T.stockHistory}</SectionTitle>
          {movements.length === 0 ? <BiText label={T.noMovements} inline style={tw`text-black`} urStyle={tw`text-black`} /> : null}
          {movements.map((m, idx) => (
            <View key={`${m.kind}-${m.ref_id}-${idx}`} style={[tw`flex-row justify-between border-b border-neutral-200`, { paddingVertical: hp(1) }]}>
              <View style={tw`flex-1 mr-2`}>
                <UrText style={tw`font-semibold text-black`}>
                  {both(T.kind[m.kind] ?? m.kind, ' · ')} {m.kind !== 'adjustment' ? `#${m.ref_id}` : ''}
                </UrText>
                <Text style={tw`text-xs text-black`}>
                  {m.note ? `${m.note} · ` : ''}
                  {formatDate(m.created_at)}
                </Text>
              </View>
              <Text style={tw`font-bold ${m.ml >= 0 ? 'text-black' : 'text-red-600'}`}>
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
