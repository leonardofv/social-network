import { CommentInput } from '@/components/CommentInput';
import { CommentItem } from '@/components/CommentItem';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Brand } from '@/constants/Colors';
import { useCurrentUser } from '@/contexts/UserContext';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { mediaUrl } from '@/services/api';
import { CommentService, CommentWithAuthor } from '@/services/comment.service';
import { PostWithAuthor, PostService } from '@/services/post.service';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const showError = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
    return;
  }
  Alert.alert('Erro', message);
};

const confirmDelete = (title: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(title)) onConfirm();
    return;
  }

  Alert.alert(title, 'Essa ação não pode ser desfeita.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: onConfirm },
  ]);
};

export default function PostDetailScreen() {
  // id vem do segmento dinâmico da rota (client/app/post/[id].tsx)
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const { user } = useCurrentUser();
  const router = useRouter();
  const keyboardHeight = useKeyboardHeight();

  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleSessionExpired = useSessionGuard();
  const [deleting, setDeleting] = useState(false);
  const listRef = useRef<FlatList<CommentWithAuthor>>(null);

  useEffect(() => {
    Promise.all([
      PostService.getById(postId),
      CommentService.getByPostId(postId),
    ])
      .then(([loadedPost, loadedComments]) => {
        setPost(loadedPost);
        setComments(loadedComments);
      })
      .catch(async (err) => {
        if (await handleSessionExpired(err)) return;
        setError(
          err instanceof Error ? err.message : 'Não foi possível conectar',
        );
      })
      .finally(() => setLoading(false));
  }, [postId, handleSessionExpired]);

  const addComment = async (content: string) => {
    try {
      const created = await CommentService.create(postId, content);
      setComments((prev) => [...prev, created]);
      listRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      throw err; // o CommentInput mostra a mensagem e preserva o texto
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await CommentService.remove(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      showError(
        err instanceof Error ? err.message : 'Não foi possível excluir',
      );
    }
  };

  const toggleLike = async () => {
    if (!post) return;
    const liked = post.likedByMe;
    setPost({
      ...post,
      likedByMe: !liked,
      likeCount: post.likeCount + (liked ? -1 : 1),
    });
    try {
      if (liked) {
        await PostService.unlike(postId);
      } else {
        await PostService.like(postId);
      }
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      setPost(post); // reverte para o estado anterior ao toque
    }
  };

  const deletePost = async () => {
    setDeleting(true);
    try {
      await PostService.remove(postId);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setDeleting(false);
      if (await handleSessionExpired(error)) return;
      showError(
        error instanceof Error ? error.message : 'Não foi possível excluir',
      );
    }
  };

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
    <View style={styles.flex}>
      {post.userId === user?.id && (
        <Stack.Screen 
          options={{
            headerRight: () => (
              <Pressable
                onPress={() => confirmDelete('Excluir publicação ?', deletePost)}
                disabled={deleting}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Excluir Publicação"
              >
                <Ionicons name="trash-outline" size={20} color={Brand.primary} />
              </Pressable>
            )
          }}
        />
      )}
      <FlatList
        ref={listRef}
        style={styles.flex}
        contentContainerStyle={styles.container}
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            onDelete={
              item.userId === user?.id
                ? () => confirmDelete('Excluir comentário', () => deleteComment(item.id))
                : undefined
            }
          />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.authorRow}>
              <UserAvatar
                name={post.authorName}
                picture={post.authorProfilePicture}
              />
              <Text style={styles.authorName}>{post.authorName}</Text>
            </View>
            <Image
              source={{ uri: mediaUrl(post.path) }}
              style={styles.image}
              contentFit="cover"
            />
            <View style={styles.likeRow}>
              <Pressable
                onPress={toggleLike}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={post.likedByMe ? 'Descurtir' : 'Curtir'}
              >
                <Ionicons
                  name={post.likedByMe ? 'heart' : 'heart-outline'}
                  size={24}
                  color={post.likedByMe ? Brand.primary : Brand.text}
                />
              </Pressable>
              <Text style={styles.likeCount}>{post.likeCount}</Text>
            </View>
            {post.description && (
              <Text style={styles.description}>{post.description}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum comentário ainda</Text>
        }
      />
      <CommentInput onSubmit={addComment} />
      <View style={{ height: keyboardHeight }} />
    </View>
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
  authorName: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: Brand.text,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
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
  description: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.text,
    padding: 16,
  },
  empty: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
  },
});
