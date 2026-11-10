import React, { useState } from 'react';
import { FlatList, Linking, Text, View } from 'react-native';
import { Button, Card, Empty, Fab, Screen, SearchBar, tw } from '../../components/ui';
import { listVendors, type Vendor } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { T } from '../../i18n/labels';
import { toWhatsAppNumber } from '../../utils/format';
import { hp, wp } from '../../utils/responsive';

export default function VendorsScreen() {
  const nav = useNav();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Vendor[]>(() => listVendors(search), [], [search]);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder={T.searchVendors} />
      <FlatList
        data={data}
        keyExtractor={v => String(v.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: wp(4), paddingBottom: hp(12) }}
        ListEmptyComponent={<Empty text={T.noVendors} />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('VendorForm', { id: item.id })}>
            <Text style={tw`text-base font-bold text-black`}>{item.name}</Text>
            {item.address ? <Text style={tw`text-sm text-black`}>{item.address}</Text> : null}
            <View style={[tw`flex-row`, { marginTop: hp(1) }]}>
              {item.whatsapp ? (
                <Button
                  small
                  variant="whatsapp"
                  title={T.whatsapp}
                  style={tw`mr-2`}
                  onPress={() => Linking.openURL(`https://wa.me/${toWhatsAppNumber(item.whatsapp, settings.country_code)}`)}
                />
              ) : null}
              {item.phone ? <Button small variant="outline" title={T.call} onPress={() => Linking.openURL(`tel:${item.phone}`)} /> : null}
            </View>
          </Card>
        )}
      />
      <Fab onPress={() => nav.navigate('VendorForm')} />
    </Screen>
  );
}
