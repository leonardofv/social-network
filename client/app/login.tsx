import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { AuthService } from '@/services/auth.service';
import { storeToken } from '@/utils';

export default function LoginScreen() {
  const router = useRouter();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (!emailOrUsername.trim() || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { token } = await AuthService.login(
        emailOrUsername.trim(),
        password,
      );
      await storeToken(token);
      router.replace('/(tabs)');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível conectar.',
      );
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Ionicons name="chatbubbles" size={56} color={Brand.primary} />
            <Text style={styles.logoText}>SocialNetwork</Text>
            <Text style={styles.tagline}>
              Compartilhe momentos com quem importa.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Bem-vindo de volta!</Text>

            <TextField
              label="E-mail ou nome de usuário"
              icon="mail-outline"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              autoCapitalize="none"
              inputMode="email"
              returnKeyType="next"
            />
            <TextField
              label="Senha"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={loginUser}
            />

            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <PrimaryButton title="Entrar" onPress={loginUser} loading={loading} />

            <Text style={styles.footerText}>
              Ainda não tem conta?{' '}
              <Text
                style={styles.registerLink}
                onPress={() => router.push('/register')}
              >
                Registre-se aqui.
              </Text>
            </Text>
          </View>
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
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 28,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 4,
  },
  logoText: {
    fontFamily: 'LatoBold',
    fontSize: 28,
    color: Brand.text,
  },
  tagline: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: Brand.textMuted,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
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
  footerText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Brand.textMuted,
    textAlign: 'center',
  },
  registerLink: {
    fontFamily: 'LatoBold',
    color: Brand.primary,
    textDecorationLine: 'underline',
  },
});
