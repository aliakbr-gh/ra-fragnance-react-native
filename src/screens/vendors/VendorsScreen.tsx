import React, { useState } from 'react';
import { FlatList, Linking, Text, View } from 'react-native';
import { Button, Card, Empty, Fab, Screen, SearchBar, tw } from '../../components/ui';
import { listVendors, type Vendor } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useSettings } from '../../context/SettingsContext';
import { useNav } from '../../navigation/types';
import { toWhatsAppNumber } from '../../utils/format';

export default function VendorsScreen() {
  const nav = useNav();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const { data } = useFocusLoad<Vendor[]>(() => listVendors(search), [], [search]);

  return (
    <Screen>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search vendors" />
      <FlatList
        data={data}
        keyExtractor={v => String(v.id)}
        contentContainerStyle={tw`p-4 pb-24`}
        ListEmptyComponent={<Empty text="No vendors yet" />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('VendorForm', { id: item.id })}>
            <Text style={tw`text-base font-bold text-slate-900`}>{item.name}</Text>
            {item.address ? <Text style={tw`text-sm text-slate-500`}>{item.address}</Text> : null}
            <View style={tw`flex-row mt-2`}>
              {item.whatsapp ? (
                <Button
                  small
                  variant="whatsapp"
                  title="WhatsApp"
                  style={tw`mr-2`}
                  onPress={() => Linking.openURL(`https://wa.me/${toWhatsAppNumber(item.whatsapp, settings.country_code)}`)}
                />
              ) : null}
              {item.phone ? <Button small variant="outline" title="Call" onPress={() => Linking.openURL(`tel:${item.phone}`)} /> : null}
            </View>
          </Card>
        )}
      />
      <Fab onPress={() => nav.navigate('VendorForm')} />
    </Screen>
  );
}
