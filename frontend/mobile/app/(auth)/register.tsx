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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
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

type Role = 'applicant' | 'hr';

function ApplicantIcon({ active }: { active: boolean }) {
  const color = active ? Colors.primaryDark : Colors.gray400;
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function HRIcon({ active }: { active: boolean }) {
  const color = active ? Colors.primaryDark : Colors.gray400;
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M3 10h18" stroke={color} strokeWidth="1.8" />
      <Path d="M8 6V4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M16 6V4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="9" cy="15" r="1.5" fill={color} />
      <Circle cx="15" cy="15" r="1.5" fill={color} />
    </Svg>
  );
}

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('applicant');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { top: topInset } = useSafeAreaInsets();
  const setToken = useAuthStore((s) => s.setToken);

  const strengthLevel = password.length === 0 ? null : password.length < 8 ? 'weak' : password.length < 12 ? 'good' : 'strong';
  const strengthColor = strengthLevel === 'weak' ? Colors.danger : strengthLevel === 'good' ? Colors.warning : Colors.success;

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.'); return;
    }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, role }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.data.token);
        router.replace('/(tabs)');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background, paddingTop: topInset }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" />

      <PageHeader title="Create Account" subtitle="Start your job search today" />

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

        {/* ── Error banner ── */}
        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: Colors.dangerMid, borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={Colors.danger} />
            <Text style={{ flex: 1, color: Colors.danger, fontSize: Typography.base }}>{error}</Text>
          </View>
        ) : null}

        {/* ── Role selector ── */}
        <SectionCard title="I am a...">
          <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
            {([
              { key: 'applicant', title: 'Job Seeker',   desc: 'Browse and apply to jobs', Icon: ApplicantIcon },
              { key: 'hr',        title: 'HR / Company', desc: 'Post jobs and find talent',  Icon: HRIcon },
            ] as const).map(({ key, title, desc, Icon }) => {
              const active = role === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setRole(key)}
                  activeOpacity={0.8}
                  style={{ flex: 1, backgroundColor: active ? Colors.primaryLight : Colors.white, borderWidth: 1.5, borderColor: active ? Colors.primary : Colors.gray200, borderRadius: Radii.lg, padding: Spacing['4'], alignItems: 'center', gap: Spacing['1'], position: 'relative' }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: Radii.md, backgroundColor: active ? Colors.primaryMid : Colors.gray100, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['1'] }}>
                    <Icon active={active} />
                  </View>
                  <Text style={{ fontSize: Typography.base, fontWeight: Typography.semibold, color: active ? Colors.primaryDark : Colors.gray500, textAlign: 'center' }}>{title}</Text>
                  <Text style={{ fontSize: Typography.xs, color: active ? Colors.primary : Colors.gray400, textAlign: 'center', lineHeight: 15 }}>{desc}</Text>
                  {active && (
                    <View style={{ position: 'absolute', top: Spacing['2'], right: Spacing['2'], width: 18, height: 18, borderRadius: Radii.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons name="check" size={11} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* ── Personal info ── */}
        <SectionCard title="Personal info">

          {/* Name row */}
          <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
            <View style={{ flex: 1, gap: Spacing['2'] }}>
              <Text style={s.fieldLabel}>First name</Text>
              <View style={s.inputRow}>
                <TextInput style={s.input} placeholder="John" placeholderTextColor={Colors.gray300} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
            </View>
            <View style={{ flex: 1, gap: Spacing['2'] }}>
              <Text style={s.fieldLabel}>Last name</Text>
              <View style={s.inputRow}>
                <TextInput style={s.input} placeholder="Doe" placeholderTextColor={Colors.gray300} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </View>
          </View>

          <Divider spacing={Spacing['4']} />

          <View style={{ gap: Spacing['2'] }}>
            <Text style={s.fieldLabel}>Email</Text>
            <View style={s.inputRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color={Colors.gray400} />
              <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={Colors.gray300} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
          </View>

        </SectionCard>

        {/* ── Password ── */}
        <SectionCard title="Password">

          <View style={{ gap: Spacing['2'] }}>
            <Text style={s.fieldLabel}>Password</Text>
            <View style={s.inputRow}>
              <MaterialCommunityIcons name="lock-outline" size={16} color={Colors.gray400} />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Min. 8 characters" placeholderTextColor={Colors.gray300} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: Spacing['1'] }}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.gray400} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Strength bar */}
          {strengthLevel && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], marginTop: Spacing['2'] }}>
              <View style={{ flex: 1, height: 3, backgroundColor: Colors.gray100, borderRadius: Radii.full, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: Radii.full, backgroundColor: strengthColor, width: strengthLevel === 'weak' ? '33%' : strengthLevel === 'good' ? '66%' : '100%' }} />
              </View>
              <Text style={{ fontSize: Typography.xs, color: strengthColor, fontWeight: Typography.semibold, minWidth: 36 }}>
                {strengthLevel === 'weak' ? 'Weak' : strengthLevel === 'good' ? 'Good' : 'Strong'}
              </Text>
            </View>
          )}

          <Divider spacing={Spacing['4']} />

          <View style={{ gap: Spacing['2'] }}>
            <Text style={s.fieldLabel}>Confirm password</Text>
            <View style={s.inputRow}>
              <MaterialCommunityIcons name="lock-check-outline" size={16} color={Colors.gray400} />
              <TextInput style={s.input} placeholder="Re-enter your password" placeholderTextColor={Colors.gray300} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
            </View>
          </View>

        </SectionCard>

        {/* ── Create account button ── */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['2'], backgroundColor: Colors.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], opacity: loading ? 0.6 : 1, ...Shadows.colored(Colors.primary) }}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <><Text style={{ color: Colors.white, fontSize: Typography.lg, fontWeight: Typography.semibold }}>Create account</Text><MaterialCommunityIcons name="arrow-right" size={18} color={Colors.white} /></>
          }
        </TouchableOpacity>

        {/* ── Terms ── */}
        <Text style={{ fontSize: Typography.xs, color: Colors.gray400, textAlign: 'center', lineHeight: 18 }}>
          By creating an account, you agree to our{' '}
          <Text style={{ color: Colors.primary, fontWeight: Typography.medium }}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={{ color: Colors.primary, fontWeight: Typography.medium }}>Privacy Policy</Text>.
        </Text>

        {/* ── OR divider ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.gray200 }} />
          <Text style={{ fontSize: Typography.sm, color: Colors.gray400 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.gray200 }} />
        </View>

        {/* ── Login link ── */}
        <SectionCard>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ fontSize: Typography.md, color: Colors.gray400 }}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: Typography.md, color: Colors.primary, fontWeight: Typography.semibold }}>Sign in</Text>
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