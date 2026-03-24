import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import {
  PageHeader,
  SectionCard,
  Divider,
  Spacer,
  Colors,
  Typography,
  Spacing,
  Radii,
  Shadows,
} from '../../components/ui';

// ─── MOCK AUTH ────────────────────────────────────────────────────────────────
// TODO: Remove this block once the backend is live.
const MOCK_AUTH = true; // flip to false to re-enable the real API call
const MOCK_CREDENTIALS = { email: 'demo@example.com', password: 'password' };
const MOCK_TOKEN = 'mock-token-123';
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);

    // ── Mock path ──────────────────────────────────────────────────────────
    if (MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, 600)); // simulate network delay
      if (
        email === MOCK_CREDENTIALS.email &&
        password === MOCK_CREDENTIALS.password
      ) {
        setToken(MOCK_TOKEN);
        router.replace('/(tabs)');
      } else {
        setError(
          `Invalid credentials.\nUse ${MOCK_CREDENTIALS.email} / ${MOCK_CREDENTIALS.password}`
        );
      }
      setLoading(false);
      return;
    }
    // ── Real API path (restored when MOCK_AUTH = false) ────────────────────

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.data.token);
        router.replace('/(tabs)');
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" />

      <PageHeader title="Sign In" subtitle="Welcome back to JobSwipe" />

      <ScrollView contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['3'] }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Brand ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], paddingVertical: Spacing['4'] }}>
          <View style={{ width: 44, height: 44, borderRadius: Radii.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.colored(Colors.primary) }}>
            <Text style={{ color: Colors.white, fontSize: Typography['2xl'], fontWeight: Typography.bold }}>J</Text>
          </View>
          <View>
            <Text style={{ fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.gray900, letterSpacing: -0.3 }}>JobSwipe</Text>
            <Text style={{ fontSize: Typography.sm, color: Colors.gray400, marginTop: 1 }}>Your next role is one swipe away</Text>
          </View>
        </View>

        {/* ── Mock-mode hint banner ── */}
        {MOCK_AUTH ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="information-outline" size={15} color="#F9A825" />
            <Text style={{ flex: 1, color: '#795548', fontSize: Typography.sm }}>
              Mock mode — use <Text style={{ fontWeight: '600' }}>{MOCK_CREDENTIALS.email}</Text> / <Text style={{ fontWeight: '600' }}>{MOCK_CREDENTIALS.password}</Text>
            </Text>
          </View>
        ) : null}

        {/* ── Error banner ── */}
        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: Colors.dangerMid, borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={Colors.danger} />
            <Text style={{ flex: 1, color: Colors.danger, fontSize: Typography.base }}>{error}</Text>
          </View>
        ) : null}

        {/* ── Credentials ── */}
        <SectionCard title="Your credentials">

          <View style={{ gap: Spacing['2'] }}>
            <Text style={s.fieldLabel}>Email</Text>
            <View style={s.inputRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color={Colors.gray400} />
              <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={Colors.gray300} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
          </View>

          <Divider spacing={Spacing['4']} />

          <View style={{ gap: Spacing['2'] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.fieldLabel}>Password</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium }}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={s.inputRow}>
              <MaterialCommunityIcons name="lock-outline" size={16} color={Colors.gray400} />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor={Colors.gray300} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: Spacing['1'] }}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.gray400} />
              </TouchableOpacity>
            </View>
          </View>

        </SectionCard>

        {/* ── Sign in button ── */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['2'], backgroundColor: Colors.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], opacity: loading ? 0.6 : 1, ...Shadows.colored(Colors.primary) }}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <><Text style={{ color: Colors.white, fontSize: Typography.lg, fontWeight: Typography.semibold }}>Sign in</Text><MaterialCommunityIcons name="arrow-right" size={18} color={Colors.white} /></>
          }
        </TouchableOpacity>

        {/* ── OR divider ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.gray200 }} />
          <Text style={{ fontSize: Typography.sm, color: Colors.gray400 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.gray200 }} />
        </View>

        {/* ── Register ── */}
        <SectionCard>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ fontSize: Typography.md, color: Colors.gray400 }}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: Typography.md, color: Colors.primary, fontWeight: Typography.semibold }}>Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SectionCard>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Only styles reused across multiple elements live here
const s = StyleSheet.create({
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray600,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['3'],
  },
  input: {
    flex: 1,
    paddingVertical: Spacing['3'],
    fontSize: Typography.md,
    color: Colors.gray900,
  },
});