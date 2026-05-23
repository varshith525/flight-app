'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Clock3,
  Sparkles,
  Ticket,
  Trash2,
  Plane,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';

interface Booking {
  pnr_code: string;

  passenger: {
    full_name: string;
  };

  flight: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
    aircraft_type: string;
  };

  seat: {
    seat_number: string;
    class: string;
  };

  total_price: number;
}

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(
          'bookingData'
        );

      if (stored) {
        const parsed = JSON.parse(stored);

        const unifiedBooking: Booking = {
          pnr_code:
            parsed.pnr ||
            parsed.pnr_code ||
            'PNR-UNKNOWN',

          passenger: {
            full_name:
              parsed.passenger
                ?.full_name ||
              parsed.passengers?.[0]
                ?.full_name ||
              parsed.passengerName ||
              'Passenger Guest',
          },

          flight: {
            flight_no:
              parsed.flight
                ?.flight_no ||
              parsed.selectedFlight
                ?.flight_no ||
              '731',

            origin:
              parsed.flight?.origin ||
              parsed.selectedFlight
                ?.origin ||
              'N/A',

            destination:
              parsed.flight
                ?.destination ||
              parsed.selectedFlight
                ?.destination ||
              'N/A',

            departs_at:
              parsed.flight
                ?.departs_at ||
              parsed.selectedFlight
                ?.departs_at ||
              '',

            aircraft_type:
              parsed.flight
                ?.aircraft_type ||
              parsed.selectedFlight
                ?.aircraft_type ||
              'Boeing 777',
          },

          seat: {
            seat_number:
              parsed.seat
                ?.seat_number ||
              parsed.seat?.label ||
              (Array.isArray(
                parsed.selectedSeats
              )
                ? parsed.selectedSeats
                    .map(
                      (s: any) =>
                        s.label ||
                        s.seat_number
                    )
                    .join(', ')
                : '') ||
              parsed.seatNumber ||
              'Assigned',

            class:
              parsed.seat?.class ||
              parsed.seat
                ?.class_type ||
              (Array.isArray(
                parsed.selectedSeats
              )
                ? parsed.selectedSeats[0]
                    ?.class_type
                : '') ||
              'Economy',
          },

          total_price:
            parsed.total_price ||
            parsed.totalPrice ||
            0,
        };

        setBookings([unifiedBooking]);
      }
    } catch (error) {
      console.error(
        'Failed reading booking session payload:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancel = (
    pnr: string
  ) => {
    const confirmed = confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmed) return;

    sessionStorage.removeItem(
      'bookingData'
    );

    setBookings([]);

    alert(
      'Booking cancelled successfully.'
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

          <p className="text-sm font-medium text-slate-400">
            Loading your itineraries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 antialiased pb-24 flex flex-col items-center">

      {/* BACKGROUND */}

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px]" />

        <div className="absolute right-[-5%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[140px]" />

      </div>

      <div className="h-32 w-full block" />

      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-12">

        {/* HEADER */}

        <div className="text-center flex flex-col items-center justify-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md">

            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />

            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">

              Your Personalized Hub

            </span>

          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl leading-tight text-white">

            Manage Your{' '}

            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">

              Bookings

            </span>

          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 text-center">

            Review your dynamic travel records, check allocation passes, reschedule itineraries or cancel trips.

          </p>

        </div>

        {/* EMPTY STATE */}

        {bookings.length === 0 ? (
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center max-w-2xl">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 mb-5">

              <Plane className="h-6 w-6 -rotate-45 text-cyan-400" />

            </div>

            <h2 className="text-xl font-bold text-slate-200">

              No upcoming trips detected

            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">

              Your future confirmed bookings will appear here.

            </p>

          </div>
        ) : (
          <div className="space-y-6 w-full flex flex-col items-center">

            {bookings.map(
              (booking) => {
                const rawPrice =
                  booking.total_price ||
                  4000;

                let carrierName =
                  'SkyLine Air';

                let codePrefix =
                  'SL';

                let colorStyles =
                  'text-cyan-400';

                if (
                  rawPrice % 4 === 0
                ) {
                  carrierName =
                    'IndiGo';

                  colorStyles =
                    'text-blue-400';

                  codePrefix =
                    '6E';
                } else if (
                  rawPrice % 3 === 0
                ) {
                  carrierName =
                    'Air India';

                  colorStyles =
                    'text-red-400';

                  codePrefix =
                    'AI';
                } else if (
                  rawPrice % 2 === 0
                ) {
                  carrierName =
                    'Akasa Air';

                  colorStyles =
                    'text-orange-400';

                  codePrefix =
                    'QP';
                } else {
                  carrierName =
                    'SpiceJet';

                  colorStyles =
                    'text-yellow-500';

                  codePrefix =
                    'SG';
                }

                const flightDisplayStr = `${codePrefix}-${booking.flight.flight_no.replace(
                  /\D/g,
                  ''
                )}`;

                return (
                  <div
                    key={
                      booking.pnr_code
                    }
                    className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl md:p-8 relative overflow-hidden transition-all duration-300 hover:border-white/20"
                  >

                    <div className="grid grid-cols-1 gap-6 items-center text-center sm:grid-cols-2 lg:grid-cols-5 justify-items-center">

                      {/* PNR */}

                      <div className="flex flex-col items-center">

                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">

                          Record Locator

                        </span>

                        <p className="text-xl font-mono font-black tracking-wider text-white mt-1 uppercase">

                          {
                            booking.pnr_code
                          }

                        </p>

                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">

                          <ShieldCheck className="h-3 w-3" />

                          Confirmed

                        </div>

                      </div>

                      {/* ROUTE */}

                      <div className="flex flex-col items-center">

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">

                          Route Info

                        </span>

                        <div className="mt-1 flex items-center justify-center gap-2 text-base font-bold text-slate-200">

                          <span>
                            {
                              booking.flight
                                .origin
                            }
                          </span>

                          <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" />

                          <span>
                            {
                              booking.flight
                                .destination
                            }
                          </span>

                        </div>

                        <span
                          className={`text-[11px] font-semibold ${colorStyles} mt-1 block`}
                        >

                          {carrierName}{' '}
                          (
                          {
                            flightDisplayStr
                          }
                          )

                        </span>

                      </div>

                      {/* SEAT */}

                      <div className="flex flex-col items-center">

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">

                          Allocation Pass

                        </span>

                        <div className="mt-1 flex items-center justify-center gap-1.5 text-base font-semibold text-slate-300">

                          <Ticket className="h-4 w-4 text-purple-400 shrink-0" />

                          <span className="text-lg font-black text-white">

                            {
                              booking.seat
                                .seat_number
                            }

                          </span>

                        </div>

                        <span className="text-[11px] text-slate-400 capitalize mt-0.5">

                          {
                            booking.seat
                              .class
                          }{' '}
                          Cabin

                        </span>

                      </div>

                      {/* PRICE */}

                      <div className="flex flex-col items-center">

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">

                          Total Paid

                        </span>

                        <p className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">

                          ₹
                          {booking.total_price.toLocaleString(
                            'en-IN'
                          )}

                        </p>

                      </div>

                      {/* ACTIONS */}

                      <div className="w-full sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-2 justify-center items-center">

                        <button
                          onClick={() =>
                            router.push(
                              `/reschedule/${booking.pnr_code}`
                            )
                          }
                          className="w-full max-w-[160px] text-center rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-400 transition-all"
                        >

                          Reschedule

                        </button>

                        <button
                          onClick={() =>
                            handleCancel(
                              booking.pnr_code
                            )
                          }
                          className="w-full max-w-[160px] flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-bold text-red-400 transition-all"
                        >

                          <Trash2 className="h-3.5 w-3.5" />

                          Cancel Trip

                        </button>

                      </div>

                    </div>

                    {/* FOOTER */}

                    <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-400 px-2">

                      {/* PASSENGER */}

                      <div className="flex flex-col items-center md:items-start gap-1">

                        <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">

                          Passenger

                        </span>

                        <span className="font-bold text-slate-200 tracking-wide text-sm">

                          {
                            booking.passenger
                              .full_name
                          }

                        </span>

                      </div>

                      {/* DATE */}

                      <div className="flex flex-col items-center md:items-start gap-1">

                        <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">

                          Departure Date

                        </span>

                        <span className="font-semibold text-cyan-300 text-sm">

                          {booking.flight
                            .departs_at
                            ? new Date(
                                booking.flight.departs_at
                              ).toLocaleDateString(
                                'en-IN',
                                {
                                  day: '2-digit',
                                  month:
                                    'short',
                                  year:
                                    'numeric',
                                }
                              )
                            : 'N/A'}

                        </span>

                      </div>

                      {/* TIME */}

                      <div className="flex flex-col items-center md:items-start gap-1">

                        <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">

                          Departure Time

                        </span>

                        <span className="font-semibold text-blue-300 text-sm">

                          {booking.flight
                            .departs_at
                            ? new Date(
                                booking.flight.departs_at
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    '2-digit',
                                  minute:
                                    '2-digit',
                                }
                              )
                            : 'N/A'}

                        </span>

                      </div>

                      {/* AIRCRAFT */}

                      <div className="flex flex-col items-center md:items-start gap-1">

                        <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">

                          Aircraft

                        </span>

                        <span className="font-semibold text-slate-300 text-sm">

                          {booking.flight
                            .aircraft_type ||
                            'Boeing 777'}

                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
}