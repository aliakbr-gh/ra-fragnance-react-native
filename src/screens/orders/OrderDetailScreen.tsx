import React, { useLayoutEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, HeaderButton, Row, Screen, SectionTitle, tw } from '../../components/ui';
import Receipt, { type ViewRef } from '../../components/Receipt';
import { deleteOrder, getOrder } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { captureReceipt, createReceiptPdf, shareImageToWhatsApp, sharePdf } from '../../services/share';
import { ml, orderNo } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { settings, fmt } = useSettings();
  const { data } = useFocusLoad(() => getOrder(id), null, [id]);
  const receiptRef = useRef<ViewRef>(null);
  const [busy, setBusy] = useState<'wa' | 'pdf' | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Order ${orderNo(id)}`,
      headerRight: () => (
        <HeaderButton
          title="Delete"
          color="text-rose-600"
          onPress={() =>
            Alert.alert('Delete order?', 'Items will be returned to stock.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await deleteOrder(id);
                  navigation.goBack();
                },
              },
            ])
          }
        />
      ),
    });
  }, [navigation, id]);

  if (!data) {
    return <Screen />;
  }
  const { order, lines } = data;

  const onWhatsApp = async () => {
    setBusy('wa');
    try {
      const uri = await captureReceipt(receiptRef);
      const message = `${settings.shop_name}\nOrder ${orderNo(order.id)} · Total ${fmt(order.total)}`;
      await shareImageToWhatsApp(uri, order.whatsapp, settings.country_code, message);
    } catch (e: any) {
      Alert.alert('Could not share', e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  const onPdf = async () => {
    setBusy('pdf');
    try {
      const path = await createReceiptPdf(settings, order, lines);
      await sharePdf(path, order);
    } catch (e: any) {
      Alert.alert('Could not create PDF', e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen scroll>
      <View style={tw`flex-row mb-4`}>
        <Button title="WhatsApp Image" variant="whatsapp" style={tw`flex-1 mr-2`} onPress={onWhatsApp} loading={busy === 'wa'} disabled={!!busy} />
        <Button title="Share PDF" style={tw`flex-1`} onPress={onPdf} loading={busy === 'pdf'} disabled={!!busy} />
      </View>

      <Receipt ref={receiptRef} settings={settings} order={order} lines={lines} />

      <SectionTitle>Profit breakdown (internal)</SectionTitle>
      <Card>
        {lines.map(l => (
          <View key={l.id} style={tw`py-1.5 border-b border-slate-100`}>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`font-semibold text-slate-900 flex-1`}>
                {l.item_name} · {ml(l.ml)}
              </Text>
              <Text style={tw`font-bold text-emerald-600`}>+ {fmt(l.margin_amount)}</Text>
            </View>
            <Text style={tw`text-xs text-slate-500`}>
              Base {fmt(l.base_amount)} ({fmt(l.price_per_liter)}/L) + {l.margin_percent}% margin = {fmt(l.amount)}
            </Text>
          </View>
        ))}
        <View style={tw`mt-2`}>
          <Row label="Total margin" value={fmt(lines.reduce((s, l) => s + l.margin_amount, 0))} />
          <Row label="Discount" value={`− ${fmt(order.discount)}`} color="text-rose-600" />
          <Row label="Net profit" value={fmt(order.profit)} bold color={order.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
        </View>
      </Card>
      {order.notes ? (
        <Card>
          <Text style={tw`text-xs font-semibold text-slate-500 mb-1`}>NOTES</Text>
          <Text style={tw`text-slate-800`}>{order.notes}</Text>
        </Card>
      ) : null}
      {order.customer_id ? (
        <Button title="View customer" variant="outline" onPress={() => navigation.navigate('CustomerDetail', { id: order.customer_id! })} />
      ) : null}
    </Screen>
  );
}
