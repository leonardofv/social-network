import { Brand } from '@/constants/Colors';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { Post, PostService } from '@/services/post.service';
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

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleSessionExpired = useSessionGuard();

  useEffect(() => {
    PostService.getById(Number(id))
      .then(setPost)
      .catch(async (err) => {
        //o hook já limpa o token e redireciona pro login.
        if (await handleSessionExpired(err)) return;
        setError(err instanceof Error ? err.message : 'Não foi possível conectar');
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
