import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { BiText, Card, Empty, Fab, Screen, SearchBar, tw } from '../../components/ui';
import { listItems, type Item } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { T } from '../../i18n/labels';
import { ml, toNum } from '../../utils/format';
import { hp, wp } from '../../utils/responsive';

export default function ItemsScreen() {
  const nav = useNav();
  const { settings, fmt } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Item[]>(() => listItems(search), [], [search]);
  const low = toNum(settings.low_stock_ml);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder={T.searchItems} />
      <FlatList
        data={data}
        keyExtractor={i => String(i.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: wp(4), paddingBottom: hp(12) }}
        ListEmptyComponent={<Empty text={T.noItemsYet} />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('ItemForm', { id: item.id })} style={tw`flex-row items-center`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-base font-bold text-black`}>{item.name}</Text>
              {item.brand ? <Text style={tw`text-sm text-black`}>{item.brand}</Text> : null}
              <Text style={tw`text-sm text-black font-semibold mt-1`}>{fmt(item.price_per_liter)} / 1000ml</Text>
            </View>
            <View style={tw`items-end`}>
              <BiText label={T.stock} inline style={tw`text-xs text-black`} urStyle={tw`text-black`} />
              <Text
                style={tw`text-lg font-extrabold ${item.stock_ml <= 0 ? 'text-red-600' : item.stock_ml <= low ? 'text-amber-600' : 'text-black'}`}>
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
