'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Plane, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setUser, setSession } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setUser(data.user);
      }

      if (data.session) {
        setSession(data.session);
        document.cookie = `sb-access-token=${data.session.access_token}; path=/`;
      }

      router.push('/home');
    } catch (err) {
      console.error(err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] p-6 text-white">
      
      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* BACK TO HOME LINK */}
      <Link 
        href="/home" 
        className="absolute left-8 top-8 z-20 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[36px] border border-white/10 bg-white/[0.02] p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl sm:p-12">
        
        {/* LOGO & HEADER */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl shadow-cyan-500/30 ring-1 ring-white/20">
            <Plane className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Welcome Back
          </h1>
          <p className="mt-3 text-slate-400">
            Sign in to manage your flight reservations
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-400 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* EMAIL INPUT */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">
              Email Address
            </label>
            <div className="group flex h-14 items-center rounded-2xl border border-white/10 bg-[#091120] px-4 transition-all duration-300 focus-within:border-cyan-400 focus-within:bg-[#091120]/80 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <Mail className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-full w-full bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-slate-600 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">
              Password
            </label>
            <div className="group flex h-14 items-center rounded-2xl border border-white/10 bg-[#091120] px-4 transition-all duration-300 focus-within:border-cyan-400 focus-within:bg-[#091120]/80 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <Lock className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-full w-full bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-slate-600 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 transition-colors hover:text-white group-focus-within:text-slate-400"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-[16px] font-bold text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        {/* SIGNUP LINK */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Don’t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline hover:underline-offset-4"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}