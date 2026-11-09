import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, Empty, Screen, SearchBar, tw } from '../../components/ui';
import { listCustomers, type Customer } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';

export default function CustomersScreen() {
  const nav = useNav();
  const { fmt } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Customer[]>(() => listCustomers(search), [], [search]);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or number" />
      <FlatList
        data={data}
        keyExtractor={c => String(c.id)}
        contentContainerStyle={tw`p-4 pb-12`}
        ListEmptyComponent={<Empty text="Customers appear here after their first order" />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('CustomerDetail', { id: item.id })} style={tw`flex-row items-center`}>
            <View style={tw`h-11 w-11 rounded-full bg-violet-100 items-center justify-center mr-3`}>
              <Text style={tw`text-violet-800 font-extrabold text-lg`}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-bold text-slate-900`}>{item.name}</Text>
              <Text style={tw`text-sm text-slate-500`}>{item.whatsapp || 'No number'}</Text>
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`font-bold text-slate-900`}>{fmt(item.total_spent ?? 0)}</Text>
              <Text style={tw`text-xs text-slate-500`}>{item.order_count} order(s)</Text>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
