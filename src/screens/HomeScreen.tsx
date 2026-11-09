import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Card, Screen, SectionTitle, tw } from '../components/ui';
import { dashboardStats, type DashboardStats } from '../db/repo';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useSettings } from '../context/SettingsContext';
import { useNav } from '../navigation/types';
import { ml, toNum } from '../utils/format';

function Stat({ label, value, color = 'text-slate-900' }: { label: string; value: string; color?: string }) {
  return (
    <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-slate-100 m-1`}>
      <Text style={tw`text-xs text-slate-500 font-semibold`}>{label}</Text>
      <Text style={tw`text-lg font-extrabold mt-1 ${color}`} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function Action({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [tw`w-1/4 items-center py-3`, pressed && tw`opacity-60`]}>
      <View style={tw`h-12 w-12 rounded-2xl bg-violet-100 items-center justify-center`}>
        <Text style={tw`text-2xl`}>{emoji}</Text>
      </View>
      <Text style={tw`text-xs font-semibold text-slate-700 mt-1 text-center`}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const nav = useNav();
  const { settings, fmt } = useSettings();
  const lowStockMl = toNum(settings.low_stock_ml);
  const { data } = useFocusLoad<DashboardStats | null>(() => dashboardStats(lowStockMl), null, [lowStockMl]);

  return (
    <Screen scroll>
      <View style={tw`flex-row items-center mb-4`}>
        {settings.shop_logo ? (
          <Image source={{ uri: settings.shop_logo }} style={tw`h-14 w-14 rounded-2xl mr-3`} />
        ) : (
          <View style={tw`h-14 w-14 rounded-2xl mr-3 bg-violet-700 items-center justify-center`}>
            <Text style={tw`text-white text-2xl font-extrabold`}>{settings.shop_name.charAt(0) || 'R'}</Text>
          </View>
        )}
        <View style={tw`flex-1`}>
          <Text style={tw`text-2xl font-extrabold text-slate-900`}>{settings.shop_name}</Text>
          {settings.shop_address ? <Text style={tw`text-slate-500`} numberOfLines={1}>{settings.shop_address}</Text> : null}
        </View>
      </View>

      <View style={tw`flex-row -mx-1`}>
        <Stat label="Today's Sales" value={fmt(data?.todaySales ?? 0)} />
        <Stat label="Today's Profit" value={fmt(data?.todayProfit ?? 0)} color="text-emerald-600" />
      </View>
      <View style={tw`flex-row -mx-1`}>
        <Stat label="This Month Sales" value={fmt(data?.monthSales ?? 0)} />
        <Stat label="This Month Profit" value={fmt(data?.monthProfit ?? 0)} color="text-emerald-600" />
      </View>
      <View style={tw`flex-row -mx-1 mb-2`}>
        <Stat label="Orders Today" value={String(data?.todayOrders ?? 0)} />
        <Stat label="Items" value={String(data?.itemCount ?? 0)} />
        <Stat label="Customers" value={String(data?.customerCount ?? 0)} />
      </View>

      <SectionTitle>Quick actions</SectionTitle>
      <Card style={tw`flex-row flex-wrap p-2`}>
        <Action emoji="🧾" label="New Order" onPress={() => nav.navigate('OrderForm')} />
        <Action emoji="📦" label="Purchase" onPress={() => nav.navigate('PurchaseForm')} />
        <Action emoji="🧴" label="Add Item" onPress={() => nav.navigate('ItemForm')} />
        <Action emoji="⚖️" label="Adjust Stock" onPress={() => nav.navigate('AdjustmentForm')} />
        <Action emoji="🏪" label="Vendors" onPress={() => nav.navigate('Vendors')} />
        <Action emoji="👥" label="Customers" onPress={() => nav.navigate('Customers')} />
        <Action emoji="⚙️" label="Settings" onPress={() => nav.navigate('Settings')} />
        <Action emoji="💾" label="Backup" onPress={() => nav.navigate('Backup')} />
      </Card>

      <SectionTitle>Low stock (≤ {ml(lowStockMl)})</SectionTitle>
      {data?.lowStock.length ? (
        data.lowStock.map(i => (
          <Card key={i.id} onPress={() => nav.navigate('ItemForm', { id: i.id })} style={tw`flex-row justify-between items-center p-3`}>
            <Text style={tw`font-semibold text-slate-900 flex-1`}>{i.name}</Text>
            <Text style={tw`font-bold ${i.stock_ml <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>{ml(i.stock_ml)}</Text>
          </Card>
        ))
      ) : (
        <Text style={tw`text-slate-400 mb-4`}>All items are well stocked 👍</Text>
      )}
    </Screen>
  );
}
