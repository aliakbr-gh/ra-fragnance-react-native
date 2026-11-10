import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, confirmDestructive, DeleteButton, Row, Screen, SectionTitle, tw } from '../../components/ui';
import { deletePurchase, getPurchase } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { T } from '../../i18n/labels';
import { formatDate, ml } from '../../utils/format';
import { wp } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'PurchaseDetail'>;

export default function PurchaseDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { fmt } = useSettings();
  const { data } = useFocusLoad(() => getPurchase(id), null, [id]);

  const onDelete = () =>
    confirmDestructive({
      title: T.deletePurchaseQ,
      message: T.deletePurchaseMsg,
      onConfirm: async () => {
        await deletePurchase(id);
        navigation.goBack();
      },
    });

  if (!data) {
    return <Screen />;
  }
  const { purchase, lines } = data;

  return (
    <Screen scroll right={<DeleteButton onPress={onDelete} />}>
      <Card>
        <Row label={T.vendor} value={purchase.vendor_name || '—'} />
        <Row label={T.date} value={formatDate(purchase.date)} />
        {purchase.notes ? <Row label={T.notes} value={purchase.notes} /> : null}
      </Card>
      <SectionTitle>{T.items}</SectionTitle>
      {lines.map(l => (
        <Card key={l.id} style={{ padding: wp(3) }}>
          <View style={tw`flex-row justify-between`}>
            <Text style={tw`font-bold text-black flex-1`}>{l.item_name}</Text>
            <Text style={tw`font-bold text-black`}>{fmt(l.amount)}</Text>
          </View>
          <Text style={tw`text-sm text-black`}>
            {ml(l.ml)} × {fmt(l.price_per_liter)}/L
          </Text>
        </Card>
      ))}
      <Card>
        <Row label={T.totalQuantity} value={ml(lines.reduce((s, l) => s + l.ml, 0))} />
        <Row label={T.total} value={fmt(purchase.total)} bold />
      </Card>
    </Screen>
  );
}
