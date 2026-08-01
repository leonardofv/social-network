import { UserAvatar } from '@/components/ui/UserAvatar';
import { Brand } from '@/constants/Colors';
import { CommentWithAuthor } from '@/services/comment.service';
import { StyleSheet, Text, View } from 'react-native';

export function CommentItem({ comment }: { comment: CommentWithAuthor }) {
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
});