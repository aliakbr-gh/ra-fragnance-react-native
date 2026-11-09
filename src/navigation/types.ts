import { useNavigation, type NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TabParamList = {
  Home: undefined;
  Orders: undefined;
  Items: undefined;
  Purchases: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ItemForm: { id?: number } | undefined;
  Vendors: undefined;
  VendorForm: { id?: number } | undefined;
  PurchaseForm: undefined;
  PurchaseDetail: { id: number };
  Adjustments: undefined;
  AdjustmentForm: { itemId?: number } | undefined;
  OrderForm: { customerId?: number } | undefined;
  OrderDetail: { id: number };
  Customers: undefined;
  CustomerDetail: { id: number };
  Settings: undefined;
  Backup: undefined;
};

export type Nav = NativeStackNavigationProp<RootStackParamList>;

export const useNav = () => useNavigation<Nav>();
