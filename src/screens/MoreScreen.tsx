import React from 'react';
import { Text, View } from 'react-native';
import { BiText, Card, Screen, tw } from '../components/ui';
import { useNav, type RootStackParamList } from '../navigation/types';
import { T, type Bi } from '../i18n/labels';
import { wp } from '../utils/responsive';

const LINKS: { emoji: string; title: Bi; subtitle: Bi; route: keyof RootStackParamList }[] = [
  { emoji: '🏪', title: T.vendors, subtitle: T.vendorsSub, route: 'Vendors' },
  { emoji: '👥', title: T.customers, subtitle: T.customersSub, route: 'Customers' },
  { emoji: '⚖️', title: T.stockAdjustments, subtitle: T.adjustmentsSub, route: 'Adjustments' },
  { emoji: '⚙️', title: T.shopSettings, subtitle: T.settingsSub, route: 'Settings' },
  { emoji: '💾', title: T.backupRestore, subtitle: T.backupSub, route: 'Backup' },
];

export default function MoreScreen() {
  const nav = useNav();
  const box = wp(11);
  return (
    <Screen scroll>
      {LINKS.map(l => (
        <Card key={l.route} onPress={() => nav.navigate(l.route as any)} style={tw`flex-row items-center`}>
          <View style={[tw`rounded-xl bg-neutral-100 border border-neutral-200 items-center justify-center mr-3`, { height: box, width: box }]}>
            <Text style={tw`text-xl`}>{l.emoji}</Text>
          </View>
          <View style={tw`flex-1`}>
            <BiText label={l.title} inline style={tw`text-base font-bold text-black`} urStyle={tw`text-sm`} />
            <BiText label={l.subtitle} style={tw`text-sm text-black`} />
          </View>
          <Text style={tw`text-black text-xl`}>›</Text>
        </Card>
      ))}
    </Screen>
  );
}
