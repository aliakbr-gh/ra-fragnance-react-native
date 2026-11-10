import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, Empty, Screen, SearchBar, tw, UrText } from '../../components/ui';
import { listCustomers, type Customer } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { both, T } from '../../i18n/labels';
import { hp, wp } from '../../utils/responsive';

export default function CustomersScreen() {
  const nav = useNav();
  const { fmt } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Customer[]>(() => listCustomers(search), [], [search]);
  const avatar = wp(11);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder={T.searchCustomers} />
      <FlatList
        data={data}
        keyExtractor={c => String(c.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: wp(4), paddingBottom: hp(6) }}
        ListEmptyComponent={<Empty text={T.noCustomers} />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('CustomerDetail', { id: item.id })} style={tw`flex-row items-center`}>
            <View style={[tw`rounded-full bg-black items-center justify-center mr-3`, { height: avatar, width: avatar }]}>
              <Text style={tw`text-white font-extrabold text-lg`}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-base font-bold text-black`}>{item.name}</Text>
              <UrText style={tw`text-sm text-black`}>{item.whatsapp || both(T.noNumber, ' · ')}</UrText>
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`font-bold text-black`}>{fmt(item.total_spent ?? 0)}</Text>
              <UrText style={tw`text-xs text-black`}>{both(T.orderCount(item.order_count ?? 0), ' · ')}</UrText>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
