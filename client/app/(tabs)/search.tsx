import { UserService, UserSummary } from '@/services/user.service';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { mediaUrl } from '@/services/api';
import { router } from 'expo-router';

export default function SearchUsers() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSessionExpired = useSessionGuard();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    const timer = setTimeout(async () => {
      try {
        const users = await UserService.searchUsers(query.trim());
        if (!cancelled) setResults(users);
      }catch(error) {
        if (await handleSessionExpired(error)) return;
        if (!cancelled) setError('Não foi possível buscar');
        console.log(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };

  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        placeholder="Buscar usuários"
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading && <ActivityIndicator style={styles.indicator} />}
      {!!error && <Text style={styles.error}>{error}</Text>}

      <FlatList 
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/user/${item.id}`)}>
            {item.profilePicture ? (
              <Image 
                source={{ uri: mediaUrl(item.profilePicture) }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{item.name[0]}</Text>
              </View>
            )}
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
          </Pressable>
        )}
        ListEmptyComponent={
          query.trim() && !loading && !error ? (
            <Text style={styles.empty}>Nenhum usuário encontrado</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  input: {
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 12,
  },
  indicator: { marginVertical: 8 },
  error: { color: '#f66', textAlign: 'center', marginVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 18, fontWeight: '600' },
  name: { color: '#fff', fontWeight: '600' },
  username: { color: '#888', fontSize: 13 },
  empty: { color: '#888', textAlign: 'center', marginTop: 24 },
});