import React from 'react';
import { Text, View } from 'react-native';
import { Card, Screen, tw } from '../components/ui';
import { useNav, type RootStackParamList } from '../navigation/types';

const LINKS: { emoji: string; title: string; subtitle: string; route: keyof RootStackParamList }[] = [
  { emoji: '🏪', title: 'Vendors', subtitle: 'Suppliers with address & WhatsApp', route: 'Vendors' },
  { emoji: '👥', title: 'Customers', subtitle: 'Saved automatically from orders', route: 'Customers' },
  { emoji: '⚖️', title: 'Stock Adjustments', subtitle: 'Add or remove stock with a reason', route: 'Adjustments' },
  { emoji: '⚙️', title: 'Shop Settings', subtitle: 'Name, logo, address, contact, receipt', route: 'Settings' },
  { emoji: '💾', title: 'Backup & Restore', subtitle: 'Download or import the SQLite database', route: 'Backup' },
];

export default function MoreScreen() {
  const nav = useNav();
  return (
    <Screen scroll>
      {LINKS.map(l => (
        <Card key={l.route} onPress={() => nav.navigate(l.route as any)} style={tw`flex-row items-center`}>
          <View style={tw`h-11 w-11 rounded-xl bg-violet-100 items-center justify-center mr-3`}>
            <Text style={tw`text-xl`}>{l.emoji}</Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-base font-bold text-slate-900`}>{l.title}</Text>
            <Text style={tw`text-sm text-slate-500`}>{l.subtitle}</Text>
          </View>
          <Text style={tw`text-slate-300 text-xl`}>›</Text>
        </Card>
      ))}
    </Screen>
  );
}
