import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, confirmDestructive, DeleteButton, Row, Screen, SectionTitle, showAlert, tw, UrText } from '../../components/ui';
import Receipt, { type ViewRef } from '../../components/Receipt';
import { deleteOrder, getOrder } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { captureReceipt, createReceiptPdf, shareImageToWhatsApp, sharePdf } from '../../services/share';
import { both, T } from '../../i18n/labels';
import { ml, orderNo } from '../../utils/format';
import { hp } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { settings, fmt } = useSettings();
  const { data } = useFocusLoad(() => getOrder(id), null, [id]);
  const receiptRef = useRef<ViewRef>(null);
  const [busy, setBusy] = useState<'wa' | 'pdf' | null>(null);

  const onDelete = () =>
    confirmDestructive({
      title: T.deleteOrderQ,
      message: T.deleteOrderMsg,
      onConfirm: async () => {
        await deleteOrder(id);
        navigation.goBack();
      },
    });

  if (!data) {
    return <Screen />;
  }
  const { order, lines } = data;

  const onWhatsApp = async () => {
    setBusy('wa');
    try {
      const uri = await captureReceipt(receiptRef);
      const message = `${settings.shop_name}\n${both(T.order, ' ')} ${orderNo(order.id)} · ${both(T.total, ' ')} ${fmt(order.total)}`;
      await shareImageToWhatsApp(uri, order.whatsapp, settings.country_code, message);
    } catch (e: any) {
      showAlert(T.couldNotShare, e?.message ?? String(e));
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
      showAlert(T.couldNotPdf, e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen scroll right={<DeleteButton onPress={onDelete} />}>
      <View style={[tw`flex-row`, { marginBottom: hp(2) }]}>
        <Button title={T.whatsappImage} variant="whatsapp" style={tw`flex-1 mr-2`} onPress={onWhatsApp} loading={busy === 'wa'} disabled={!!busy} />
        <Button title={T.sharePdf} style={tw`flex-1`} onPress={onPdf} loading={busy === 'pdf'} disabled={!!busy} />
      </View>

      <Receipt ref={receiptRef} settings={settings} order={order} lines={lines} />

      <SectionTitle>{T.profitBreakdown}</SectionTitle>
      <Card>
        {lines.map(l => (
          <View key={l.id} style={[tw`border-b border-neutral-200`, { paddingVertical: hp(0.8) }]}>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`font-semibold text-black flex-1`}>
                {l.item_name} · {ml(l.ml)}
              </Text>
              <Text style={tw`font-bold text-black`}>+ {fmt(l.margin_amount)}</Text>
            </View>
            <UrText style={tw`text-xs text-black`}>
              {both(T.base, ' ')} {fmt(l.base_amount)} ({fmt(l.price_per_liter)}/L) + {l.margin_percent}% {both(T.margin, ' ')} = {fmt(l.amount)}
            </UrText>
          </View>
        ))}
        <View style={{ marginTop: hp(1) }}>
          <Row label={T.totalMargin} value={fmt(lines.reduce((s, l) => s + l.margin_amount, 0))} />
          <Row label={T.discount} value={`− ${fmt(order.discount)}`} color="text-red-600" />
          <Row label={T.netProfit} value={fmt(order.profit)} bold color={order.profit >= 0 ? 'text-black' : 'text-red-600'} />
        </View>
      </Card>
      {order.notes ? (
        <Card>
          <UrText style={tw`text-xs font-semibold text-black mb-1`}>{both(T.notes, ' · ').toUpperCase()}</UrText>
          <Text style={tw`text-black`}>{order.notes}</Text>
        </Card>
      ) : null}
      {order.customer_id ? (
        <Button title={T.viewCustomer} variant="outline" onPress={() => navigation.navigate('CustomerDetail', { id: order.customer_id! })} />
      ) : null}
    </Screen>
  );
}
