import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, Empty, Fab, Screen, SearchBar, tw } from '../../components/ui';
import { listOrders, type Order } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { formatDate, orderNo } from '../../utils/format';

export function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const { fmt } = useSettings();
  return (
    <Card onPress={onPress} style={tw`flex-row items-center`}>
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-bold text-slate-900`}>{order.customer_name}</Text>
        <Text style={tw`text-sm text-slate-500`}>
          {orderNo(order.id)} · {order.item_count} item(s)
        </Text>
        <Text style={tw`text-xs text-slate-400`}>{formatDate(order.created_at)}</Text>
      </View>
      <View style={tw`items-end`}>
        <Text style={tw`text-base font-extrabold text-slate-900`}>{fmt(order.total)}</Text>
        <Text style={tw`text-xs font-semibold ${order.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Profit {fmt(order.profit)}</Text>
      </View>
    </Card>
  );
}

export default function OrdersScreen() {
  const nav = useNav();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Order[]>(() => listOrders(search), [], [search]);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by customer, number or order #" />
      <FlatList
        data={data}
        keyExtractor={o => String(o.id)}
        contentContainerStyle={tw`p-4 pb-24`}
        ListEmptyComponent={<Empty text="No orders yet" />}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => nav.navigate('OrderDetail', { id: item.id })} />}
      />
      <Fab onPress={() => nav.navigate('OrderForm')} />
    </Screen>
  );
}
