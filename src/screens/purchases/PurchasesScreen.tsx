import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, Empty, Fab, Screen, SearchBar, tw, UrText } from '../../components/ui';
import { listPurchases, type Purchase } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { both, T } from '../../i18n/labels';
import { formatDate, ml } from '../../utils/format';
import { hp, wp } from '../../utils/responsive';

export default function PurchasesScreen() {
  const nav = useNav();
  const { fmt } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Purchase[]>(() => listPurchases(search), [], [search]);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder={T.searchPurchases} />
      <FlatList
        data={data}
        keyExtractor={p => String(p.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: wp(4), paddingBottom: hp(12) }}
        ListEmptyComponent={<Empty text={T.noPurchases} />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('PurchaseDetail', { id: item.id })} style={tw`flex-row items-center`}>
            <View style={tw`flex-1 mr-2`}>
              <UrText style={tw`text-base font-bold text-black`}>{item.vendor_name || both(T.noVendor, ' · ')}</UrText>
              <Text style={tw`text-sm text-black`}>
                #{item.id} · {formatDate(item.date)} · {ml(item.total_ml ?? 0)}
              </Text>
              <UrText style={tw`text-xs text-black`}>{both(T.itemCount(item.item_count ?? 0), ' · ')}</UrText>
            </View>
            <Text style={tw`text-base font-extrabold text-black`}>{fmt(item.total)}</Text>
          </Card>
        )}
      />
      <Fab onPress={() => nav.navigate('PurchaseForm')} />
    </Screen>
  );
}
