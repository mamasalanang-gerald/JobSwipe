import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import {
  SectionCard,
  Divider,
  Spacer,
  Typography,
  Spacing,
  Radii,
  Shadows,
} from '../../components/ui';



export default function LoginScreen() {
  const T                               = useTheme();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { top: topInset }               = useSafeAreaInsets();
  const setToken                        = useAuthStore((s) => s.setToken);
  const passwordInputRef                = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (email == '' || password == '') { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/login', { email, password });
      // api interceptor unwraps { success, data } → data automatically
      const { token, user } = data as unknown as { token: string; user: { role: string } };
      const role = user?.role;
      if (role !== 'applicant' && role !== 'hr' && role !== 'company_admin') {
        throw new Error('Unable to determine account role. Please try again.');
      }
      await setToken(token, role as any);
      router.replace(role === 'applicant' ? '/(tabs)' : '/(company-tabs)');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // ── Dynamic styles ─────────────────────────────────────────────────────────
  const inputRowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing['2'],
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['3'],
  };

  const inputStyle = {
    flex: 1,
    paddingVertical: Spacing['3'],
    fontSize: Typography.md,
    color: T.textPrimary,
  };

  const fieldLabelStyle = {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold as any,
    color: T.textSub,
    letterSpacing: 0.2,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      <View style={{ paddingHorizontal: Spacing["5"], paddingTop: Spacing["4"], paddingBottom: Spacing["2"] }}>
        <Text style={{ fontSize: Typography["2xl"], fontWeight: Typography.bold as any, color: T.textPrimary, letterSpacing: -0.3 }}>Sign In</Text>
        <Text style={{ fontSize: Typography.sm, color: T.textSub, marginTop: Spacing["1"] }}>Welcome back to JobSwipe</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['3'] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Brand ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], paddingVertical: Spacing['4'] }}>
          <View style={{ width: 44, height: 44, borderRadius: Radii.md, backgroundColor: T.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.colored(T.primary) }}>
            <Text style={{ color: T.white, fontSize: Typography['2xl'], fontWeight: Typography.bold as any }}>J</Text>
          </View>
          <View>
            <Text style={{ fontSize: Typography.xl, fontWeight: Typography.bold as any, color: T.textPrimary, letterSpacing: -0.3 }}>JobSwipe</Text>
            <Text style={{ fontSize: Typography.sm, color: T.textHint, marginTop: 1 }}>Your next role is one swipe away</Text>
          </View>
        </View>


        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
            <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{error}</Text>
          </View>
        ) : null}

        {/* ── Credentials ── */}
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Your credentials">

          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Email</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="email-outline" size={16} color={T.textHint} />
              <TextInput
                style={inputStyle}
                placeholder="you@example.com"
                placeholderTextColor={T.textHint}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>
          </View>

          <Divider spacing={Spacing['4']} />

          <View style={{ gap: Spacing['2'] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={fieldLabelStyle}>Password</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="lock-outline" size={16} color={T.textHint} />
              <TextInput
                ref={passwordInputRef}
                style={[inputStyle, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={T.textHint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: Spacing['1'] }}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.textHint} />
              </TouchableOpacity>
            </View>
          </View>

        </SectionCard>

        {/* ── Sign in button ── */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['2'], backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], opacity: loading ? 0.6 : 1, ...Shadows.colored(T.primary) }}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={T.white} />
            : (
              <>
                <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>Sign in</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={T.white} />
              </>
            )
          }
        </TouchableOpacity>

        {/* ── OR divider ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
          <View style={{ flex: 1, height: 1, backgroundColor: T.borderFaint }} />
          <Text style={{ fontSize: Typography.sm, color: T.textHint }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: T.borderFaint }} />
        </View>

        {/* ── Register ── */}
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ fontSize: Typography.md, color: T.textSub }}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: Typography.md, color: T.primary, fontWeight: Typography.semibold as any }}>Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SectionCard>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
