import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card, confirmDestructive, Empty, Fab, RemoveButton, Screen, tw, UrText } from '../../components/ui';
import { deleteAdjustment, listAdjustments, type Adjustment } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useNav } from '../../navigation/types';
import { both, T } from '../../i18n/labels';
import { formatDate, ml } from '../../utils/format';
import { hp, wp } from '../../utils/responsive';

export default function AdjustmentsScreen() {
  const nav = useNav();
  const { data, refresh } = useFocusLoad<Adjustment[]>(listAdjustments, []);

  const confirmDelete = (a: Adjustment) =>
    confirmDestructive({
      title: T.deleteAdjustmentQ,
      message: T.deleteAdjustmentMsg,
      onConfirm: async () => {
        await deleteAdjustment(a.id);
        refresh();
      },
    });

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={a => String(a.id)}
        contentContainerStyle={{ padding: wp(4), paddingBottom: hp(12) }}
        ListEmptyComponent={<Empty text={T.noAdjustments} />}
        renderItem={({ item }) => (
          <Card style={tw`flex-row items-center`}>
            <View style={tw`flex-1 mr-2`}>
              <UrText style={tw`text-base font-bold text-black`}>{item.item_name ?? both(T.deletedItem, ' · ')}</UrText>
              <Text style={tw`text-sm text-black`}>{item.reason}</Text>
              <Text style={tw`text-xs text-black`}>{formatDate(item.created_at)}</Text>
            </View>
            <View style={tw`items-end`}>
              <Text style={[tw`text-lg font-extrabold ${item.ml >= 0 ? 'text-black' : 'text-red-600'}`, { marginBottom: hp(0.6) }]}>
                {item.ml >= 0 ? '+' : ''}
                {ml(item.ml)}
              </Text>
              <RemoveButton label={T.delete} onPress={() => confirmDelete(item)} />
            </View>
          </Card>
        )}
      />
      <Fab onPress={() => nav.navigate('AdjustmentForm')} />
    </Screen>
  );
}
