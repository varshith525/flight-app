'use client';

import { useEffect } from 'react';
import {
  useRouter,
  usePathname,
} from 'next/navigation';

import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';

import { useUserStore } from '@/stores/userStore';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const {
    user,
    setUser,
    setSession,
    logout,
  } = useUserStore();

  useEffect(() => {
    const supabase =
      createClient();

    supabase.auth
      .getSession()
      .then(
        ({
          data: { session },
        }) => {
          if (session) {
            setUser(
              session.user
            );

            setSession(
              session
            );
          }
        }
      );

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (session) {
            setUser(
              session.user
            );

            setSession(
              session
            );
          } else {
            setUser(null);

            setSession(
              null
            );
          }
        }
      );

    return () =>
      subscription.unsubscribe();
  }, [
    setUser,
    setSession,
  ]);

  const handleLogout =
    async () => {
      const supabase =
        createClient();

      await supabase.auth.signOut();

      logout();

      router.push('/login');
    };

  const navItems = [
    {
      href: '/',
      label: 'Home',
    },

    {
      href: '/my-bookings',
      label: 'My Bookings',
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* NAVBAR */}

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">

        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-4"
          >

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/20">

              <span className="text-2xl">
                ✈️
              </span>

            </div>

            <div>

              <h1 className="text-3xl font-black tracking-tight text-white">

                SkyLine AI

              </h1>

              <p className="text-xs font-medium tracking-wide text-slate-400">

                Premium Flight Platform

              </p>

            </div>

          </Link>

          {/* NAVIGATION */}

          <div className="flex items-center gap-8">

            <nav className="hidden items-center gap-8 md:flex">

              {navItems.map(
                (item) => (
                  <Link
                    key={item.href}
                    href={
                      item.href
                    }
                    className={`relative text-lg font-semibold transition-all ${
                      pathname ===
                      item.href
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {
                      item.label
                    }

                    {pathname ===
                      item.href && (
                      <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-cyan-400" />
                    )}
                  </Link>
                )
              )}

            </nav>

            {/* AUTH */}

            {user ? (
              <div className="flex items-center gap-4">

                <span className="hidden text-sm font-medium text-slate-300 md:block">

                  {
                    user.email
                  }

                </span>

                <button
                  onClick={
                    handleLogout
                  }
                  className="rounded-xl bg-red-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-400"
                >

                  Logout

                </button>

              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.03]"
              >

                Login

              </Link>
            )}

          </div>

        </div>

      </header>

      {/* PAGE */}

      <main className="pt-24">

        {children}

      </main>

    </div>
  );
}