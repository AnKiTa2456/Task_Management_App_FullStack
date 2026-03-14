import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'email' | 'otp' | 'new-password' | 'success';

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState<Step>('email');
  const [email,       setEmail]       = useState('');
  const [digits,      setDigits]      = useState(Array(6).fill(''));
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [otpError,    setOtpError]    = useState('');

  const otpRef    = useRef<string>('');
  const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.'); return;
    }
    setLoading(true);
    const code = generateOTP();
    otpRef.current = code;
    // Demo: show OTP in toast. In production, call backend email API.
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    toast.success(`OTP sent to ${email}! (Demo: ${code})`, { duration: 12000 });
    setStep('otp');
  };

  const handleDigit = (idx: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[idx]  = val;
    setDigits(next);
    if (val && idx < 5) inputRefs[idx + 1].current?.focus();
    if (!val && idx > 0) inputRefs[idx - 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) inputRefs[idx - 1].current?.focus();
  };

  const handleVerifyOTP = () => {
    const entered = digits.join('');
    if (entered !== otpRef.current) {
      setOtpError('Invalid OTP. Please check and try again.');
      setDigits(Array(6).fill(''));
      inputRefs[0].current?.focus();
      return;
    }
    setOtpError('');
    setStep('new-password');
  };

  const handleResetPassword = async () => {
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Password Reset!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 max-w-md w-full">

        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </button>

        {/* Step: Email */}
        {step === 'email' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                <KeyRound size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Forgot Password?</h2>
                <p className="text-xs text-slate-400">Enter your email to receive a reset code.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                  />
                </div>
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Sending…' : 'Send Reset Code'}
              </button>
            </div>
          </>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Enter OTP</h2>
                <p className="text-xs text-slate-400">6-digit code sent to {email}</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex gap-2 justify-center">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl text-slate-800 dark:text-slate-100 bg-transparent outline-none transition-colors border-slate-200 dark:border-slate-600 focus:border-brand-500"
                  />
                ))}
              </div>
              {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
              <button
                onClick={handleVerifyOTP}
                disabled={digits.join('').length < 6}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                Verify Code
              </button>
              <button
                onClick={() => { const code = generateOTP(); otpRef.current = code; toast.success(`New OTP: ${code}`, { duration: 12000 }); setDigits(Array(6).fill('')); setOtpError(''); }}
                className="w-full text-sm text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* Step: New password */}
        {step === 'new-password' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                <KeyRound size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">New Password</h2>
                <p className="text-xs text-slate-400">Choose a strong password.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoFocus
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                  />
                  <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                  />
                  <button onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {password && confirm && password !== confirm && (
                <p className="text-xs text-red-500">Passwords do not match.</p>
              )}
              <button
                onClick={handleResetPassword}
                disabled={loading || password.length < 6 || password !== confirm}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
