import { create } from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';

import type {
  User,
  Session,
} from '@supabase/supabase-js';

/* =========================
   TYPES
========================= */

interface PersistedSession {
  access_token: string;

  refresh_token: string;

  expires_at?: number;
}

interface CachedBooking {
  id: string;

  pnr_code: string;

  status: string;

  flight_no?: string;
}

interface UserStoreState {
  user: User | null;

  session: Session | null;

  persistedSession:
    | PersistedSession
    | null;

  cachedBookings:
    CachedBooking[];

  isLoading: boolean;

  isHydrated: boolean;
}

interface UserStoreActions {
  /* AUTH */
  setUser: (
    user: User | null
  ) => void;

  setSession: (
    session:
      | Session
      | null
  ) => void;

  /* UI */
  setLoading: (
    loading: boolean
  ) => void;

  setHydrated: (
    state: boolean
  ) => void;

  /* BOOKINGS */
  setCachedBookings: (
    bookings: CachedBooking[]
  ) => void;

  /* AUTH CLEAR */
  clearAuth: () => void;

  logout: () => void;
}

type UserStore =
  UserStoreState &
    UserStoreActions;

/* =========================
   INITIAL STATE
========================= */

const initialState: UserStoreState =
  {
    user: null,

    session: null,

    persistedSession:
      null,

    cachedBookings: [],

    isLoading: false,

    isHydrated: false,
  };

/* =========================
   STORE
========================= */

export const useUserStore =
  create<UserStore>()(
    persist(
      (set) => ({
        ...initialState,

        /* =========================
           USER
        ========================= */

        setUser: (
          user
        ) =>
          set({
            user,
          }),

        /* =========================
           SESSION
        ========================= */

        setSession: (
          session
        ) =>
          set({
            session,

            persistedSession:
              session
                ? {
                    access_token:
                      session.access_token,

                    refresh_token:
                      session.refresh_token,

                    expires_at:
                      session.expires_at,
                  }
                : null,
          }),

        /* =========================
           LOADING
        ========================= */

        setLoading: (
          loading
        ) =>
          set({
            isLoading:
              loading,
          }),

        /* =========================
           BOOKINGS
        ========================= */

        setCachedBookings: (
          bookings
        ) =>
          set({
            cachedBookings:
              bookings,
          }),

        /* =========================
           CLEAR AUTH
        ========================= */

        clearAuth: () =>
          set({
            user: null,

            session: null,

            persistedSession:
              null,

            cachedBookings:
              [],
          }),

        /* =========================
           LOGOUT
        ========================= */

        logout: () =>
          set({
            user: null,

            session: null,

            persistedSession:
              null,

            cachedBookings:
              [],
          }),

        /* =========================
           HYDRATION
        ========================= */

        setHydrated: (
          state
        ) =>
          set({
            isHydrated:
              state,
          }),
      }),

      {
        name:
          'user-store',

        storage:
          createJSONStorage(
            () =>
              localStorage
          ),

        /* =========================
           PERSIST SAFE DATA ONLY
        ========================= */

        partialize: (
          state
        ) => ({
          persistedSession:
            state.persistedSession,

          cachedBookings:
            state.cachedBookings,
        }),

        /* =========================
           HYDRATE
        ========================= */

        onRehydrateStorage:
          () =>
          (
            state
          ) => {
            state?.setHydrated(
              true
            );
          },
      }
    )
  );