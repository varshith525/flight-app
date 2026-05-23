'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Lock, Mail, Plane, Shield, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      
      {/* BACK TO HOME LINK */}
      <Link 
        href="/home" 
        className="absolute left-6 top-6 z-20 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white lg:left-8 lg:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="grid min-h-screen lg:grid-cols-12">
        
        {/* LEFT SIDE: BRAND PROFILE HERO */}
        <div className="relative hidden overflow-hidden border-r border-white/5 bg-gradient-to-br from-[#030712] via-[#091120] to-[#020617] lg:flex lg:col-span-5 xl:col-span-5">
          {/* Ambient Lighting */}
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-[122px]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
            {/* Header Identity */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl ring-1 ring-white/5">
                <Plane className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  SkyLine AI
                </h1>
                <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">
                  Premium Flight Platform
                </p>
              </div>
            </div>

            {/* Typography Core */}
            <div className="max-w-md my-auto">
              <h2 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                Fly{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                  Smarter
                </span>
                <br />
                With AI.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-400">
                Experience next-generation airline dispatch protocols with unified live inventory, 
                atomic seat locking architecture, and predictive latency routing.
              </p>
            </div>

            {/* Value Indicators */}
            <div className="space-y-6">
              <Feature
                icon={<Plane className="h-5 w-5 text-blue-400" />}
                title="Realtime Seats"
                text="Live structural seat graphs powered by stream isolation pipelines."
              />
              <Feature
                icon={<Shield className="h-5 w-5 text-cyan-400" />}
                title="Secure Booking"
                text="Atomic transaction isolation guarantees complete double-booking immunity."
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: SECURE REGISTRATION PANEL */}
        <div className="relative flex items-center justify-center px-4 py-16 sm:px-8 lg:col-span-7 xl:col-span-7">
          <div className="absolute right-[10%] top-[10%] h-96 w-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

          <div className="w-full max-w-[540px] rounded-[36px] border border-white/10 bg-white/[0.01] p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl sm:p-12">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Join the Fleet
              </h2>
              <p className="mt-2 text-[15px] text-slate-400">
                Create your verified platform management account.
              </p>
            </div>

            <form onSubmit={handleSignup} className="mt-8 space-y-5">
              
              <Input
                label="Full Name"
                type="text"
                placeholder="Captain James T. Kirk"
                value={fullName}
                onChange={setFullName}
                icon={<User size={18} />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={setEmail}
                icon={<Mail size={18} />}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  icon={<Lock size={18} />}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={<Shield size={18} />}
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-400 backdrop-blur-md">
                  {error}
                </div>
              )}

              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-[#091120] text-cyan-500 accent-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <p className="text-sm leading-normal text-slate-400">
                  I explicitly authorize the processing of data matching the platform{' '}
                  <span className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300 cursor-pointer">Terms of Service</span> and{' '}
                  <span className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300 cursor-pointer">Privacy Framework</span>.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-[16px] font-bold text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                    Provisioning Account...
                  </>
                ) : (
                  <>
                    Create Platform Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              Already have operating credentials?
              <Link
                href="/login"
                className="ml-2 font-bold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline hover:underline-offset-4"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Feature({ icon, title, text }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function Input({ label, type, placeholder, value, onChange, icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-400 ml-1">
        {label}
      </label>
      <div className="group flex h-14 items-center rounded-2xl border border-white/10 bg-[#091120] px-4 transition-all duration-300 focus-within:border-cyan-400 focus-within:bg-[#091120]/80 focus-within:ring-4 focus-within:ring-cyan-400/10">
        <div className="text-slate-500 transition-colors group-focus-within:text-cyan-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete="off"
          placeholder={placeholder}
          className="h-full w-full bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-slate-600 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
        />
      </div>
    </div>
  );
}