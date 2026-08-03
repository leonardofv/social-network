import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { Brand } from '@/constants/Colors';
import { PostService } from '@/services/post.service';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

export default function CreatePostScreen() {
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const keyboardHeight = useKeyboardHeight();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7,
    });

    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
  };

  const publish = async () => {
    if (!imageUri) {
      setError('Selecione uma imagem.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await PostService.createPost(imageUri, description.trim() || undefined);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível conectar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Novo post</Text>

          <Pressable style={styles.picker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
            ) : (
              <View style={styles.pickerPlaceholder}>
                <Ionicons name="image-outline" size={32} color={Brand.textMuted} />
                <Text style={styles.pickerText}>Escolher imagem</Text>
              </View>
            )}
          </Pressable>

          <TextField
            label={`Descrição (${description.length}/160)`}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={160}
            returnKeyType="done"
          />

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton title="Publicar" onPress={publish} loading={saving} />
        </View>
      </ScrollView>
      <View style={{ height: keyboardHeight }} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: Brand.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  title: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: Brand.text,
    marginBottom: 4,
  },
  picker: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Brand.background,
  },
  pickerPlaceholder: {
    aspectRatio: 4 / 5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
  },
  pickerText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.textMuted,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 5,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
  },
});