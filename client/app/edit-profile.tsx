import { useSessionGuard } from '@/hooks/useSessionGuard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { Brand } from '@/constants/Colors';
import { UserService } from '@/services/user.service';

export default function EditProfileScreen() {
  const router = useRouter();
  const handleSessionExpired = useSessionGuard();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await UserService.getMe();
        setName(profile.name);
        setUsername(profile.username);
        setBio(profile.bio ?? '');
      } catch (err) {
        if (await handleSessionExpired(err)) return;
        setError(err instanceof Error ? err.message : 'Não foi possível conectar');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [handleSessionExpired]);

  const saveProfile = async () => {
    if (!name.trim() || !username.trim()) {
      setError('Nome e nome de usuário são obrigatórios.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await UserService.updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim() || null,
      });
      router.back();
    } catch (err) {
      if (await handleSessionExpired(err)) return;
      setError(err instanceof Error ? err.message : 'Não foi possível conectar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Editar perfil</Text>

          <TextField
            label="Nome"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <TextField
            label="Nome de usuário"
            icon="at-outline"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextField
            label={`Bio (${bio.length}/160)`}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            maxLength={160}
            returnKeyType="done"
          />

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton title="Salvar" onPress={saveProfile} loading={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: Brand.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  title: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: Brand.text,
    marginBottom: 4,
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
  },
});