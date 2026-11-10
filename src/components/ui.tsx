import React, { useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type SwitchProps,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { HeaderHeightContext } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { both, isBi, T, type Bi, type Label } from '../i18n/labels';
import { colors, fonts } from '../theme';
import { hp, wp } from '../utils/responsive';

export { tw };

// Nastaleeq looks smaller than Latin at the same point size and its strokes reach far above and below the baseline.
const URDU_SCALE = 1.2;
const URDU_LINE_HEIGHT = 1.7;
const URDU_CHARS = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
const HAS_URDU = new RegExp(`[${URDU_CHARS}]`);
const URDU_RUN = new RegExp(`([${URDU_CHARS}](?:[\\s${URDU_CHARS}]*[${URDU_CHARS}])?)`);

const sizeOf = (style: StyleProp<TextStyle>) => StyleSheet.flatten(style)?.fontSize ?? 14;

/** Nastaleeq font sized to sit next to Latin text whose font size is `latinSize`. */
export function urduFont(latinSize: number): TextStyle {
  return { fontFamily: fonts.urdu, fontWeight: 'normal', fontSize: Math.round(latinSize * URDU_SCALE) };
}

/** Line height that keeps Nastaleeq ascenders and descenders from being clipped. */
export function urduLineHeight(latinSize: number): TextStyle {
  return { lineHeight: Math.round(latinSize * URDU_SCALE * URDU_LINE_HEIGHT) };
}

/** Style for a nested Urdu span: no own lineHeight, so the paragraph's (Urdu-safe) one applies on both platforms. */
function urduSpan(style: StyleProp<TextStyle>): TextStyle {
  return { ...StyleSheet.flatten(style), ...urduFont(sizeOf(style)), lineHeight: undefined };
}

/** Text that renders any Urdu runs inside its string content in Nastaleeq. */
export function UrText({ children, style, numberOfLines }: { children?: React.ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  const parts = React.Children.toArray(children);
  const text = parts.every(p => typeof p === 'string' || typeof p === 'number') ? parts.join('') : null;
  if (text === null || !HAS_URDU.test(text)) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {children}
      </Text>
    );
  }
  const size = sizeOf(style);
  return (
    <Text style={[style, urduLineHeight(size)]} numberOfLines={numberOfLines}>
      {text.split(URDU_RUN).map((seg, i) =>
        i % 2 ? (
          <Text key={i} style={urduSpan(style)}>
            {seg}
          </Text>
        ) : (
          seg
        ),
      )}
    </Text>
  );
}

/**
 * Renders a label in English with its Urdu translation.
 * `inline` keeps both on one line (rows, chips); otherwise Urdu sits on a smaller second line.
 */
export function BiText({
  label,
  style,
  urStyle,
  inline,
  numberOfLines,
}: {
  label: Label;
  style?: StyleProp<TextStyle>;
  urStyle?: StyleProp<TextStyle>;
  inline?: boolean;
  numberOfLines?: number;
}) {
  if (!isBi(label)) {
    return (
      <UrText style={style} numberOfLines={numberOfLines}>
        {label}
      </UrText>
    );
  }
  if (inline) {
    const urBase = [style, tw`font-normal`, urStyle];
    return (
      <Text style={[style, urduLineHeight(sizeOf(urBase))]} numberOfLines={numberOfLines}>
        {label.en}
        <Text style={urduSpan(urBase)}>{`  ${label.ur}`}</Text>
      </Text>
    );
  }
  const urBase = [style, tw`text-xs`, urStyle];
  const size = sizeOf(urBase);
  return (
    <>
      <Text style={style} numberOfLines={numberOfLines}>
        {label.en}
      </Text>
      <Text style={[urBase, urduFont(size), urduLineHeight(size), styles.rtl]} numberOfLines={numberOfLines}>
        {label.ur}
      </Text>
    </>
  );
}

/** English on the left, Urdu on the right, as used above inputs. */
function FieldLabel({ label }: { label: Label }) {
  if (!isBi(label)) {
    return <UrText style={tw`text-xs font-semibold text-black mb-1`}>{label}</UrText>;
  }
  return (
    <View style={tw`flex-row justify-between items-end mb-1`}>
      <Text style={tw`text-xs font-semibold text-black flex-shrink mr-2`}>{label.en}</Text>
      <Text style={[tw`text-xs text-black`, urduFont(12), urduLineHeight(12), styles.rtl]}>{label.ur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ rtl: { writingDirection: 'rtl' } });

/** Slim bar replacing the navigation header: Back on the left, an optional action (e.g. Delete) on the right. */
function TopBar({ onBack, right }: { onBack?: () => void; right?: React.ReactNode }) {
  return (
    <View style={[tw`flex-row items-center justify-between border-b border-neutral-200`, { paddingHorizontal: wp(3), minHeight: hp(6) }]}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={({ pressed }) => [tw`flex-row items-center`, pressed && tw`opacity-60`]}>
          <Text style={tw`text-3xl leading-8 text-black mr-1`}>‹</Text>
          <BiText label={T.back} inline style={tw`text-base font-semibold text-black`} />
        </Pressable>
      ) : (
        <View />
      )}
      {right}
    </View>
  );
}

export function Screen({
  children,
  scroll = false,
  style,
  right,
}: {
  children?: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // KeyboardAvoidingView measures its frame relative to its parent, so any header above it must be added back.
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  // iOS scroll screens use automaticallyAdjustKeyboardInsets, which also scrolls the focused input into view.
  const avoid = !scroll || Platform.OS === 'android';
  const pushed = navigation.getState()?.type === 'stack';

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1 bg-white`, { paddingTop: insets.top }]}
      behavior="padding"
      enabled={avoid}
      keyboardVerticalOffset={headerHeight}>
      {pushed || right ? <TopBar onBack={pushed ? navigation.goBack : undefined} right={right} /> : null}
      {scroll ? (
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={[{ padding: wp(4), paddingBottom: insets.bottom + hp(4) }, style]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
          {children}
        </ScrollView>
      ) : (
        <View style={[tw`flex-1`, style]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
}

export function Field({
  label,
  hint,
  placeholder,
  style,
  ...props
}: Omit<TextInputProps, 'placeholder'> & { label?: Label; hint?: Label; placeholder?: Label }) {
  return (
    <View style={{ marginBottom: hp(1.5) }}>
      {label ? <FieldLabel label={label} /> : null}
      <TextInput
        placeholderTextColor={colors.faint}
        placeholder={placeholder ? both(placeholder, ' · ') : undefined}
        style={[
          tw`bg-white border border-neutral-300 rounded-xl text-base text-black`,
          { paddingHorizontal: wp(3), paddingVertical: hp(1.2), minHeight: hp(6) },
          props.multiline ? { minHeight: hp(11) } : null,
          style,
        ]}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
      />
      {hint ? <BiText label={hint} inline style={tw`text-xs text-black mt-1`} /> : null}
    </View>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'whatsapp';

const btnStyles: Record<BtnVariant, { box: string; text: string; spinner: string }> = {
  primary: { box: 'bg-black', text: 'text-white', spinner: colors.white },
  secondary: { box: 'bg-neutral-100 border border-neutral-200', text: 'text-black', spinner: colors.black },
  danger: { box: 'bg-red-600', text: 'text-white', spinner: colors.white },
  outline: { box: 'bg-white border border-black', text: 'text-black', spinner: colors.black },
  whatsapp: { box: 'bg-green-600', text: 'text-white', spinner: colors.white },
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
  title: Label;
  onPress?: () => void;
  variant?: BtnVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const s = btnStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        tw`${s.box} rounded-xl items-center justify-center flex-row`,
        small
          ? { minHeight: hp(4.5), paddingHorizontal: wp(3), paddingVertical: hp(0.6) }
          : { minHeight: hp(6.5), paddingHorizontal: wp(4), paddingVertical: hp(1) },
        (pressed || disabled) && tw`opacity-70`,
        style,
      ]}>
      {loading ? <ActivityIndicator color={s.spinner} style={tw`mr-2`} /> : null}
      <View style={tw`items-center flex-shrink`}>
        <BiText label={title} style={tw`${s.text} font-bold text-center ${small ? 'text-sm' : 'text-base'}`} />
      </View>
    </Pressable>
  );
}

export function Card({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const base = [tw`bg-white rounded-2xl border border-neutral-200`, { padding: wp(4), marginBottom: hp(1.5) }];
  if (!onPress) {
    return <View style={[...base, style]}>{children}</View>;
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [...base, pressed && tw`bg-neutral-100`, style]}>
      {children}
    </Pressable>
  );
}

export function SectionTitle({ children, right }: { children: Label; right?: React.ReactNode }) {
  return (
    <View style={[tw`flex-row items-center justify-between`, { marginTop: hp(1), marginBottom: hp(1) }]}>
      <View style={tw`flex-1 mr-2`}>
        <BiText label={children} inline style={tw`text-sm font-bold text-black uppercase`} />
      </View>
      {right}
    </View>
  );
}

export function Row({ label, value, bold, color }: { label: Label; value: string; bold?: boolean; color?: string }) {
  return (
    <View style={tw`flex-row justify-between items-center py-1`}>
      <View style={tw`flex-1 mr-2`}>
        <BiText label={label} inline style={tw`text-black ${bold ? 'font-bold' : ''}`} urStyle={tw`text-xs`} />
      </View>
      <Text style={tw`${bold ? 'font-bold text-base' : 'font-semibold'} ${color ?? 'text-black'} flex-shrink text-right`}>{value}</Text>
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder = T.search }: { value: string; onChangeText: (t: string) => void; placeholder?: Label }) {
  return (
    <View style={{ paddingHorizontal: wp(4), paddingTop: hp(1.5), paddingBottom: hp(0.5) }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={both(placeholder, ' · ')}
        placeholderTextColor={colors.faint}
        returnKeyType="search"
        style={[tw`bg-neutral-100 border border-neutral-200 rounded-xl text-base text-black`, { paddingHorizontal: wp(4), minHeight: hp(5.5) }]}
      />
    </View>
  );
}

export function Empty({ text }: { text: Label }) {
  return (
    <View style={[tw`items-center justify-center`, { paddingVertical: hp(8), paddingHorizontal: wp(6) }]}>
      <Text style={tw`text-4xl mb-2`}>🫙</Text>
      <BiText label={text} style={tw`text-black text-base text-center`} />
    </View>
  );
}

export function Fab({ onPress, label = '+' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tw`absolute bg-black rounded-full items-center justify-center shadow-lg`,
        { right: wp(5), bottom: hp(2.5), height: hp(7), minWidth: hp(7), paddingHorizontal: wp(4) },
        pressed && tw`opacity-80`,
      ]}>
      <Text style={tw`text-white text-2xl font-bold`}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: Label; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        tw`rounded-full mr-2 mb-2 border ${active ? 'bg-black border-black' : 'bg-white border-neutral-300'}`,
        { paddingHorizontal: wp(3), paddingVertical: hp(0.8) },
      ]}>
      <BiText
        label={label}
        inline
        style={tw`text-sm font-semibold ${active ? 'text-white' : 'text-black'}`}
      />
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: Label; value: T; activeStyle?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={[tw`flex-row bg-neutral-100 rounded-xl p-1`, { marginBottom: hp(1.5) }]}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[tw`flex-1 rounded-lg items-center justify-center ${active ? o.activeStyle ?? 'bg-black' : ''}`, { paddingVertical: hp(1) }]}>
            <BiText label={o.label} style={tw`font-bold text-center ${active ? 'text-white' : 'text-black'}`} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function ThemedSwitch(props: SwitchProps) {
  return (
    <Switch
      trackColor={{ false: colors.border, true: colors.black }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.border}
      {...props}
    />
  );
}

/** Tappable field that opens a searchable list. */
export function SelectField({ label, value, placeholder, onPress }: { label?: Label; value?: string | null; placeholder: Label; onPress: () => void }) {
  return (
    <View style={{ marginBottom: hp(1.5) }}>
      {label ? <FieldLabel label={label} /> : null}
      <Pressable
        onPress={onPress}
        style={[tw`bg-white border border-neutral-300 rounded-xl flex-row justify-between items-center`, { paddingHorizontal: wp(3), minHeight: hp(6) }]}>
        <View style={tw`flex-1`}>
          <UrText style={tw`text-base ${value ? 'text-black' : 'text-neutral-400'}`} numberOfLines={1}>
            {value || both(placeholder, ' · ')}
          </UrText>
        </View>
        <Text style={tw`text-black ml-2`}>▾</Text>
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
  title: Label;
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView style={tw`flex-1`} behavior="padding">
        <View style={tw`flex-1 bg-black/50 justify-end`}>
          <Pressable style={tw`flex-1`} onPress={onClose} />
          <View style={[tw`bg-white rounded-t-3xl max-h-[85%]`, { paddingBottom: insets.bottom + hp(1) }]}>
            <View style={[tw`flex-row justify-between items-center`, { paddingHorizontal: wp(4), paddingTop: hp(2) }]}>
              <View style={tw`flex-1 mr-2`}>
                <BiText label={title} style={tw`text-lg font-bold text-black`} />
              </View>
              <HeaderButton title={T.close} onPress={onClose} />
            </View>
            <SearchBar value={search} onChangeText={setSearch} />
            <FlatList
              data={filtered}
              keyExtractor={d => String(getKey(d))}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ padding: wp(4) }}
              ListEmptyComponent={<Empty text={T.nothingFound} />}
              renderItem={({ item }) => (
                <Card
                  onPress={() => {
                    setSearch('');
                    onSelect(item);
                  }}
                  style={{ marginBottom: hp(1), padding: wp(3) }}>
                  <UrText style={tw`text-base font-semibold text-black`}>{getLabel(item)}</UrText>
                  {getSubtitle ? <UrText style={tw`text-sm text-black mt-0.5`}>{getSubtitle(item)}</UrText> : null}
                </Card>
              )}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function HeaderButton({ title, onPress }: { title: Label; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => [tw`px-2 items-center`, pressed && tw`opacity-60`]}>
      <BiText label={title} style={tw`text-black font-bold text-sm text-center`} />
    </Pressable>
  );
}

/** Red pill for deleting the record a screen shows; pass it to `Screen`'s `right` slot. */
export function DeleteButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [tw`bg-red-600 rounded-lg items-center`, { paddingHorizontal: wp(3), paddingVertical: hp(0.4) }, pressed && tw`opacity-70`]}>
      <BiText label={T.delete} style={tw`text-white font-bold text-xs text-center`} />
    </Pressable>
  );
}

/** Small red text button for removing a line inside a form. */
export function RemoveButton({ onPress, label = T.remove }: { onPress: () => void; label?: Bi }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [tw`bg-red-600 rounded-lg items-center`, { paddingHorizontal: wp(2.5), paddingVertical: hp(0.5) }, pressed && tw`opacity-70`]}>
      <BiText label={label} style={tw`text-white font-bold text-xs text-center`} />
    </Pressable>
  );
}

export function showAlert(title: Bi, message?: Label) {
  Alert.alert(both(title), message ? both(message, '\n') : undefined);
}

export function confirmDestructive({
  title,
  message,
  confirmText = T.delete,
  onConfirm,
}: {
  title: Bi;
  message?: Bi;
  confirmText?: Bi;
  onConfirm: () => void;
}) {
  Alert.alert(both(title), message ? both(message, '\n\n') : undefined, [
    { text: both(T.cancel), style: 'cancel' },
    { text: both(confirmText), style: 'destructive', onPress: onConfirm },
  ]);
}
