'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const profileImages = [
  '/assets/images/img1.jpg',
  '/assets/images/img2.jpg',
  '/assets/images/img3.jpg',
  '/assets/images/img4.jpg',
];

const mockProfiles = [
  { name: 'Alex', role: 'Software Engineer' },
  { name: 'Maria', role: 'Product Manager' },
  { name: 'James', role: 'UX Designer' },
  { name: 'Sofia', role: 'Data Analyst' },
  { name: 'Luca', role: 'DevOps Eng.' },
  { name: 'Hana', role: 'ML Engineer' },
  { name: 'Carlos', role: 'iOS Developer' },
  { name: 'Priya', role: 'Backend Dev' },
  { name: 'Noah', role: 'Full Stack' },
  { name: 'Yui', role: 'Frontend Dev' },
  { name: 'Ben', role: 'Security Eng.' },
  { name: 'Nina', role: 'QA Engineer' },
  { name: 'Omar', role: 'Cloud Architect' },
  { name: 'Ella', role: 'Scrum Master' },
  { name: 'Jin', role: 'Data Engineer' },
  { name: 'Rosa', role: 'UI Designer' },
  { name: 'Kai', role: 'Web Developer' },
  { name: 'Mia', role: 'Tech Lead' },
  { name: 'Ryo', role: 'Site Reliability' },
  { name: 'Isla', role: 'Product Designer' },
  { name: 'Dani', role: 'Android Dev' },
  { name: 'Leo', role: 'Game Developer' },
  { name: 'Zoe', role: 'React Developer' },
  { name: 'Sam', role: 'Systems Eng.' },
];

type Step = 'request' | 'sent' | 'verify' | 'reset' | 'done';

const Spinner = () => (
  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export default function ForgotPasswordSection() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBack = () => {
    setExiting(true);
    setTimeout(() => router.back(), 320);
  };

  const handleStepBack = () => {
    if (step === 'request') handleBack();
    else if (step === 'sent') setStep('request');
    else if (step === 'verify') setStep('sent');
    else if (step === 'reset') { setStep('verify'); setOtp(['', '', '', '', '', '']); }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock validation: only accept test@gmail.com
    if (email !== 'test@gmail.com') {
      alert('For demo purposes, please use: test@gmail.com');
      return;
    }
    setLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    setLoading(false);
    setStep('sent');
  };

  const handleProceedToVerify = () => {
    setStep('verify');
    startCooldown();
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length < 6) { setOtpError('Please enter the full 6-digit code.'); return; }
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setLoading(false);
    // Mock validation: only accept OTP 000000
    if (otp.join('') !== '000000') {
      setOtpError('Invalid code. For demo, use: 000000');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      return;
    }
    setStep('reset');
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    await new Promise(res => setTimeout(res, 800));
    setLoading(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    startCooldown();
    otpRefs.current[0]?.focus();
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    setLoading(false);
    setStep('done');
  };

  const getStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: '', color: 'bg-white/10', width: '0%' };
    const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-orange-400', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-yellow-400', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };
  const strength = getStrength(newPassword);

  const cardStyle: React.CSSProperties = {
    opacity: mounted && !exiting ? 1 : 0,
    transform: mounted && !exiting ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
    transition: 'opacity 0.38s cubic-bezier(0.4,0,0.2,1), transform 0.38s cubic-bezier(0.4,0,0.2,1)',
  };

  const backStyle: React.CSSProperties = {
    opacity: mounted && !exiting ? 1 : 0,
    transform: mounted && !exiting ? 'translateX(0)' : 'translateX(-14px)',
    transition: 'opacity 0.3s ease 0.12s, transform 0.3s ease 0.12s',
  };

  const inputClass =
    'bg-white/[0.08] border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#FF4E6A]/60 focus:bg-white/[0.12] transition-all duration-200';

  const primaryBtn =
    'bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white rounded-full py-3 font-semibold text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 w-full';

  return (
    <section className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 grid gap-3 p-3 opacity-80"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          transform: 'rotate(6deg) translateX(1%) scale(1)',
        }}
      >
        {mockProfiles.map((p, i) => (
          <div key={p.name} className="rounded-xl overflow-hidden relative">
            <img src={profileImages[i % profileImages.length]} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-[1]" />

      {/* Back button */}
      {step !== 'done' && (
        <button
          onClick={handleStepBack}
          style={backStyle}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 group"
          aria-label="Go back"
        >
          <span className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-sm font-medium hidden sm:block">Back</span>
        </button>
      )}

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4" style={cardStyle}>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="mb-5">
            <span className="text-white text-2xl font-bold tracking-tight">
              Job<span className="text-[#FF4E6A]">Swipe</span>
            </span>
          </div>

          {/* Progress dots for verify/reset steps */}
          {(step === 'verify' || step === 'reset') && (
            <div className="flex items-center gap-1.5 mb-5">
              {(['verify', 'reset'] as Step[]).map(s => (
                <div
                  key={s}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: step === s ? '20px' : '6px',
                    background: step === s ? '#FF4E6A' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          )}

          {/* ── STEP 1: Request ── */}
          {step === 'request' && (
            <>
              <div className="mb-5 w-12 h-12 rounded-2xl bg-[#FF4E6A]/15 border border-[#FF4E6A]/25 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#FF4E6A" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#FF4E6A" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.2" fill="#FF4E6A" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Forgot password?</h1>
              <p className="text-white/60 text-sm mb-6">No worries. Enter your email and we'll send you a reset code.</p>
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-3">
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} autoFocus />
                <button type="submit" disabled={loading} className={`${primaryBtn} mt-1`}>
                  {loading ? <><Spinner /> Sending…</> : 'Send reset code'}
                </button>
              </form>
              <p className="text-center text-white/50 text-sm mt-5">
                Remember your password?{' '}
                <Link href="/login" className="text-[#FF4E6A] hover:opacity-80 transition font-semibold">Sign in</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: Sent ── */}
          {step === 'sent' && (
            <>
              <div className="mb-5 w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l9 6 9-6" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="6" width="18" height="13" rx="2" stroke="#10b981" strokeWidth="1.8" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Check your email</h1>
              <p className="text-white/60 text-sm mb-1">We sent a 6-digit code to</p>
              <p className="text-white font-semibold text-sm mb-5 truncate">{email}</p>
              <div className="bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3.5 mb-5 flex items-start gap-3">
                <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#FF4E6A" strokeWidth="1.8" />
                  <path d="M12 8v4M12 16h.01" stroke="#FF4E6A" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <p className="text-white/50 text-xs leading-relaxed">Didn't receive it? Check your spam folder or try a different email address.</p>
              </div>
              <button onClick={handleProceedToVerify} className={primaryBtn}>
                Enter the code
              </button>
              <button onClick={() => setStep('request')} className="w-full mt-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full py-3 text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98]">
                Try a different email
              </button>
            </>
          )}

          {/* ── STEP 3: Verify OTP ── */}
          {step === 'verify' && (
            <>
              <div className="mb-5 w-12 h-12 rounded-2xl bg-[#FF4E6A]/15 border border-[#FF4E6A]/25 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="#FF4E6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" stroke="#FF4E6A" strokeWidth="1.8" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Enter the code</h1>
              <p className="text-white/60 text-sm mb-6">
                We sent a 6-digit code to{' '}
                <span className="text-white/80 font-medium">{email}</span>
              </p>

              <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{ paddingTop: '14px', paddingBottom: '14px' }}
                      className={[
                        'w-11 text-center text-xl font-bold rounded-xl border transition-all duration-200 bg-white/[0.08] text-white focus:outline-none focus:bg-white/[0.14]',
                        otpError
                          ? 'border-red-500/70 focus:border-red-500'
                          : digit
                            ? 'border-[#FF4E6A]/60'
                            : 'border-white/20 focus:border-[#FF4E6A]/60',
                      ].join(' ')}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-red-400 text-xs -mt-1 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {otpError}
                  </p>
                )}

                <button type="submit" disabled={loading || otp.join('').length < 6} className={primaryBtn}>
                  {loading ? <><Spinner /> Verifying…</> : 'Verify code'}
                </button>
              </form>

              <p className="text-center text-white/50 text-sm mt-4">
                Didn't get a code?{' '}
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-[#FF4E6A] hover:opacity-80 transition font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                </button>
              </p>
            </>
          )}

          {/* ── STEP 4: Reset password ── */}
          {step === 'reset' && (
            <>
              <div className="mb-5 w-12 h-12 rounded-2xl bg-[#FF4E6A]/15 border border-[#FF4E6A]/25 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#FF4E6A" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#FF4E6A" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 15v2" stroke="#FF4E6A" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">New password</h1>
              <p className="text-white/60 text-sm mb-6">Choose a strong password you haven't used before.</p>

              <form onSubmit={handleResetSubmit} className="flex flex-col gap-3">
                {/* New password */}
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                    required
                    autoFocus
                    className={`w-full pr-16 ${inputClass}`}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors duration-200 text-xs font-medium">
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Strength meter */}
                {newPassword.length > 0 && (
                  <div className="-mt-1">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className="text-xs mt-1 text-white/40">
                      Strength: <span className="text-white/70">{strength.label}</span>
                    </p>
                  </div>
                )}

                {/* Confirm password */}
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                    required
                    className={[
                      `w-full pr-16 ${inputClass}`,
                      confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50 focus:border-red-500/70' : '',
                      confirmPassword && confirmPassword === newPassword ? 'border-emerald-500/50 focus:border-emerald-500/70' : '',
                    ].join(' ')}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors duration-200 text-xs font-medium">
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                  {/* Match/mismatch icon */}
                  {confirmPassword.length > 0 && (
                    <span className="absolute right-14 top-1/2 -translate-y-1/2">
                      {confirmPassword === newPassword ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>

                {passwordError && (
                  <p className="text-red-400 text-xs flex items-center gap-1.5 -mt-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {passwordError}
                  </p>
                )}

                <button type="submit" disabled={loading} className={`${primaryBtn} mt-1`}>
                  {loading ? <><Spinner /> Updating…</> : 'Reset password'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 5: Done ── */}
          {step === 'done' && (
            <div className="text-center">
              <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">All done!</h1>
              <p className="text-white/60 text-sm mb-7">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white rounded-full py-3 font-semibold text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10M19 12H9M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Go to sign in
              </Link>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}