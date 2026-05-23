import { create } from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';

export interface Flight {
  id: string;

  flight_no: string;

  origin: string;

  destination: string;

  departs_at: string;

  arrives_at: string;

  aircraft_type: string;

  base_price: number;
}

export interface Seat {
  id: string;

  flight_id: string;

  seat_number: string;

  class:
    | 'economy'
    | 'business'
    | 'first';

  is_available: boolean;

  extra_fee: number;
}

export interface PassengerDetails {
  full_name: string;

  passport_no?: string;

  nationality: string;

  dob: string;
}

export interface SearchQuery {
  origin: string;

  destination: string;

  date: string;

  passengers: number;
}

interface FlightStoreState {
  /* SEARCH */
  searchQuery:
    | SearchQuery
    | null;

  /* BOOKING */
  selectedFlight:
    | Flight
    | null;

  selectedSeat:
    | Seat
    | null;

  bookingStep:
    | 1
    | 2
    | 3
    | 4;

  /* PASSENGER */
  passengerDetails:
    | PassengerDetails
    | null;

  /* CONFIRMATION */
  bookingId:
    | string
    | null;

  /* UI */
  isHydrated: boolean;
}

interface FlightStoreActions {
  /* SEARCH */
  setSearchQuery: (
    query:
      | SearchQuery
      | null
  ) => void;

  /* FLIGHT */
  setSelectedFlight: (
    flight:
      | Flight
      | null
  ) => void;

  /* SEAT */
  setSelectedSeat: (
    seat:
      | Seat
      | null
  ) => void;

  optimisticSelectSeat: (
    seat: Seat
  ) => void;

  /* STEP */
  setBookingStep: (
    step:
      | 1
      | 2
      | 3
      | 4
  ) => void;

  /* PASSENGER */
  setPassengerDetails: (
    details: PassengerDetails
  ) => void;

  clearPassengerPassport: () => void;

  /* BOOKING */
  setBookingId: (
    id:
      | string
      | null
  ) => void;

  /* CLEAR */
  clearBookingFlow: () => void;

  resetStore: () => void;

  /* HYDRATION */
  setHydrated: (
    state: boolean
  ) => void;
}

type FlightStore =
  FlightStoreState &
    FlightStoreActions;

const initialState: FlightStoreState =
  {
    searchQuery: null,

    selectedFlight: null,

    selectedSeat: null,

    bookingStep: 1,

    passengerDetails: null,

    bookingId: null,

    isHydrated: false,
  };

export const useFlightStore =
  create<FlightStore>()(
    persist(
      (set, get) => ({
        ...initialState,

        /* =========================
           SEARCH
        ========================= */

        setSearchQuery: (
          query
        ) =>
          set({
            searchQuery:
              query,
          }),

        /* =========================
           FLIGHT
        ========================= */

        setSelectedFlight: (
          flight
        ) =>
          set({
            selectedFlight:
              flight,

            // reset seat if flight changes
            selectedSeat:
              null,
          }),

        /* =========================
           SEAT
        ========================= */

        setSelectedSeat: (
          seat
        ) =>
          set({
            selectedSeat:
              seat,
          }),

        optimisticSelectSeat: (
          seat
        ) => {
          set({
            selectedSeat:
              seat,
          });
        },

        /* =========================
           BOOKING STEP
        ========================= */

        setBookingStep: (
          step
        ) =>
          set({
            bookingStep:
              step,
          }),

        /* =========================
           PASSENGER
        ========================= */

        setPassengerDetails: (
          details
        ) =>
          set({
            passengerDetails:
              details,
          }),

        clearPassengerPassport:
          () => {
            const current =
              get();

            if (
              !current.passengerDetails
            )
              return;

            set({
              passengerDetails:
                {
                  ...current.passengerDetails,

                  passport_no:
                    '',
                },
            });
          },

        /* =========================
           BOOKING
        ========================= */

        setBookingId: (
          id
        ) =>
          set({
            bookingId:
              id,
          }),

        /* =========================
           CLEAR FLOW
        ========================= */

        clearBookingFlow:
          () =>
            set({
              selectedFlight:
                null,

              selectedSeat:
                null,

              bookingStep: 1,

              passengerDetails:
                null,

              bookingId:
                null,
            }),

        /* =========================
           RESET STORE
        ========================= */

        resetStore: () =>
          set(
            initialState
          ),

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
          'flight-store',

        storage:
          createJSONStorage(
            () =>
              localStorage
          ),

        /* =========================
           PERSIST ONLY SAFE DATA
        ========================= */

        partialize: (
          state
        ) => ({
          searchQuery:
            state.searchQuery,

          selectedFlight:
            state.selectedFlight,

          selectedSeat:
            state.selectedSeat,

          bookingStep:
            state.bookingStep,

          bookingId:
            state.bookingId,

          passengerDetails:
            state.passengerDetails
              ? {
                  full_name:
                    state
                      .passengerDetails
                      .full_name,

                  nationality:
                    state
                      .passengerDetails
                      .nationality,

                  dob: state
                    .passengerDetails
                    .dob,
                }
              : null,
        }),

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