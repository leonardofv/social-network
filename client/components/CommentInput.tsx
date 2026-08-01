import { Brand } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
} from 'react-native';

const MAX_LENGTH = 500;

type CommentInputProps = {
  onSubmit: (content: string) => Promise<void>;
};

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const canSend = content.trim().length > 0 && !sending;

  const send = async () => {
    if (!canSend) return;

    setError('');
    setSending(true);
    try {
      await onSubmit(content.trim());
      setContent(''); // só limpa quando deu certo
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível comentar.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <View style={styles.bar}>
        <TextInput
          style={[styles.input, webNoOutline]}
          placeholder="Escreva um comentário..."
          placeholderTextColor={Brand.textMuted}
          value={content}
          onChangeText={setContent}
          maxLength={MAX_LENGTH}
          multiline
          editable={!sending}
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Enviar comentário"
        >
          {sending ? (
            <ActivityIndicator color={Brand.primary} />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={canSend ? Brand.primary : Brand.textMuted}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const webNoOutline: TextStyle | undefined =
  Platform.OS === 'web' ? { outlineWidth: 0 } : undefined;

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 8,
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.text,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 13,
    color: Brand.error,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
});