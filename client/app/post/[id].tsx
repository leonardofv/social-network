import { Brand } from '@/constants/Colors';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { PostWithAuthor, PostService } from '@/services/post.service';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function PostDetailScreen() {
  // id vem do segmento dinâmico da rota (client/app/post/[id].tsx)
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleSessionExpired = useSessionGuard();

  useEffect(() => {
    PostService.getById(Number(id))
      .then(setPost)
      .catch(async (err) => {
        //o hook já limpa o token e redireciona pro login.
        if (await handleSessionExpired(err)) return;
        setError(
          err instanceof Error ? err.message : 'Não foi possível conectar',
        );
      })
      .finally(() => setLoading(false));
  }, [id, handleSessionExpired]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Post não encontrado'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.authorRow}>
        {post.authorProfilePicture ? (
          <Image
            source={{ uri: mediaUrl(post.authorProfilePicture) }}
            style={styles.authorAvatar}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder]}>
            <Text style={styles.authorInitial}>{post.authorName[0]}</Text>
          </View>
        )}
        <Text style={styles.authorName}>{post.authorName}</Text>
      </View>
      <Image
        source={{ uri: mediaUrl(post.path) }}
        style={styles.image}
        contentFit="cover"
      />
      {post.description && (
        <Text style={styles.description}>{post.description}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  center: {
    flex: 1,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingBottom: 24,
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

  image: {
    width: '100%',
    aspectRatio: 1,
  },
  description: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.text,
    padding: 16,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
  },
});
