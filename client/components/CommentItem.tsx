import { UserAvatar } from '@/components/ui/UserAvatar';
import { Brand } from '@/constants/Colors';
import { CommentWithAuthor } from '@/services/comment.service';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type CommentItemProps = {
  comment: CommentWithAuthor;
  onDelete?: () => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
  return (
    <View style={styles.row}>
      <UserAvatar
        name={comment.authorName}
        picture={comment.authorProfilePicture}
        size={28}
      />
      <View style={styles.body}>
        <Text style={styles.author}>{comment.authorName}</Text>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
      {onDelete && (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Excluir comentário"
        >
          <Ionicons name='trash-outline' size={18} color={Brand.textMuted} /> 
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  author: {
    fontFamily: 'LatoBold',
    fontSize: 13,
    color: Brand.text,
  },
  content: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.text,
  },
  deleteButton: {
    alignSelf: 'center',
  },
});