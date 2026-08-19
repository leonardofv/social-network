import { Brand } from '@/constants/Colors';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { Post, PostService } from '@/services/post.service';
import { UserService } from '@/services/user.service';
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
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCurrentUser } from '@/contexts/UserContext';

const GRID_COLUMNS = 3;
const GRID_GAP = 2;
const MAX_CONTENT_WIDTH = 420;
const HEADER_PADDING = 24;
const AVATAR_SIZE = 80;
const HEADER_GUTTER = 10;
const IS_WEB = Platform.OS === 'web';

const showError = (message: string) => {
  if (IS_WEB) {
    window.alert(message);
    return;
  }
  Alert.alert('Erro', message);
};

export default function ProfileScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [postsError, setPostsError] = useState('');
  const { user, refresh, logout } = useCurrentUser();
  const [menuVisible, setMenuVisible] = useState(false);

  const router = useRouter();
  const handleSessionExpired = useSessionGuard();

  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const gridItemSize =
    (contentWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const loadProfile = useCallback(async () => {
    try {
      await refresh();
      setError('');
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      setError(
        err instanceof Error ? err.message : 'Não foi possível conectar',
      );
    } finally {
      setLoading(false);
    }
  }, [handleSessionExpired, refresh]);

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
      await UserService.uploadProfilePicture(result.assets[0].uri);
      await refresh();
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
      await refresh();
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      showError('Não foi possível remover a foto');
    } finally {
      setUploading(false);
    }
  };

  const onAvatarPress = () => {
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

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        ListHeaderComponentStyle={styles.fullWidth}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={[styles.gridRow, { width: contentWidth }]}
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
                      <Ionicons name="camera" size={11} color="#fff" />
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
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.username}>{user.username}</Text>
              </View>
              <Pressable
                onPress={() => setMenuVisible(true)}
                hitSlop={8}
                accessibilityRole="button"
                style={styles.menuButton}
              >
                <Ionicons name="menu" size={24} color={Brand.text} />
              </Pressable>
            </View>

            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
            <Pressable
              onPress={() => router.push('/create-post')}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.newPostButton,
                pressed && styles.newPostButtonPressed,
              ]}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.newPostLabel}>Novo post</Text>
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
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuColumn}>
            <View style={styles.menu}>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/edit-profile');
                }}
              >
                <Ionicons name="pencil" size={16} color={Brand.text} />
                <Text style={styles.menuItemText}>Editar Perfil</Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onLogout();
                }}
              >
                <Ionicons name="log-out" size={16} color={Brand.error} />
                <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                  Sair
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
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
    alignSelf: 'stretch',
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
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: HEADER_GUTTER,
  },
  fullWidth: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarColumn: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'LatoBold',
    fontSize: AVATAR_SIZE * 0.44,
    color: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -5,
    right: 0,
    backgroundColor: Brand.primary,
    borderRadius: 14,
    width: 22,
    height: 22,
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
  name: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: Brand.text,
  },
  username: {
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
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Brand.primary,
  },
  newPostButtonPressed: {
    backgroundColor: Brand.primaryDark,
  },
  newPostLabel: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#fff',
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridSeparator: {
    height: GRID_GAP,
  },
  menuButton: {
    marginLeft: 'auto',
  },
  menuOverlay: {
    flex: 1,
    alignItems: 'center',
  },
  menuColumn: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignItems: 'flex-end',
  },
  menu: {
    marginTop: 60,
    marginRight: 16,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 180,
    elevation: 4, // sombra no Android
    shadowColor: '#000', // sombra no iOS/web
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.text,
  },
  menuItemDanger: {
    color: Brand.error,
  },
});
