import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, confirmDestructive, DeleteButton, Row, Field, Screen, SectionTitle, showAlert, tw } from '../../components/ui';
import { deleteCustomer, getCustomer, listOrders, saveCustomer, type Customer, type Order } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { T } from '../../i18n/labels';
import { toWhatsAppNumber } from '../../utils/format';
import { hp } from '../../utils/responsive';
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

  const onDelete = () =>
    confirmDestructive({
      title: T.deleteCustomerQ,
      message: T.deleteCustomerMsg,
      onConfirm: async () => {
        await deleteCustomer(id);
        navigation.goBack();
      },
    });

  const { customer, orders } = data;
  if (!customer) {
    return <Screen />;
  }

  const save = async () => {
    if (!form.name.trim()) {
      return showAlert(T.required, T.enterName);
    }
    await saveCustomer({ id, ...form });
    setEditing(false);
    refresh();
  };

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalProfit = orders.reduce((s, o) => s + o.profit, 0);

  return (
    <Screen scroll right={<DeleteButton onPress={onDelete} />}>
      {editing ? (
        <Card>
          <Field label={T.name} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
          <Field label={T.whatsapp} value={form.whatsapp} onChangeText={v => setForm(f => ({ ...f, whatsapp: v }))} keyboardType="phone-pad" />
          <Field label={T.address} value={form.address} onChangeText={v => setForm(f => ({ ...f, address: v }))} multiline />
          <View style={tw`flex-row`}>
            <Button title={T.cancel} variant="outline" style={tw`flex-1 mr-2`} onPress={() => setEditing(false)} />
            <Button title={T.save} style={tw`flex-1`} onPress={save} />
          </View>
        </Card>
      ) : (
        <Card>
          <Row label={T.name} value={customer.name} bold />
          <Row label={T.whatsapp} value={customer.whatsapp || '—'} />
          <Row label={T.address} value={customer.address || '—'} />
          <View style={[tw`border-t border-neutral-200`, { marginTop: hp(1), paddingTop: hp(1) }]}>
            <Row label={T.orders} value={String(orders.length)} />
            <Row label={T.totalSpent} value={fmt(totalSpent)} />
            <Row label={T.totalProfit} value={fmt(totalProfit)} color={totalProfit < 0 ? 'text-red-600' : 'text-black'} />
          </View>
          <View style={[tw`flex-row`, { marginTop: hp(1.5) }]}>
            <Button small title={T.edit} variant="outline" style={tw`flex-1 mr-2`} onPress={() => setEditing(true)} />
            {customer.whatsapp ? (
              <Button
                small
                title={T.whatsapp}
                variant="whatsapp"
                style={tw`flex-1 mr-2`}
                onPress={() => Linking.openURL(`https://wa.me/${toWhatsAppNumber(customer.whatsapp, settings.country_code)}`)}
              />
            ) : null}
            <Button small title={T.newOrder} style={tw`flex-1`} onPress={() => navigation.navigate('OrderForm', { customerId: id })} />
          </View>
        </Card>
      )}

      <SectionTitle>{T.orders}</SectionTitle>
      {orders.map(o => (
        <OrderCard key={o.id} order={o} onPress={() => navigation.navigate('OrderDetail', { id: o.id })} />
      ))}
    </Screen>
  );
}
