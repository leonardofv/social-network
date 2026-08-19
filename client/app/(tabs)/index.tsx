import { UserAvatar } from '@/components/ui/UserAvatar';
import { Brand } from '@/constants/Colors';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { PostService, PostWithAuthor } from '@/services/post.service';
import { Ionicons } from '@expo/vector-icons';
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

  const toggleLike = async (post: PostWithAuthor) => {
    const liked = post.likedByMe;
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, likedByMe: !liked, likeCount: p.likeCount + (liked ? -1 : 1)} : p ));

    try {
      if (liked) {
        await PostService.unlike(post.id);
      } else {
        await PostService.like(post.id);
      }
    } catch(error) {
        if (await handleSessionExpired(error)) return;
        loadFeed(); 
      }
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
            <UserAvatar name={item.authorName} picture={item.authorProfilePicture}/>
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
          <View style={styles.likeRow}>
            <Pressable 
            onPress={() => toggleLike(item)} 
            hitSlop={8} 
            accessibilityRole="button" 
            accessibilityLabel={item.likedByMe ? 'Descurtir' : 'Curtir'}
            >
              <Ionicons 
                name={item.likedByMe ? 'heart' : 'heart-outline'}
                size={24}
                color={item.likedByMe ? Brand.primary : Brand.text}
              />
            </Pressable>
            <Text style={styles.likeCount}>{item.likeCount}</Text>
            <Pressable
              onPress={() => router.push(`/post/${item.id}`)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Ver comentários"
            >
              <Ionicons name="chatbubble-outline" size={24} color={Brand.text}/>
            </Pressable>
          </View>
        </View>
      )}
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
    paddingTop: 10,
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
  likeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 12,
  paddingTop: 8,
  },
  likeCount: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: Brand.text,
  },
});
