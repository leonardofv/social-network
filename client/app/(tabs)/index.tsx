import { clearToken, getToken } from '@/utils';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Button, FlatList } from 'react-native';

interface Post {
  id: number;
  userId: number;
  path: string;
  publishDate: string;
  description: string;
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigation = useNavigation<any>(); // eslint-disable-line

  const counterRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const fetchPosts = async (token: string) => {
      try {
        const URL = process.env.EXPO_PUBLIC_API_URL;
        const response = await fetch(`${URL}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPosts(data.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    getToken().then((token) => {
      if (token) {
        fetchPosts(token);
      }
    });

    return () => clearInterval(counterRef.current);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.postTitle}>ID: {item.id}</Text>
            <Text>User ID: {item.userId}</Text>
            <Text>Path: {item.path}</Text>
            <Text>Publish Date: {item.publishDate}</Text>
            <Text>Description: {item.description}</Text>
          </View>
        )}
      />
      <Button
        title="Logout"
        onPress={() => {
          clearToken();
          navigation.replace('login');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  post: {
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  postTitle: {
    fontWeight: 'bold',
  },
});