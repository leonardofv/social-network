import { Brand } from '@/constants/Colors';
import { Post, PostService } from '@/services/post.service';
import { UserProfile, UserService } from '@/services/user.service';
import { clearToken } from '@/utils';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const GRID_COLUMNS = 3;
const GRID_GAP = 2;
const MAX_CONTENT_WIDTH = 420;
const HEADER_PADDING = 24;

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [postsError, setPostsError] = useState('');

  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const gridItemSize = (contentWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await UserService.getMe();
      setUser(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Sessão expirada')) {
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
  }, [router]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const myPosts = await PostService.getMyPosts();
      setPosts(myPosts);
      setPostsError('');
    } catch {
      setPostsError('Não foi possível carregar as publicações');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadPosts();
    }, [loadProfile, loadPosts]),
  );

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

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
      return;
    }
    Alert.alert('Erro', message);
  };

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
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a foto',
      );
    } finally {
      setUploading(false);
    }
  };

  const removePicture = async () => {
    setUploading(true);
    try {
      await UserService.deleteProfilePicture();
      setUser((prev) => (prev ? { ...prev, profilePicture: null } : prev));
    } catch {
      showError('Não foi possível remover a foto');
    } finally {
      setUploading(false);
    }
  };

  const onAvatarPress = () => {
    if (!user?.profilePicture || Platform.OS === 'web') {
      pickImage();
      return;
    }

    Alert.alert('Foto de perfil', undefined, [
      { text: 'Alterar foto', onPress: pickImage },
      { text: 'Remover foto', style: 'destructive', onPress: removePicture },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const onRemovePress = () => {
    const confirmed = window.confirm('Remover a foto de perfil ?');
    if (confirmed) removePicture();
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.gridRow}
      ItemSeparatorComponent={() => <View style={styles.gridSeparator} />}
      renderItem={({ item }) => (
        <Image
          source={{ uri: `${API_URL}${item.path}` }}
          style={{ width: gridItemSize, height: gridItemSize }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarColumn}>
              <Pressable onPress={onAvatarPress} disabled={uploading}>
                {user?.profilePicture ? (
                  <Image
                    source={{ uri: `${API_URL}${user.profilePicture}` }}
                    style={styles.avatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>
                      {user?.name?.[0] ?? '?'}
                    </Text>
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
              {Platform.OS === 'web' && user?.profilePicture && (
                <Pressable onPress={onRemovePress} disabled={uploading}>
                  <Text style={styles.removePhoto}>Remover foto</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user?.name ?? user?.username}</Text>
                <Pressable onPress={() => router.push('/edit-profile')} hitSlop={8}>
                  <Ionicons name="pencil" size={16} color={Brand.textMuted} />
                </Pressable>
              </View>
              <Text style={styles.email}>{user?.username}</Text>
            </View>
          </View>

          {user?.bio && <Text style={styles.bio}>{user?.bio}</Text>}
          <Pressable
            onPress={() => router.push('/create-post')}
            style={styles.newPostButton}
          >
            <Ionicons name="add-circle-outline" size={18} />
          </Pressable>
        </View>
      }
      ListEmptyComponent={
        postsLoading ? (
          <ActivityIndicator color={Brand.primary} />
        ) : (
          <Text style={postsError ? styles.postsError : styles.emptyText}>
            {postsError || 'Nenhuma publicação ainda'}
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    alignItems: 'center',
    paddingVertical: HEADER_PADDING,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: HEADER_PADDING,
    gap: 8,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarColumn: {
    alignItems: 'center',
    gap: 4,
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
  removePhoto: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
  },
  headerInfo: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridSeparator: {
    height: GRID_GAP,
  },
  emptyText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.textMuted,
    marginTop: 24,
  },
  postsError: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    marginTop: 24,
  },
});