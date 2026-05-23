'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import {
  Menu,
  Plane,
  X,
} from 'lucide-react';

import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';

export default function Navbar() {
  const router = useRouter();

  const pathname = usePathname();

  const supabase = createClient();

  const { user, logout } =
    useUserStore();

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    logout();

    router.push('/login');
  };

  const navLinks = [
    {
      name: 'Home',
      href: '/home',
    },
    {
      name: 'My Bookings',
      href: '/my-bookings',
    },
  ];

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#030712]/80 backdrop-blur-2xl">

      {/* BACKGROUND GLOW */}

      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-purple-500/5" />

      {/* CONTAINER */}

      <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* LOGO */}

        <Link
          href="/home"
          className="group flex items-center gap-4"
        >

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/30 transition duration-300 group-hover:scale-105">

            <Plane className="h-7 w-7 text-white" />

          </div>

          <div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              SkyLine AI
            </h1>

            <p className="mt-0.5 text-sm text-gray-400">
              Premium Flight Platform
            </p>

          </div>

        </Link>

        {/* DESKTOP NAV */}

        <nav className="hidden items-center gap-10 md:flex">

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center text-[16px] font-medium transition-all duration-200 ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >

              {link.name}

              {pathname === link.href && (
                <span className="absolute -bottom-3 left-0 h-[2px] w-full rounded-full bg-cyan-400" />
              )}

            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-105 hover:from-red-500 hover:to-red-400"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() =>
                router.push('/login')
              }
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30"
            >
              Login
            </button>
          )}

        </nav>

        {/* MOBILE MENU BUTTON */}

        <button
          onClick={() =>
            setMobileMenu(!mobileMenu)
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 md:hidden"
        >

          {mobileMenu ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}

        </button>

      </div>

      {/* MOBILE MENU */}

      {mobileMenu && (
        <div className="border-t border-white/10 bg-[#030712]/95 px-6 py-6 backdrop-blur-2xl md:hidden">

          <div className="flex flex-col gap-4">

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() =>
                  setMobileMenu(false)
                }
                className={`rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >

                {link.name}

              </Link>
            ))}

            {user ? (
              <button
                onClick={() => {
                  setMobileMenu(false);

                  handleLogout();
                }}
                className="rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-4 text-left text-sm font-semibold text-white"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenu(false);

                  router.push('/login');
                }}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-left text-sm font-semibold text-white"
              >
                Login
              </button>
            )}

          </div>

        </div>
      )}

    </header>
  );
}