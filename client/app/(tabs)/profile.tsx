import { Brand } from '@/constants/Colors';
import { UserProfile, UserService } from '@/services/user.service';
import { clearToken } from '@/utils';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await UserService.getMe();
        setUser(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Sessão expirada')
        ) {
          await clearToken();
          router.replace('/login');
          return;
        }
        setError(
          error instanceof Error ? error.message : 'Não foi possível conectar',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    setUploading(true);

    try {
      const { profilePicture } = await UserService.uploadProfilePicture(
        result.assets[0].uri,
      );
      setUser((prev) => (prev ? { ...prev, profilePicture } : prev));
    } catch {
      setError('Não foi possível enviar a foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={pickImage} disabled={uploading}>
        {user?.profilePicture ? (
          <Image
            source={{ uri: `${API_URL}${user.profilePicture}` }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{user?.name?.[0] ?? '?'}</Text>
          </View>
        )}
        <View style={styles.cameraBadge}>
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={16} color="#fff" />
          )}
        </View>
      </Pressable>
      <Text style={styles.name}>{user?.name ?? user?.username}</Text>
      <Text style={styles.email}>{user?.username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  center: {
    flex: 1,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'LatoBold',
    fontSize: 22,
    color: Brand.text,
  },
  email: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.textMuted,
  },
  bio: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.text,
    textAlign: 'center',
    marginTop: 8,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'LatoBold',
    fontSize: 36,
    color: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Brand.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Brand.background,
  },
});
