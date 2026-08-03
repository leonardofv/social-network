import { Brand } from '@/constants/Colors';
import { mediaUrl } from '@/services/api';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

type UserAvatarProps = {
  name: string;
  picture: string | null;
  size?: number;
};

export function UserAvatar({ name, picture, size = 32 }: UserAvatarProps) {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (picture) {
    return (
      <Image
        source={{ uri: mediaUrl(picture) }}
        style={shape}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View style={[shape, styles.placeholder]}>
      <Text style={[styles.initial, { fontSize: size * 0.44 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: 'LatoBold',
    color: '#fff',
  },
});