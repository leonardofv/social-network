import { Brand } from '@/constants/Colors';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { PostService, PostWithAuthor } from '@/services/post.service';
import { clearToken } from '@/utils';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const handleSessionExpired = useSessionGuard();

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await PostService.getFeed());
      setError('');
    } catch (error) {
      if (await handleSessionExpired(error)) return;
      setError(
        error instanceof Error ? error.message : 'Não foi possível conectar',
      );
    } finally {
      setLoading(false);
    }
  }, [handleSessionExpired]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed]),
  );

  const onLogout = async () => {
    await clearToken();
    router.replace('/login');
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <View>
          <View style={styles.authorRow}>
            {item.authorProfilePicture ? (
              <Image 
                source={{ uri: mediaUrl(item.authorProfilePicture) }}
                style={styles.authorAvatar}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder]}>
                <Text style={styles.authorInitial}>{item.authorName[0]}</Text>
              </View>
            )}
            <Text style={styles.authorName}>{item.authorName}</Text>
          </View>
          <Pressable onPress={() => router.push(`/post/${item.id}`)}>
            <Image
              source={{ uri: mediaUrl(item.path) }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
          </Pressable>
        </View>
      )}
      ListHeaderComponent={
        <Pressable onPress={onLogout} style={styles.logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={Brand.primary} style={styles.loading} />
        ) : (
          <Text style={[styles.message, error ? styles.messageError : null]}>
            {error || 'Nenhuma publicação ainda'}
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  description: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.text,
    padding: 12,
  },
  separator: {
    height: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorAvatarPlaceholder: {
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#fff',
  },
  authorName: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: Brand.text,
  },

  loading: {
    marginTop: 24,
  },
  message: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  messageError: {
    color: Brand.error,
  },
  logout: {
    alignSelf: 'flex-end',
    padding: 12,
  },
  logoutText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
  },
});
