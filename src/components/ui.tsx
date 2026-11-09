import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';

export { tw };

export function Screen({ children, scroll = false, style }: { children?: React.ReactNode; scroll?: boolean; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  if (!scroll) {
    return <View style={[tw`flex-1 bg-slate-50`, style]}>{children}</View>;
  }
  return (
    <KeyboardAvoidingView style={tw`flex-1 bg-slate-50`} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={[tw`p-4`, { paddingBottom: insets.bottom + 32 }, style]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Field({
  label,
  hint,
  style,
  ...props
}: TextInputProps & { label?: string; hint?: string }) {
  return (
    <View style={tw`mb-3`}>
      {label ? <Text style={tw`text-xs font-semibold text-slate-600 mb-1`}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#94a3b8"
        style={[
          tw`bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-base text-slate-900`,
          props.multiline ? tw`min-h-20` : null,
          style,
        ]}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
      />
      {hint ? <Text style={tw`text-xs text-slate-400 mt-1`}>{hint}</Text> : null}
    </View>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'success' | 'whatsapp';

const btnStyles: Record<BtnVariant, { box: string; text: string }> = {
  primary: { box: 'bg-violet-700', text: 'text-white' },
  secondary: { box: 'bg-violet-100', text: 'text-violet-800' },
  danger: { box: 'bg-rose-600', text: 'text-white' },
  outline: { box: 'bg-white border border-slate-300', text: 'text-slate-800' },
  success: { box: 'bg-emerald-600', text: 'text-white' },
  whatsapp: { box: 'bg-green-600', text: 'text-white' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  variant?: BtnVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}) {
  const s = btnStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        tw`${s.box} rounded-xl items-center justify-center flex-row ${small ? 'px-3 py-2' : 'px-4 py-3.5'}`,
        (pressed || disabled) && tw`opacity-70`,
        style,
      ]}>
      {loading ? <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? '#5b21b6' : '#fff'} /> : null}
      <Text style={tw`${s.text} font-bold ${small ? 'text-sm' : 'text-base'} ${loading ? 'ml-2' : ''}`}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) {
  const base = tw`bg-white rounded-2xl p-4 mb-3 border border-slate-100`;
  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && tw`bg-slate-100`, style]}>
      {children}
    </Pressable>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={tw`flex-row items-center justify-between mt-2 mb-2`}>
      <Text style={tw`text-sm font-bold text-slate-500 uppercase`}>{children}</Text>
      {right}
    </View>
  );
}

export function Row({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <View style={tw`flex-row justify-between py-1`}>
      <Text style={tw`text-slate-600 ${bold ? 'font-bold text-slate-900' : ''}`}>{label}</Text>
      <Text style={tw`${bold ? 'font-bold text-base' : 'font-semibold'} ${color ?? 'text-slate-900'}`}>{value}</Text>
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...' }: { value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  return (
    <View style={tw`px-4 pt-3 pb-1`}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={tw`bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-base text-slate-900`}
      />
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={tw`items-center justify-center py-16`}>
      <Text style={tw`text-4xl mb-2`}>🫙</Text>
      <Text style={tw`text-slate-400 text-base`}>{text}</Text>
    </View>
  );
}

export function Fab({ onPress, label = '+' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tw`absolute right-5 bottom-5 bg-violet-700 rounded-full h-14 px-5 items-center justify-center shadow-lg`,
        pressed && tw`opacity-80`,
      ]}>
      <Text style={tw`text-white text-2xl font-bold`}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={tw`px-3 py-1.5 rounded-full mr-2 mb-2 border ${active ? 'bg-violet-700 border-violet-700' : 'bg-white border-slate-300'}`}>
      <Text style={tw`text-sm font-semibold ${active ? 'text-white' : 'text-slate-700'}`}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; activeStyle?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={tw`flex-row bg-slate-200 rounded-xl p-1 mb-3`}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={tw`flex-1 py-2 rounded-lg items-center ${active ? o.activeStyle ?? 'bg-white' : ''}`}>
            <Text style={tw`font-bold ${active ? (o.activeStyle ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Tappable field that opens a searchable list. */
export function SelectField({ label, value, placeholder, onPress }: { label?: string; value?: string | null; placeholder: string; onPress: () => void }) {
  return (
    <View style={tw`mb-3`}>
      {label ? <Text style={tw`text-xs font-semibold text-slate-600 mb-1`}>{label}</Text> : null}
      <Pressable onPress={onPress} style={tw`bg-white border border-slate-200 rounded-xl px-3 py-3 flex-row justify-between items-center`}>
        <Text style={tw`text-base ${value ? 'text-slate-900' : 'text-slate-400'}`} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={tw`text-slate-400`}>▾</Text>
      </Pressable>
    </View>
  );
}

export function PickerModal<T>({
  visible,
  title,
  data,
  onClose,
  onSelect,
  getKey,
  getLabel,
  getSubtitle,
}: {
  visible: boolean;
  title: string;
  data: T[];
  onClose: () => void;
  onSelect: (item: T) => void;
  getKey: (item: T) => string | number;
  getLabel: (item: T) => string;
  getSubtitle?: (item: T) => string;
}) {
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return data;
    }
    return data.filter(d => `${getLabel(d)} ${getSubtitle?.(d) ?? ''}`.toLowerCase().includes(q));
  }, [data, search, getLabel, getSubtitle]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={tw`flex-1 bg-black/40 justify-end`}>
        <View style={[tw`bg-slate-50 rounded-t-3xl max-h-[85%]`, { paddingBottom: insets.bottom + 8 }]}>
          <View style={tw`flex-row justify-between items-center px-4 pt-4`}>
            <Text style={tw`text-lg font-bold text-slate-900`}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={tw`text-violet-700 font-bold text-base`}>Close</Text>
            </Pressable>
          </View>
          <SearchBar value={search} onChangeText={setSearch} />
          <FlatList
            data={filtered}
            keyExtractor={d => String(getKey(d))}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={tw`p-4`}
            ListEmptyComponent={<Empty text="Nothing found" />}
            renderItem={({ item }) => (
              <Card
                onPress={() => {
                  setSearch('');
                  onSelect(item);
                }}
                style={tw`mb-2 p-3`}>
                <Text style={tw`text-base font-semibold text-slate-900`}>{getLabel(item)}</Text>
                {getSubtitle ? <Text style={tw`text-sm text-slate-500 mt-0.5`}>{getSubtitle(item)}</Text> : null}
              </Card>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

export function HeaderButton({ title, onPress, color = 'text-violet-700' }: { title: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={tw`px-2`}>
      <Text style={tw`${color} font-bold text-base`}>{title}</Text>
    </Pressable>
  );
}
