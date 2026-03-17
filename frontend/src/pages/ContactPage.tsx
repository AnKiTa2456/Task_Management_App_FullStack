import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, User, MessageSquare, ArrowLeft, Shield, CheckCircle2, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID    = 'service_b0w9uyo';
const EMAILJS_TEMPLATE_ID   = 'template_po870lq';  // contact form template
const EMAILJS_OTP_TEMPLATE  = 'template_pqhjqqi'; // OTP email template
const EMAILJS_PUBLIC_KEY    = 'Tu0JTwG4pa-k-dh7y';

interface ContactSubmission {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  message:   string;
  notes:     string;
  submittedAt: string;
}

const STORAGE_KEY = 'taskflow_contact_submissions';

function saveSubmission(sub: ContactSubmission) {
  const existing: ContactSubmission[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  existing.unshift(sub);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}


type Step = 'form' | 'otp' | 'success';

export default function ContactPage() {
  const navigate = useNavigate();
  const [step,     setStep]     = useState<Step>('form');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [message,  setMessage]  = useState('');
  const [otpSent,  setOtpSent]  = useState(false);
  const [otpError, setOtpError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const otpRef = useRef<string>('');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [visibleOtp, setVisibleOtp] = useState('');

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim() || digits.length < 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter your email first — OTP will be sent there.');
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpRef.current = code;

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_OTP_TEMPLATE,
        { name, otp: code, email },
        EMAILJS_PUBLIC_KEY,
      );
      setVisibleOtp('');
      setOtpSent(true);
      toast.success(`OTP sent to ${email}! Check your inbox.`, { duration: 6000 });
    } catch {
      // Fallback — show OTP on screen if email fails
      setVisibleOtp(code);
      setOtpSent(true);
      toast.error('Could not send OTP email. Code shown below instead.', { duration: 6000 });
    }
  };

  const handleDigit = (idx: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs[idx + 1].current?.focus();
    if (!val && idx > 0) inputRefs[idx - 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const entered = digits.join('');
    if (entered.length < 6) { setOtpError('Please enter all 6 digits.'); return; }

    // Dev mode — verify locally
    if (otpRef.current) {
      if (entered !== otpRef.current) {
        setOtpError('Invalid OTP. Please try again.');
        setDigits(Array(6).fill(''));
        inputRefs[0].current?.focus();
        return;
      }
      setOtpError('');
      handleSubmit();
      return;
    }

    // Production — verify via backend
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'}/contact/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, otp: entered }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
        setDigits(Array(6).fill(''));
        inputRefs[0].current?.focus();
        return;
      }
      setOtpError('');
      handleSubmit();
    } catch {
      setOtpError('Verification failed. Please try again.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const submission: ContactSubmission = {
      id:          crypto.randomUUID(),
      name:        name.trim(),
      email:       email.trim(),
      phone:       phone.trim(),
      message:     message.trim(),
      notes:       '',
      submittedAt: new Date().toISOString(),
    };
    saveSubmission(submission);

    // Send email via EmailJS
    try {
      const res = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name:    name.trim(),
          email:   email.trim(),
          phone:   phone.trim(),
          message: message.trim(),
          time:    new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
        EMAILJS_PUBLIC_KEY,
      );
      console.log('EmailJS success:', res.status, res.text);
      toast.success('Email sent successfully!');
    } catch (err: unknown) {
      console.error('EmailJS FAILED:', err);
      const e = err as Record<string, string>;
      toast.error(`Email failed: ${e?.text || e?.message || 'Unknown error'}`);
    }

    setLoading(false);
    setStep('success');
  };

  const validateForm = () => {
    if (!name.trim()) { toast.error('Please enter your name.'); return false; }
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email.'); return false; }
    if (!phone.trim()) { toast.error('Please enter your phone number.'); return false; }
    if (!message.trim()) { toast.error('Please enter your message.'); return false; }
    return true;
  };

  const handleProceedToOTP = () => {
    if (!validateForm()) return;
    setStep('otp');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Message Sent!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Thank you, <strong>{name}</strong>! Your message has been received. We'll get back to you at <strong>{email}</strong> soon.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 max-w-md w-full">
          <button onClick={() => setStep('form')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verify Your Phone</h2>
              <p className="text-xs text-slate-400">OTP will be sent to your email for phone <strong className="text-slate-600 dark:text-slate-300">{phone}</strong></p>
            </div>
          </div>

          {!otpSent ? (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-1.5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  📞 Phone: <strong className="text-slate-800 dark:text-slate-100">{phone}</strong>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  📧 OTP sent to: <strong className="text-slate-800 dark:text-slate-100">{email}</strong>
                </p>
              </div>
              <button
                onClick={handleSendOTP}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={16} /> Send OTP
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter the 6-digit code shown below.
              </p>

              {/* Demo OTP display */}
              {visibleOtp && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Your OTP Code (Demo)</p>
                  <p className="text-3xl font-bold tracking-[0.3em] text-amber-700 dark:text-amber-300 select-all">{visibleOtp}</p>
                  <p className="text-xs text-amber-500 dark:text-amber-500 mt-1">Enter this code in the boxes below</p>
                </div>
              )}

              {/* OTP input boxes */}
              <div className="flex gap-2 justify-center">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl text-slate-800 dark:text-slate-100 bg-transparent outline-none transition-colors border-slate-200 dark:border-slate-600 focus:border-brand-500 dark:focus:border-brand-400"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-xs text-red-500 text-center">{otpError}</p>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || digits.join('').length < 6}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl transition-colors"
              >
                {loading ? 'Submitting...' : 'Verify & Submit'}
              </button>

              <button
                onClick={() => { setOtpSent(false); setDigits(Array(6).fill('')); setOtpError(''); setVisibleOtp(''); otpRef.current = ''; }}
                className="w-full text-sm text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // step === 'form'
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contact Us</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Have a question or need help? We'd love to hear from you.
          </p>
        </div>

        {/* Reach me directly */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Reach me directly</p>
          <div className="grid grid-cols-2 gap-2">
            {/* Phone */}
            <a
              href="tel:+919998889998"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Phone size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 leading-none mb-0.5">Phone</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">+91 9998889998</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="https://mail.google.com/mail/?view=cm&to=p.ankita10101@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Mail size={15} className="text-red-500 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 leading-none mb-0.5">Email</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">p.ankita10101</p>
              </div>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/AnKiTa2456"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                <Github size={15} className="text-slate-700 dark:text-slate-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 leading-none mb-0.5">GitHub</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">AnKiTa2456</p>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/ankita-patel-859508220"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                {/* LinkedIn SVG logo */}
                <svg viewBox="0 0 24 24" width="15" height="15" fill="#0a66c2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 leading-none mb-0.5">LinkedIn</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">Ankita Patel</p>
              </div>
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Full Name *</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400 placeholder-slate-300 dark:placeholder-slate-600"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Email Address *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400 placeholder-slate-300 dark:placeholder-slate-600"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Phone Number *</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400 placeholder-slate-300 dark:placeholder-slate-600"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">A 6-digit OTP will be sent to your email to verify.</p>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Message *</label>
            <textarea
              placeholder="How can we help you?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400 resize-none placeholder-slate-300 dark:placeholder-slate-600"
            />
          </div>

          <button
            onClick={handleProceedToOTP}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            Continue — Verify Phone
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-slate-400">
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              ← Back to Login
            </button>
            <span>|</span>
            <button onClick={() => navigate('/register')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Create Account
            </button>
          </div>
          <p className="text-center text-slate-300 dark:text-slate-600">
            Your info is stored securely and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}
