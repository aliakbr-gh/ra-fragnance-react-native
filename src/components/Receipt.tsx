import React from 'react';
import { Image, Text, View } from 'react-native';
import tw from 'twrnc';
import type { Order, OrderLine, Settings } from '../db/repo';
import { formatDate, ml, money, orderNo } from '../utils/format';

export type ViewRef = React.ComponentRef<typeof View>;

type Props = { settings: Settings; order: Order; lines: OrderLine[]; ref?: React.Ref<ViewRef> };

/** Customer-facing receipt; also the view that gets captured as the WhatsApp image. */
export default function Receipt({ settings, order, lines, ref }: Props) {
  const fmt = (n: number) => money(n, settings.currency);
  const showProfit = settings.show_profit_on_receipt === '1';

  return (
    <View ref={ref} collapsable={false} style={tw`bg-white p-5 rounded-2xl`}>
      <View style={tw`items-center border-b border-dashed border-slate-300 pb-3 mb-3`}>
        {settings.shop_logo ? <Image source={{ uri: settings.shop_logo }} style={tw`h-16 w-16 rounded-xl mb-2`} resizeMode="contain" /> : null}
        <Text style={tw`text-xl font-extrabold text-slate-900 text-center`}>{settings.shop_name}</Text>
        {settings.shop_address ? <Text style={tw`text-xs text-slate-500 text-center mt-0.5`}>{settings.shop_address}</Text> : null}
        <Text style={tw`text-xs text-slate-500 text-center mt-0.5`}>
          {[settings.shop_phone && `📞 ${settings.shop_phone}`, settings.shop_whatsapp && `WhatsApp ${settings.shop_whatsapp}`]
            .filter(Boolean)
            .join('  ·  ')}
        </Text>
      </View>

      <View style={tw`flex-row justify-between mb-1`}>
        <Text style={tw`text-sm font-bold text-slate-900`}>Order {orderNo(order.id)}</Text>
        <Text style={tw`text-xs text-slate-500`}>{formatDate(order.created_at)}</Text>
      </View>
      <View style={tw`mb-3`}>
        <Text style={tw`text-sm text-slate-800`}>
          <Text style={tw`font-semibold`}>Customer: </Text>
          {order.customer_name}
        </Text>
        {order.whatsapp ? <Text style={tw`text-sm text-slate-800`}>WhatsApp: {order.whatsapp}</Text> : null}
        {order.address ? <Text style={tw`text-sm text-slate-800`}>Address: {order.address}</Text> : null}
      </View>

      <View style={tw`flex-row bg-slate-100 rounded-lg px-2 py-1.5`}>
        <Text style={tw`flex-1 text-xs font-bold text-slate-600`}>ITEM</Text>
        <Text style={tw`w-16 text-xs font-bold text-slate-600 text-right`}>QTY</Text>
        <Text style={tw`w-24 text-xs font-bold text-slate-600 text-right`}>AMOUNT</Text>
      </View>
      {lines.map((l, i) => (
        <View key={l.id ?? i} style={tw`flex-row px-2 py-2 border-b border-slate-100`}>
          <Text style={tw`flex-1 text-sm text-slate-900`}>{l.item_name}</Text>
          <Text style={tw`w-16 text-sm text-slate-700 text-right`}>{ml(l.ml)}</Text>
          <Text style={tw`w-24 text-sm font-semibold text-slate-900 text-right`}>{fmt(l.amount)}</Text>
        </View>
      ))}

      <View style={tw`mt-3`}>
        <View style={tw`flex-row justify-between py-0.5`}>
          <Text style={tw`text-slate-600`}>Subtotal</Text>
          <Text style={tw`text-slate-900 font-semibold`}>{fmt(order.subtotal)}</Text>
        </View>
        {order.discount ? (
          <View style={tw`flex-row justify-between py-0.5`}>
            <Text style={tw`text-slate-600`}>Discount</Text>
            <Text style={tw`text-rose-600 font-semibold`}>− {fmt(order.discount)}</Text>
          </View>
        ) : null}
        <View style={tw`flex-row justify-between py-2 mt-1 border-t border-slate-300`}>
          <Text style={tw`text-lg font-extrabold text-slate-900`}>Total</Text>
          <Text style={tw`text-lg font-extrabold text-violet-700`}>{fmt(order.total)}</Text>
        </View>
        {showProfit ? (
          <View style={tw`flex-row justify-between py-0.5`}>
            <Text style={tw`text-slate-600`}>Profit</Text>
            <Text style={tw`text-emerald-600 font-bold`}>{fmt(order.profit)}</Text>
          </View>
        ) : null}
      </View>

      {settings.receipt_footer ? (
        <Text style={tw`text-center text-xs text-slate-500 mt-3 pt-3 border-t border-dashed border-slate-300`}>{settings.receipt_footer}</Text>
      ) : null}
    </View>
  );
}
