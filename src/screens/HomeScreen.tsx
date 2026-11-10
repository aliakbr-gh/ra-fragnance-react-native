import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { BiText, Card, Screen, SectionTitle, tw } from '../components/ui';
import { dashboardStats, type DashboardStats } from '../db/repo';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useSettings } from '../context/SettingsContext';
import { useNav } from '../navigation/types';
import { T, withSuffix, type Bi } from '../i18n/labels';
import { ml, toNum } from '../utils/format';
import { hp, wp } from '../utils/responsive';

function Stat({ label, value, color = 'text-black' }: { label: Bi; value: string; color?: string }) {
  return (
    <View style={[tw`flex-1 bg-white rounded-2xl border border-neutral-200`, { padding: wp(3.5), margin: wp(1) }]}>
      <BiText label={label} style={tw`text-xs text-black font-semibold`} numberOfLines={1} />
      <Text style={tw`text-lg font-extrabold mt-1 ${color}`} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function Action({ emoji, label, onPress }: { emoji: string; label: Bi; onPress: () => void }) {
  const box = wp(12);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [tw`w-1/4 items-center`, { paddingVertical: hp(1.2) }, pressed && tw`opacity-60`]}>
      <View style={[tw`rounded-2xl bg-neutral-100 border border-neutral-200 items-center justify-center`, { height: box, width: box }]}>
        <Text style={tw`text-2xl`}>{emoji}</Text>
      </View>
      <View style={tw`items-center mt-1`}>
        <BiText label={label} style={tw`text-xs font-semibold text-black text-center`} numberOfLines={1} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const nav = useNav();
  const { settings, fmt } = useSettings();
  const lowStockMl = toNum(settings.low_stock_ml);
  const { data } = useFocusLoad<DashboardStats | null>(() => dashboardStats(lowStockMl), null, [lowStockMl]);
  const logo = wp(14);

  return (
    <Screen scroll>
      <View style={[tw`flex-row items-center`, { marginBottom: hp(2) }]}>
        {settings.shop_logo ? (
          <Image source={{ uri: settings.shop_logo }} style={[tw`rounded-2xl mr-3`, { height: logo, width: logo }]} />
        ) : (
          <View style={[tw`rounded-2xl mr-3 bg-black items-center justify-center`, { height: logo, width: logo }]}>
            <Text style={tw`text-white text-2xl font-extrabold`}>{settings.shop_name.charAt(0) || 'R'}</Text>
          </View>
        )}
        <View style={tw`flex-1`}>
          <Text style={tw`text-2xl font-extrabold text-black`}>{settings.shop_name}</Text>
          {settings.shop_address ? (
            <Text style={tw`text-black`} numberOfLines={1}>
              {settings.shop_address}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[tw`flex-row`, { marginHorizontal: -wp(1) }]}>
        <Stat label={T.todaySales} value={fmt(data?.todaySales ?? 0)} />
        <Stat label={T.todayProfit} value={fmt(data?.todayProfit ?? 0)} color={(data?.todayProfit ?? 0) < 0 ? 'text-red-600' : 'text-black'} />
      </View>
      <View style={[tw`flex-row`, { marginHorizontal: -wp(1) }]}>
        <Stat label={T.monthSales} value={fmt(data?.monthSales ?? 0)} />
        <Stat label={T.monthProfit} value={fmt(data?.monthProfit ?? 0)} color={(data?.monthProfit ?? 0) < 0 ? 'text-red-600' : 'text-black'} />
      </View>
      <View style={[tw`flex-row`, { marginHorizontal: -wp(1), marginBottom: hp(1) }]}>
        <Stat label={T.ordersToday} value={String(data?.todayOrders ?? 0)} />
        <Stat label={T.items} value={String(data?.itemCount ?? 0)} />
        <Stat label={T.customers} value={String(data?.customerCount ?? 0)} />
      </View>

      <SectionTitle>{T.quickActions}</SectionTitle>
      <Card style={[tw`flex-row flex-wrap`, { padding: wp(2) }]}>
        <Action emoji="🧾" label={T.newOrder} onPress={() => nav.navigate('OrderForm')} />
        <Action emoji="📦" label={T.purchase} onPress={() => nav.navigate('PurchaseForm')} />
        <Action emoji="🧴" label={T.addItem} onPress={() => nav.navigate('ItemForm')} />
        <Action emoji="⚖️" label={T.adjustStock} onPress={() => nav.navigate('AdjustmentForm')} />
        <Action emoji="🏪" label={T.vendors} onPress={() => nav.navigate('Vendors')} />
        <Action emoji="👥" label={T.customers} onPress={() => nav.navigate('Customers')} />
        <Action emoji="⚙️" label={T.settings} onPress={() => nav.navigate('Settings')} />
        <Action emoji="💾" label={T.backup} onPress={() => nav.navigate('Backup')} />
      </Card>

      <SectionTitle>{withSuffix(T.lowStock, ` (≤ ${ml(lowStockMl)})`)}</SectionTitle>
      {data?.lowStock.length ? (
        data.lowStock.map(i => (
          <Card key={i.id} onPress={() => nav.navigate('ItemForm', { id: i.id })} style={[tw`flex-row justify-between items-center`, { padding: wp(3) }]}>
            <Text style={tw`font-semibold text-black flex-1`}>{i.name}</Text>
            <Text style={tw`font-bold ${i.stock_ml <= 0 ? 'text-red-600' : 'text-amber-600'}`}>{ml(i.stock_ml)}</Text>
          </Card>
        ))
      ) : (
        <View style={{ marginBottom: hp(2) }}>
          <BiText label={T.allStocked} style={tw`text-black`} />
        </View>
      )}
    </Screen>
  );
}
