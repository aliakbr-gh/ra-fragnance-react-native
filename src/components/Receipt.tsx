import React from 'react';
import { Image, Text, View, type StyleProp, type TextStyle } from 'react-native';
import tw from 'twrnc';
import type { Order, OrderLine, Settings } from '../db/repo';
import { T, type Bi } from '../i18n/labels';
import { BiText, UrText, urduFont, urduLineHeight } from './ui';
import { formatDate, ml, money, orderNo } from '../utils/format';
import { hp, wp } from '../utils/responsive';

export type ViewRef = React.ComponentRef<typeof View>;

type Props = { settings: Settings; order: Order; lines: OrderLine[]; ref?: React.Ref<ViewRef> };

function L({ label, style }: { label: Bi; style?: StyleProp<TextStyle> }) {
  return <BiText label={label} inline style={style} />;
}

function ColHead({ label, width }: { label: Bi; width?: number }) {
  return (
    <View style={width ? [tw`items-end`, { width }] : tw`flex-1`}>
      <Text style={tw`text-xs font-bold text-black uppercase`}>{label.en}</Text>
      <Text style={[tw`text-black`, urduFont(10), urduLineHeight(10)]}>{label.ur}</Text>
    </View>
  );
}

/** Customer-facing receipt; also the view that gets captured as the WhatsApp image. */
export default function Receipt({ settings, order, lines, ref }: Props) {
  const fmt = (n: number) => money(n, settings.currency);
  const showProfit = settings.show_profit_on_receipt === '1';
  const qtyW = wp(18);
  const amountW = wp(26);
  const logo = wp(16);

  return (
    <View ref={ref} collapsable={false} style={[tw`bg-white rounded-2xl border border-neutral-200`, { padding: wp(5) }]}>
      <View style={[tw`items-center border-b border-dashed border-neutral-300`, { paddingBottom: hp(1.5), marginBottom: hp(1.5) }]}>
        {settings.shop_logo ? (
          <Image source={{ uri: settings.shop_logo }} style={[tw`rounded-xl mb-2`, { height: logo, width: logo }]} resizeMode="contain" />
        ) : null}
        <Text style={tw`text-xl font-extrabold text-black text-center`}>{settings.shop_name}</Text>
        {settings.shop_address ? <Text style={tw`text-xs text-black text-center mt-0.5`}>{settings.shop_address}</Text> : null}
        <Text style={tw`text-xs text-black text-center mt-0.5`}>
          {[settings.shop_phone && `📞 ${settings.shop_phone}`, settings.shop_whatsapp && `WhatsApp ${settings.shop_whatsapp}`]
            .filter(Boolean)
            .join('  ·  ')}
        </Text>
      </View>

      <View style={tw`flex-row justify-between items-center mb-1`}>
        <BiText label={{ en: `${T.order.en} ${orderNo(order.id)}`, ur: T.order.ur }} inline style={tw`text-sm font-bold text-black`} />
        <Text style={tw`text-xs text-black`}>{formatDate(order.created_at)}</Text>
      </View>
      <View style={{ marginBottom: hp(1.5) }}>
        <UrText style={tw`text-sm text-black`}>{`${T.customer.en} ${T.customer.ur}:  ${order.customer_name}`}</UrText>
        {order.whatsapp ? <UrText style={tw`text-sm text-black`}>{`${T.whatsapp.en} ${T.whatsapp.ur}:  ${order.whatsapp}`}</UrText> : null}
        {order.address ? <UrText style={tw`text-sm text-black`}>{`${T.address.en} ${T.address.ur}:  ${order.address}`}</UrText> : null}
      </View>

      <View style={[tw`flex-row bg-neutral-100 rounded-lg`, { paddingHorizontal: wp(2), paddingVertical: hp(0.8) }]}>
        <ColHead label={T.item} />
        <ColHead label={T.qty} width={qtyW} />
        <ColHead label={T.amount} width={amountW} />
      </View>
      {lines.map((l, i) => (
        <View key={l.id ?? i} style={[tw`flex-row border-b border-neutral-200`, { paddingHorizontal: wp(2), paddingVertical: hp(1) }]}>
          <Text style={tw`flex-1 text-sm text-black`}>{l.item_name}</Text>
          <Text style={[tw`text-sm text-black text-right`, { width: qtyW }]}>{ml(l.ml)}</Text>
          <Text style={[tw`text-sm font-semibold text-black text-right`, { width: amountW }]}>{fmt(l.amount)}</Text>
        </View>
      ))}

      <View style={{ marginTop: hp(1.5) }}>
        <View style={tw`flex-row justify-between py-0.5`}>
          <L label={T.subtotal} style={tw`text-black`} />
          <Text style={tw`text-black font-semibold`}>{fmt(order.subtotal)}</Text>
        </View>
        {order.discount ? (
          <View style={tw`flex-row justify-between py-0.5`}>
            <L label={T.discount} style={tw`text-black`} />
            <Text style={tw`text-red-600 font-semibold`}>− {fmt(order.discount)}</Text>
          </View>
        ) : null}
        <View style={tw`flex-row justify-between items-center py-2 mt-1 border-t border-black`}>
          <L label={T.total} style={tw`text-lg font-extrabold text-black`} />
          <Text style={tw`text-lg font-extrabold text-black`}>{fmt(order.total)}</Text>
        </View>
        {showProfit ? (
          <View style={tw`flex-row justify-between py-0.5`}>
            <L label={T.profit} style={tw`text-black`} />
            <Text style={tw`text-black font-bold`}>{fmt(order.profit)}</Text>
          </View>
        ) : null}
      </View>

      {settings.receipt_footer ? (
        <Text style={[tw`text-center text-xs text-black border-t border-dashed border-neutral-300`, { marginTop: hp(1.5), paddingTop: hp(1.5) }]}>
          {settings.receipt_footer}
        </Text>
      ) : null}
    </View>
  );
}
