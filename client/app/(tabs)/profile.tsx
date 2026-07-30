import { Brand } from '@/constants/Colors';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { Post, PostService } from '@/services/post.service';
import { UserProfile, UserService } from '@/services/user.service';
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
const IS_WEB = Platform.OS === 'web';

const showError = (message: string) => {
  if (IS_WEB) {
    window.alert(message);
    return;
  }
  Alert.alert('Erro', message);
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [postsError, setPostsError] = useState('');

  const router = useRouter();
  const handleSessionExpired = useSessionGuard();

  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const gridItemSize = (contentWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const loadProfile = useCallback(async () => {
    try {
      setUser(await UserService.getMe());
      setError('');
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      setError(err instanceof Error ? err.message : 'Não foi possível conectar');
    } finally {
      setLoading(false);
    }
  }, [handleSessionExpired]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      setPosts(await PostService.getMyPosts());
      setPostsError('');
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      setPostsError('Não foi possível carregar as publicações');
    } finally {
      setPostsLoading(false);
    }
  }, [handleSessionExpired]);

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

  // A partir daqui `user` é garantido, o que dispensa optional chaining abaixo.
  if (error || !user) {
    return (
      <View style={styles.center}>
        <Text style={[styles.message, styles.messageError]}>
          {error || 'Não foi possível carregar o perfil'}
        </Text>
      </View>
    );
  }

  const avatarUri = user.profilePicture && mediaUrl(user.profilePicture);

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
      setUser({ ...user, profilePicture });
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      showError(
        err instanceof Error ? err.message : 'Não foi possível enviar a foto',
      );
    } finally {
      setUploading(false);
    }
  };

  const removePicture = async () => {
    setUploading(true);
    try {
      await UserService.deleteProfilePicture();
      setUser({ ...user, profilePicture: null });
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      showError('Não foi possível remover a foto');
    } finally {
      setUploading(false);
    }
  };

  const onAvatarPress = () => {
    //remoção no link abaixo.
    if (!avatarUri || IS_WEB) {
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
    if (window.confirm('Remover a foto de perfil?')) removePicture();
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
        <Pressable onPress={() => router.push(`/post/${item.id}`)}>
          <Image
            source={{ uri: mediaUrl(item.path) }}
            style={{ width: gridItemSize, height: gridItemSize }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </Pressable>
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarColumn}>
              <Pressable onPress={onAvatarPress} disabled={uploading}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>{user.name[0]}</Text>
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
              {IS_WEB && avatarUri && (
                <Pressable onPress={onRemovePress} disabled={uploading}>
                  <Text style={styles.removePhoto}>Remover foto</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user.name}</Text>
                <Pressable
                  onPress={() => router.push('/edit-profile')}
                  hitSlop={8}
                >
                  <Ionicons name="pencil" size={16} color={Brand.textMuted} />
                </Pressable>
              </View>
              <Text style={styles.email}>{user.username}</Text>
            </View>
          </View>

          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
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
          <Text
            style={[
              styles.message,
              styles.listMessage,
              postsError ? styles.messageError : null,
            ]}
          >
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
  message: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.textMuted,
    textAlign: 'center',
  },
  messageError: {
    color: Brand.error,
  },
  listMessage: {
    marginTop: 24,
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
    marginTop: 4,
  },
  gridRow: {
    width: '100%',
    gap: GRID_GAP,
  },
  gridSeparator: {
    height: GRID_GAP,
  },
});
