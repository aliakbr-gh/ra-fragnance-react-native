import React, { useLayoutEffect } from 'react';
import { Alert, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, HeaderButton, Row, Screen, SectionTitle, tw } from '../../components/ui';
import { deletePurchase, getPurchase } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { formatDate, ml } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'PurchaseDetail'>;

export default function PurchaseDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { fmt } = useSettings();
  const { data } = useFocusLoad(() => getPurchase(id), null, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Purchase #${id}`,
      headerRight: () => (
        <HeaderButton
          title="Delete"
          color="text-rose-600"
          onPress={() =>
            Alert.alert('Delete purchase?', 'The purchased quantity will be removed from stock.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await deletePurchase(id);
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
  const { purchase, lines } = data;

  return (
    <Screen scroll>
      <Card>
        <Row label="Vendor" value={purchase.vendor_name || '—'} />
        <Row label="Date" value={formatDate(purchase.date)} />
        {purchase.notes ? <Row label="Notes" value={purchase.notes} /> : null}
      </Card>
      <SectionTitle>Items</SectionTitle>
      {lines.map(l => (
        <Card key={l.id} style={tw`p-3`}>
          <View style={tw`flex-row justify-between`}>
            <Text style={tw`font-bold text-slate-900 flex-1`}>{l.item_name}</Text>
            <Text style={tw`font-bold text-slate-900`}>{fmt(l.amount)}</Text>
          </View>
          <Text style={tw`text-sm text-slate-500`}>
            {ml(l.ml)} × {fmt(l.price_per_liter)}/L
          </Text>
        </Card>
      ))}
      <Card>
        <Row label="Total quantity" value={ml(lines.reduce((s, l) => s + l.ml, 0))} />
        <Row label="Total" value={fmt(purchase.total)} bold />
      </Card>
    </Screen>
  );
}
