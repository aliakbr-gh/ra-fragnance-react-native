import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { BiText, Card, Empty, Fab, Screen, SearchBar, tw } from '../../components/ui';
import { listOrders, type Order } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { T } from '../../i18n/labels';
import { formatDate, orderNo } from '../../utils/format';
import { hp, wp } from '../../utils/responsive';

export function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const { fmt } = useSettings();
  return (
    <Card onPress={onPress} style={tw`flex-row items-center`}>
      <View style={tw`flex-1 mr-2`}>
        <Text style={tw`text-base font-bold text-black`}>{order.customer_name}</Text>
        <BiText label={T.itemCount(order.item_count ?? 0)} inline style={tw`text-sm text-black`} urStyle={tw`text-black`} />
        <Text style={tw`text-xs text-black`}>
          {orderNo(order.id)} · {formatDate(order.created_at)}
        </Text>
      </View>
      <View style={tw`items-end`}>
        <Text style={tw`text-base font-extrabold text-black`}>{fmt(order.total)}</Text>
        <BiText label={T.profit} inline style={tw`text-xs text-black`} urStyle={tw`text-black`} />
        <Text style={tw`text-xs font-semibold ${order.profit >= 0 ? 'text-black' : 'text-red-600'}`}>{fmt(order.profit)}</Text>
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
      <SearchBar value={search} onChangeText={setSearch} placeholder={T.searchOrders} />
      <FlatList
        data={data}
        keyExtractor={o => String(o.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: wp(4), paddingBottom: hp(12) }}
        ListEmptyComponent={<Empty text={T.noOrders} />}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => nav.navigate('OrderDetail', { id: item.id })} />}
      />
      <Fab onPress={() => nav.navigate('OrderForm')} />
    </Screen>
  );
}
