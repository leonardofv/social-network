import { Brand } from '@/constants/Colors';
import { UserProfile, UserService } from '@/services/user.service';
import { clearToken } from '@/utils';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {

  const [ user, setUser ] = useState<UserProfile | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState('');
  
  const router = useRouter();

  useEffect(() => {

    const loadProfile = async () => {
      try {
        const { data } = await UserService.getMe();
        setUser(data);
      }catch(error) {
        if (error instanceof Error && error.message.includes('Sessão expirada')) {
          await clearToken();
          router.replace('/login');
          return;
        }
        setError(error instanceof Error ? error.message : 'Não foi possível conectar');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  },[]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    )
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name ?? user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  center: {
    flex: 1,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'LatoBold',
    fontSize: 22,
    color: Brand.text,
  },
  email: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.textMuted,
  },
  bio: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.text,
    textAlign: 'center',
    marginTop: 8,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
  },
});
