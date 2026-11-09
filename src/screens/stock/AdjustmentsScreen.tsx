import React from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { Card, Empty, Fab, Screen, tw } from '../../components/ui';
import { deleteAdjustment, listAdjustments, type Adjustment } from '../../db/repo';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { useNav } from '../../navigation/types';
import { formatDate, ml } from '../../utils/format';

export default function AdjustmentsScreen() {
  const nav = useNav();
  const { data, refresh } = useFocusLoad<Adjustment[]>(listAdjustments, []);

  const confirmDelete = (a: Adjustment) =>
    Alert.alert('Delete adjustment?', 'Stock will be reverted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAdjustment(a.id);
          refresh();
        },
      },
    ]);

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={a => String(a.id)}
        contentContainerStyle={tw`p-4 pb-24`}
        ListEmptyComponent={<Empty text="No adjustments yet" />}
        renderItem={({ item }) => (
          <Card onPress={() => confirmDelete(item)} style={tw`flex-row items-center`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-bold text-slate-900`}>{item.item_name ?? 'Deleted item'}</Text>
              <Text style={tw`text-sm text-slate-600`}>{item.reason}</Text>
              <Text style={tw`text-xs text-slate-400`}>{formatDate(item.created_at)} · tap to delete</Text>
            </View>
            <Text style={tw`text-lg font-extrabold ${item.ml >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {item.ml >= 0 ? '+' : ''}
              {ml(item.ml)}
            </Text>
          </Card>
        )}
      />
      <Fab onPress={() => nav.navigate('AdjustmentForm')} />
    </Screen>
  );
}
