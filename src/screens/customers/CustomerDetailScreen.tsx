import React, { useLayoutEffect, useState } from 'react';
import { Alert, Linking, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Field, HeaderButton, Row, Screen, SectionTitle, tw } from '../../components/ui';
import { deleteCustomer, getCustomer, listOrders, saveCustomer, type Customer, type Order } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { toWhatsAppNumber } from '../../utils/format';
import { OrderCard } from '../orders/OrdersScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerDetail'>;

export default function CustomerDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { settings, fmt } = useSettings();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', whatsapp: '', address: '' });

  const { data, refresh } = useFocusLoad<{ customer: Customer | null; orders: Order[] }>(
    async () => {
      const [customer, orders] = await Promise.all([getCustomer(id), listOrders('', id)]);
      if (customer) {
        setForm({ name: customer.name, whatsapp: customer.whatsapp ?? '', address: customer.address ?? '' });
      }
      return { customer, orders };
    },
    { customer: null, orders: [] },
    [id],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          title="Delete"
          color="text-rose-600"
          onPress={() =>
            Alert.alert('Delete customer?', 'Their orders will be kept.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await deleteCustomer(id);
                  navigation.goBack();
                },
              },
            ])
          }
        />
      ),
    });
  }, [navigation, id]);

  const { customer, orders } = data;
  if (!customer) {
    return <Screen />;
  }

  const save = async () => {
    if (!form.name.trim()) {
      return Alert.alert('Required', 'Enter name');
    }
    await saveCustomer({ id, ...form });
    setEditing(false);
    refresh();
  };

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalProfit = orders.reduce((s, o) => s + o.profit, 0);

  return (
    <Screen scroll>
      {editing ? (
        <Card>
          <Field label="Name" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="WhatsApp" value={form.whatsapp} onChangeText={v => setForm(f => ({ ...f, whatsapp: v }))} keyboardType="phone-pad" />
          <Field label="Address" value={form.address} onChangeText={v => setForm(f => ({ ...f, address: v }))} multiline />
          <View style={tw`flex-row`}>
            <Button title="Cancel" variant="outline" style={tw`flex-1 mr-2`} onPress={() => setEditing(false)} />
            <Button title="Save" style={tw`flex-1`} onPress={save} />
          </View>
        </Card>
      ) : (
        <Card>
          <Row label="Name" value={customer.name} bold />
          <Row label="WhatsApp" value={customer.whatsapp || '—'} />
          <Row label="Address" value={customer.address || '—'} />
          <View style={tw`border-t border-slate-100 mt-2 pt-2`}>
            <Row label="Orders" value={String(orders.length)} />
            <Row label="Total spent" value={fmt(totalSpent)} />
            <Row label="Total profit" value={fmt(totalProfit)} color="text-emerald-600" />
          </View>
          <View style={tw`flex-row mt-3`}>
            <Button small title="Edit" variant="outline" style={tw`flex-1 mr-2`} onPress={() => setEditing(true)} />
            {customer.whatsapp ? (
              <Button
                small
                title="WhatsApp"
                variant="whatsapp"
                style={tw`flex-1 mr-2`}
                onPress={() => Linking.openURL(`https://wa.me/${toWhatsAppNumber(customer.whatsapp, settings.country_code)}`)}
              />
            ) : null}
            <Button small title="New order" style={tw`flex-1`} onPress={() => navigation.navigate('OrderForm', { customerId: id })} />
          </View>
        </Card>
      )}

      <SectionTitle>Orders</SectionTitle>
      {orders.map(o => (
        <OrderCard key={o.id} order={o} onPress={() => navigation.navigate('OrderDetail', { id: o.id })} />
      ))}
    </Screen>
  );
}
