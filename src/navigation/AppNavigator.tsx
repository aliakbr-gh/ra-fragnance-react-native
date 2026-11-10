import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList, TabParamList } from './types';
import { tw, urduFont, urduLineHeight } from '../components/ui';
import { T, type Bi } from '../i18n/labels';
import { colors } from '../theme';
import { hp } from '../utils/responsive';

import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderFormScreen from '../screens/orders/OrderFormScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ItemsScreen from '../screens/items/ItemsScreen';
import ItemFormScreen from '../screens/items/ItemFormScreen';
import VendorsScreen from '../screens/vendors/VendorsScreen';
import VendorFormScreen from '../screens/vendors/VendorFormScreen';
import PurchasesScreen from '../screens/purchases/PurchasesScreen';
import PurchaseFormScreen from '../screens/purchases/PurchaseFormScreen';
import PurchaseDetailScreen from '../screens/purchases/PurchaseDetailScreen';
import AdjustmentsScreen from '../screens/stock/AdjustmentsScreen';
import AdjustmentFormScreen from '../screens/stock/AdjustmentFormScreen';
import CustomersScreen from '../screens/customers/CustomersScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import BackupScreen from '../screens/settings/BackupScreen';
import MoreScreen from '../screens/MoreScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.black,
    background: colors.white,
    card: colors.white,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
};

const tabIcon =
  (emoji: string) =>
  ({ focused }: { focused: boolean }) =>
    <Text style={[tw`${focused ? 'opacity-100' : 'opacity-50'}`, { fontSize: hp(2.4) }]}>{emoji}</Text>;

const tabLabel =
  (label: Bi) =>
  ({ focused }: { focused: boolean }) =>
    (
      <View style={tw`items-center`}>
        <Text style={tw`text-[10px] leading-3 text-black ${focused ? 'font-extrabold' : 'font-normal'}`} numberOfLines={1}>
          {label.en}
        </Text>
        <Text style={[tw`text-black`, urduFont(10), urduLineHeight(10)]} numberOfLines={1}>
          {label.ur}
        </Text>
      </View>
    );

const tab = (label: Bi, emoji: string) => ({
  tabBarIcon: tabIcon(emoji),
  tabBarLabel: tabLabel(label),
});

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.black,
        tabBarStyle: { height: hp(9) + insets.bottom, paddingTop: hp(0.6), borderTopColor: colors.border },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={tab(T.home, '🏠')} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={tab(T.orders, '🧾')} />
      <Tab.Screen name="Items" component={ItemsScreen} options={tab(T.items, '🧴')} />
      <Tab.Screen name="Purchases" component={PurchasesScreen} options={tab(T.purchases, '📦')} />
      <Tab.Screen name="More" component={MoreScreen} options={tab(T.more, '☰')} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="ItemForm" component={ItemFormScreen} />
        <Stack.Screen name="Vendors" component={VendorsScreen} />
        <Stack.Screen name="VendorForm" component={VendorFormScreen} />
        <Stack.Screen name="PurchaseForm" component={PurchaseFormScreen} />
        <Stack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} />
        <Stack.Screen name="Adjustments" component={AdjustmentsScreen} />
        <Stack.Screen name="AdjustmentForm" component={AdjustmentFormScreen} />
        <Stack.Screen name="OrderForm" component={OrderFormScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Backup" component={BackupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
