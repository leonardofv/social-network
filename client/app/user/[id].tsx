import { UserAvatar } from '@/components/ui/UserAvatar';
import { Brand } from '@/constants/Colors';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { Post, PostService } from '@/services/post.service';
import { PublicProfile, UserService } from '@/services/user.service';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  StyleSheet,
} from 'react-native';

const GRID_COLUMNS = 3;
const GRID_GAP = 2;
const MAX_CONTENT_WIDTH = 420;
const HEADER_PADDING = 24;
const AVATAR_SIZE = 80;
const HEADER_GUTTER = 10;

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleSessionExpired = useSessionGuard();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const gridItemSize =
    (contentWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  useEffect(() => {
    Promise.all([
      UserService.getUserById(userId),
      PostService.getUserPosts(userId),
    ])
      .then(([loadedProfile, loadedPosts]) => {
        setProfile(loadedProfile);
        setPosts(loadedPosts);
      })
      .catch(async (err) => {
        if (await handleSessionExpired(err)) return;
        setError(
          err instanceof Error ? err.message : 'Não foi possível conectar',
        );
      })
      .finally(() => setLoading(false));
  }, [userId, handleSessionExpired]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text style={[styles.message, styles.messageError]}>
          {error || 'Usuário não encontrado'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponentStyle={styles.fullWidth}
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
            <UserAvatar
              name={profile.name}
              picture={profile.profilePicture}
              size={AVATAR_SIZE}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.username}>{profile.username}</Text>
            </View>
          </View>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.message, styles.listMessage]}>
          Nenhuma publicação ainda
        </Text>
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
  gridRow: {
    gap: GRID_GAP,
  },
  gridSeparator: {
    height: GRID_GAP,
  },
});
