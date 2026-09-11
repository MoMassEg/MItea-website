'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Supabase passes token_hash + type in the URL for PKCE flow
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  // Dev mode passes a plain token
  const devToken = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  // For Supabase PKCE — exchange the token hash for a session
  useEffect(() => {
    if (tokenHash && type === 'recovery') {
      const supabase = createClient();
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error: otpError }) => {
          if (otpError) {
            setError('This reset link is invalid or has expired. Please request a new one.');
          } else {
            setSessionReady(true);
          }
        });
    } else if (devToken) {
      // Dev mode — session is validated server-side on submit
      setSessionReady(true);
    } else {
      setError('No reset token found. Please request a new password reset link.');
    }
  }, [tokenHash, type, devToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (tokenHash && type === 'recovery') {
        // Supabase PKCE — update password directly on the active session
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw new Error(updateError.message);
      } else if (devToken) {
        // Dev / SMTP token — send to our API
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: devToken, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-warm-200">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md mb-4 relative">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl tracking-tight">Reset Your Password</h1>
            <p className="text-white/80 text-xs mt-1">Choose a strong new password for your MiTea account</p>
          </div>

          {/* Body */}
          <div className="p-8">
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="font-heading font-bold text-xl text-gray-800">Password Updated!</h2>
                <p className="text-sm text-gray-500">
                  Your password has been changed successfully. Redirecting you to the home page…
                </p>
                <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {!sessionReady && !error ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Verifying your reset link…</p>
                  </div>
                ) : sessionReady ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="reset-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="reset-confirm-password"
                          type={showConfirm ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Re-enter your new password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password strength hint */}
                    {password && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              password.length >= i * 3
                                ? i <= 1
                                  ? 'bg-rose-400'
                                  : i <= 2
                                  ? 'bg-amber-400'
                                  : i <= 3
                                  ? 'bg-yellow-400'
                                  : 'bg-emerald-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Set New Password'
                      )}
                    </button>
                  </form>
                ) : null}

                <div className="mt-6 text-center">
                  <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to MiTea
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Branding */}
        <p className="text-center text-[11px] text-gray-400 mt-6">
          🧋 MiTea · Artisanal Boba & Mochi
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-white to-amber-50">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
