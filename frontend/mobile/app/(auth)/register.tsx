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
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuthStore } from '../../store/authStore';

type Role = 'applicant' | 'hr';

function ApplicantIcon({ active }: { active: boolean }) {
  const color = active ? '#1A1A2E' : '#9CA3AF';
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HRIcon({ active }: { active: boolean }) {
  const color = active ? '#1A1A2E' : '#9CA3AF';
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

function CheckIcon() {
  return (
    <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <Path
        d="M2 5l2.5 2.5L8 3"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const setToken = useAuthStore((s) => s.setToken);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.data.token);
        router.replace('/(tabs)');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (e) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>J</Text>
          </View>
          <Text style={styles.brandName}>JobSwipe</Text>
        </View>

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subheading}>Start your job search today</Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>

          {/* Role selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleCard, role === 'applicant' && styles.roleCardActive]}
                onPress={() => setRole('applicant')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconBox, role === 'applicant' && styles.roleIconBoxActive]}>
                  <ApplicantIcon active={role === 'applicant'} />
                </View>
                <Text style={[styles.roleTitle, role === 'applicant' && styles.roleTitleActive]}>
                  Job Seeker
                </Text>
                <Text style={[styles.roleDesc, role === 'applicant' && styles.roleDescActive]}>
                  Browse and apply to jobs
                </Text>
                {role === 'applicant' && (
                  <View style={styles.roleCheck}>
                    <CheckIcon />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleCard, role === 'hr' && styles.roleCardActive]}
                onPress={() => setRole('hr')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconBox, role === 'hr' && styles.roleIconBoxActive]}>
                  <HRIcon active={role === 'hr'} />
                </View>
                <Text style={[styles.roleTitle, role === 'hr' && styles.roleTitleActive]}>
                  HR / Company
                </Text>
                <Text style={[styles.roleDesc, role === 'hr' && styles.roleDescActive]}>
                  Post jobs and find talent
                </Text>
                {role === 'hr' && (
                  <View style={styles.roleCheck}>
                    <CheckIcon />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={[styles.fieldGroup, styles.nameField]}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor="#A0A0A0"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.fieldGroup, styles.nameField]}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#A0A0A0"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Min. 8 characters"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#A0A0A0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          {/* Password strength */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={[
                styles.strengthBar,
                password.length >= 8 ? styles.strengthGood : styles.strengthWeak,
              ]} />
              <Text style={styles.strengthText}>
                {password.length < 8 ? 'Too short' : password.length < 12 ? 'Good' : 'Strong'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Create account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8F7F4' },
  container: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 72, paddingBottom: 40 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 48 },
  logoBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#fff', fontSize: 18, fontWeight: '700' },
  brandName: { fontSize: 20, fontWeight: '600', color: '#1A1A2E', letterSpacing: -0.3 },
  headingBlock: { marginBottom: 32 },
  heading: { fontSize: 30, fontWeight: '700', color: '#1A1A2E', letterSpacing: -0.5, marginBottom: 6 },
  subheading: { fontSize: 15, color: '#6B7280' },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  errorText: { color: '#DC2626', fontSize: 13 },
  form: { gap: 20 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', letterSpacing: 0.1 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, position: 'relative' },
  roleCardActive: { borderColor: '#1A1A2E', backgroundColor: '#F8F7FF' },
  roleIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  roleIconBoxActive: { backgroundColor: '#E8E8F0' },
  roleTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  roleTitleActive: { color: '#1A1A2E' },
  roleDesc: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 15 },
  roleDescActive: { color: '#6B7280' },
  roleCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', gap: 12 },
  nameField: { flex: 1 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A2E' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingRight: 16 },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A2E' },
  eyeBtn: { paddingLeft: 8 },
  eyeText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -8 },
  strengthBar: { height: 3, flex: 1, borderRadius: 2 },
  strengthWeak: { backgroundColor: '#FCA5A5' },
  strengthGood: { backgroundColor: '#6EE7B7' },
  strengthText: { fontSize: 12, color: '#6B7280', minWidth: 48 },
  registerBtn: { backgroundColor: '#1A1A2E', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  termsText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, marginTop: -8 },
  termsLink: { color: '#1A1A2E', fontWeight: '500' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 28, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { fontSize: 13, color: '#9CA3AF' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginPrompt: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#1A1A2E', fontWeight: '600' },
});