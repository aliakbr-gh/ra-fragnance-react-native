import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, TabParamList } from './types';

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

const VIOLET = '#6d28d9';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: VIOLET, background: '#f8fafc' },
};

const tabIcon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: VIOLET,
        tabBarLabelStyle: { fontWeight: '600' },
        headerTitleStyle: { fontWeight: '700' },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon('🏠'), title: 'Dashboard', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: tabIcon('🧾') }} />
      <Tab.Screen name="Items" component={ItemsScreen} options={{ tabBarIcon: tabIcon('🧴') }} />
      <Tab.Screen name="Purchases" component={PurchasesScreen} options={{ tabBarIcon: tabIcon('📦') }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ tabBarIcon: tabIcon('☰') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '700' }, headerTintColor: VIOLET }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ItemForm" component={ItemFormScreen} options={{ title: 'Item' }} />
        <Stack.Screen name="Vendors" component={VendorsScreen} />
        <Stack.Screen name="VendorForm" component={VendorFormScreen} options={{ title: 'Vendor' }} />
        <Stack.Screen name="PurchaseForm" component={PurchaseFormScreen} options={{ title: 'New Purchase' }} />
        <Stack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} options={{ title: 'Purchase' }} />
        <Stack.Screen name="Adjustments" component={AdjustmentsScreen} options={{ title: 'Stock Adjustments' }} />
        <Stack.Screen name="AdjustmentForm" component={AdjustmentFormScreen} options={{ title: 'Adjust Stock' }} />
        <Stack.Screen name="OrderForm" component={OrderFormScreen} options={{ title: 'New Order' }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Shop Settings' }} />
        <Stack.Screen name="Backup" component={BackupScreen} options={{ title: 'Backup & Restore' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
