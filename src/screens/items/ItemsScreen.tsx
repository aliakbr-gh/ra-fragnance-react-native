import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, Empty, Fab, Screen, SearchBar, tw } from '../../components/ui';
import { listItems, type Item } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { ml, toNum } from '../../utils/format';

export default function ItemsScreen() {
  const nav = useNav();
  const { settings, fmt } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Item[]>(() => listItems(search), [], [search]);
  const low = toNum(settings.low_stock_ml);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search items or brand" />
      <FlatList
        data={data}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={tw`p-4 pb-24`}
        ListEmptyComponent={<Empty text="No items yet" />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('ItemForm', { id: item.id })} style={tw`flex-row items-center`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-bold text-slate-900`}>{item.name}</Text>
              {item.brand ? <Text style={tw`text-sm text-slate-500`}>{item.brand}</Text> : null}
              <Text style={tw`text-sm text-violet-700 font-semibold mt-1`}>{fmt(item.price_per_liter)} / 1000ml</Text>
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`text-xs text-slate-400`}>Stock</Text>
              <Text
                style={tw`text-lg font-extrabold ${item.stock_ml <= 0 ? 'text-rose-600' : item.stock_ml <= low ? 'text-amber-600' : 'text-emerald-600'}`}>
                {ml(item.stock_ml)}
              </Text>
            </View>
          </Card>
        )}
      />
      <Fab onPress={() => nav.navigate('ItemForm')} />
    </Screen>
  );
}
