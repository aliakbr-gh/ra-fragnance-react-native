import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, Empty, Fab, Screen, SearchBar, tw } from '../../components/ui';
import { listPurchases, type Purchase } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { formatDate, ml } from '../../utils/format';

export default function PurchasesScreen() {
  const nav = useNav();
  const { fmt } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Purchase[]>(() => listPurchases(search), [], [search]);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by vendor or date" />
      <FlatList
        data={data}
        keyExtractor={p => String(p.id)}
        contentContainerStyle={tw`p-4 pb-24`}
        ListEmptyComponent={<Empty text="No purchases yet" />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('PurchaseDetail', { id: item.id })} style={tw`flex-row items-center`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-bold text-slate-900`}>{item.vendor_name || 'No vendor'}</Text>
              <Text style={tw`text-sm text-slate-500`}>
                #{item.id} · {formatDate(item.date)} · {item.item_count} item(s) · {ml(item.total_ml ?? 0)}
              </Text>
            </View>
            <Text style={tw`text-base font-extrabold text-slate-900`}>{fmt(item.total)}</Text>
          </Card>
        )}
      />
      <Fab onPress={() => nav.navigate('PurchaseForm')} />
    </Screen>
  );
}
