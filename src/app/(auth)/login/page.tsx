'use client';

import ZenithLogo, { ZenithMark } from "@/components/brand/ZenithLogo";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import { useLoginMutation } from '../../../features/auth/api/authApi';
import { useAppDispatch } from '../../../redux/hooks';
import { setUser } from '../../../features/auth/slices/authSlice';
import { getApiErrorMessage } from '../../../lib/apiError';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (token && user) {
      router.replace('/dashboard');
    }
  }, [router, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      const result = await login({
        email: email.trim(),
        password,
      }).unwrap();

      if (result.success && result.data?.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);

        document.cookie = `accessToken=${result.data.accessToken}; path=/; max-age=86400; SameSite=Lax`;

        if (result.data.user) {
          localStorage.setItem('user', JSON.stringify(result.data.user));
          dispatch(setUser(result.data.user));
        }

        // Hard navigation so the proxy sees the new cookie and Next's router
        // cache can't serve the stale pre-login redirect to /login.
        window.location.replace('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          'Login failed. Please check your credentials and try again.'
        )
      );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9fc]">
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-brand-end/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-brand-mid/15 blur-3xl"
      />

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_25px_70px_-20px_rgba(15,23,42,0.25)] lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left section */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-start via-[#175231] to-brand-end p-10 text-white lg:flex lg:min-h-[650px] lg:flex-col lg:justify-between">
            {/* Decorative circles */}
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-white/10 bg-white/5"
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-black/10">
                <ZenithLogo />
              </div>
            </div>

            <div className="relative z-10 max-w-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                Manage everything from one place.
              </h2>

              <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
                Sign in to access your Zenith Learning dashboard, manage programs,
                and keep everything organized.
              </p>

              <div className="mt-10 flex items-center gap-3 text-sm text-white/75">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-brand-mid bg-white/20" />
                  <div className="h-8 w-8 rounded-full border-2 border-brand-mid bg-white/30" />
                  <div className="h-8 w-8 rounded-full border-2 border-brand-mid bg-white/40" />
                </div>

                <span>Secure dashboard access</span>
              </div>
            </div>

            <p className="relative z-10 text-xs text-white/60">
              © {new Date().getFullYear()} Zenith Learning. All rights reserved.
            </p>
          </section>

          {/* Login section */}
          <section className="flex items-center px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
            <div className="mx-auto w-full max-w-sm">
              {/* Mobile logo */}
              <div className="mb-8 lg:hidden">
                <ZenithLogo />
              </div>

              <div className="mb-8">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-start-soft px-3 py-1.5 text-xs font-semibold text-brand-mid">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure login
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your credentials to access your dashboard.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />

                  <p className="text-sm leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-mid" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="admin@example.com"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      className="
                        h-12 w-full rounded-xl border border-slate-200
                        bg-white pl-11 pr-4 text-sm text-slate-900
                        outline-none transition-all
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-brand-mid
                        focus:ring-4
                        focus:ring-brand-mid/10
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                        disabled:opacity-60
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-mid" />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="
                        h-12 w-full rounded-xl border border-slate-200
                        bg-white pl-11 pr-12 text-sm text-slate-900
                        outline-none transition-all
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-brand-mid
                        focus:ring-4
                        focus:ring-brand-mid/10
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                        disabled:opacity-60
                      "
                    />

                    <button
                      id="login-toggle-password-visibility-button"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isLoading}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="
                        absolute right-3 top-1/2 flex h-8 w-8
                        -translate-y-1/2 items-center justify-center
                        rounded-lg text-slate-400 transition
                        hover:bg-slate-100 hover:text-slate-700
                        focus:outline-none focus:ring-2 focus:ring-brand-mid/20
                        disabled:opacity-50
                      "
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="login-submit-button"
                  type="submit"
                  disabled={isLoading}
                  className="
                    group relative flex h-12 w-full items-center
                    justify-center overflow-hidden rounded-xl
                    bg-brand-mid px-4 text-sm font-semibold text-white
                    shadow-lg shadow-brand-mid/20
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-brand-start
                    hover:shadow-xl
                    hover:shadow-brand-mid/25
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:translate-y-0
                    disabled:opacity-60
                    disabled:shadow-none
                  "
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-[18px] w-[18px] animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in to dashboard
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                <span>Your connection is securely protected</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
