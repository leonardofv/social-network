import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  Pressable,
  View,
} from 'react-native';
import { Brand } from '@/constants/Colors';

type TextFieldProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
};

export function TextField({
  label,
  icon,
  error,
  secureTextEntry,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  const borderColor = error
    ? Brand.error
    : focused
      ? Brand.primary
      : Brand.border;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? Brand.primary : Brand.textMuted}
          />
        )}
        <TextInput
          style={[styles.input, webNoOutline]}
          placeholderTextColor={Brand.textMuted}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden(!hidden)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Brand.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// remove o outline azul padrão do navegador (a borda do wrapper já indica o foco)
const webNoOutline: TextStyle | undefined =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as TextStyle) : undefined;

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: Brand.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: Brand.surface,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: 'Lato',
    fontSize: 16,
    color: Brand.text,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 13,
    color: Brand.error,
  },
});
