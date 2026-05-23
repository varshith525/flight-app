'use client';

import { useEffect, useState, use } from 'react';

import {
  CheckCircle2,
  CreditCard,
  Plane,
  User,
  Calendar,
  Clock,
  Download,
  Share2,
  Globe2,
  IdCard,
  Shield,
  Armchair,
} from 'lucide-react';

interface Passenger {
  full_name: string;
  nationality: string;
  passport_no: string;
  seat_label: string;
}

interface BookingData {
  pnr: string;

  passengers: Passenger[];

  flight: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at?: string;
  };

  seats: {
    id: string;
    label: string;
    class_type: string;
    extra_fee?: number;
  }[];

  total_price: number;
}

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ pnr: string }>;
}) {
  const resolvedParams = use(params);

  const pnrCode = resolvedParams.pnr;

  const [bookingData, setBookingData] =
    useState<BookingData | null>(null);

  useEffect(() => {
    const stored =
      sessionStorage.getItem(
        'bookingData'
      );

    if (stored) {
      try {
        setBookingData(
          JSON.parse(stored)
        );
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const formatFlightSchedule = (
    isoString?: string
  ) => {
    if (!isoString) {
      return {
        date: 'May 24, 2026',
        time: '08:00 AM',
      };
    }

    const parsedDate =
      new Date(isoString);

    return {
      date:
        parsedDate.toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }
        ),

      time:
        parsedDate.toLocaleTimeString(
          'en-US',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),
    };
  };

  const schedule =
    formatFlightSchedule(
      bookingData?.flight?.departs_at
    );

  if (!bookingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

          <p className="text-slate-400">
            Loading Confirmation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-white">

      {/* BACKGROUND */}

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />

        <div className="absolute bottom-[-150px] right-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

      </div>

      {/* SPACING */}

      <div className="h-28" />

      {/* MAIN */}

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-20">

        {/* SUCCESS */}

        <div className="mb-10 flex flex-col items-center text-center">

          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.25)]">

            <CheckCircle2 className="h-10 w-10 text-emerald-400" />

          </div>

          <h1 className="text-5xl font-black tracking-tight md:text-6xl">

            Booking Confirmed

          </h1>

          <p className="mt-3 text-base text-slate-400">

            Your flight ticket has been successfully generated and issued.

          </p>

        </div>

        {/* MAIN CARD */}

        <div className="w-full rounded-[40px] border border-white/10 bg-gradient-to-br from-[#071120] to-[#020617] p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-10">

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">

            {/* LEFT */}

            <div className="space-y-8">

              {/* FLIGHT */}

              <div className="border-b border-white/5 pb-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">

                      Flight Number

                    </p>

                    <h2 className="mt-2 font-mono text-3xl font-black tracking-wide text-white">

                      {bookingData.flight.flight_no}

                    </h2>

                  </div>

                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">

                    Scheduled

                  </div>

                </div>

                {/* ROUTE */}

                <div className="mt-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">

                      Departure

                    </p>

                    <h2 className="mt-2 text-4xl font-black tracking-tight text-white">

                      {bookingData.flight.origin}

                    </h2>

                  </div>

                  <div className="flex flex-col items-center px-4">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">

                      <Plane className="h-7 w-7 rotate-90 text-cyan-400" />

                    </div>

                    <div className="mt-3 h-[2px] w-24 bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0" />

                  </div>

                  <div className="text-right">

                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">

                      Arrival

                    </p>

                    <h2 className="mt-2 text-4xl font-black tracking-tight text-white">

                      {bookingData.flight.destination}

                    </h2>

                  </div>

                </div>

              </div>

              {/* DATE + TIME */}

              <div className="grid gap-5 md:grid-cols-2">

                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">

                    <Calendar className="h-5 w-5 text-blue-400" />

                  </div>

                  <div>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">

                      Departure Date

                    </p>

                    <p className="mt-1 text-base font-bold text-white">

                      {schedule.date}

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">

                    <Clock className="h-5 w-5 text-cyan-400" />

                  </div>

                  <div>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">

                      Departure Time

                    </p>

                    <p className="mt-1 text-base font-bold text-white">

                      {schedule.time}

                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="space-y-5">

              {/* PNR */}

              <div className="rounded-[28px] border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.05] to-transparent p-6 text-center">

                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-400/90">

                  PNR CODE

                </p>

                <h2 className="mt-3 font-mono text-5xl font-black tracking-[0.18em] text-amber-400 md:text-6xl">

                  {bookingData.pnr || pnrCode}

                </h2>

              </div>

              {/* PASSENGERS */}

              <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-inner">

                <div className="mb-5 flex items-center gap-3 border-b border-white/5 pb-4">

                  <User className="h-4 w-4 text-cyan-400" />

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">

                    Passenger Details

                  </h3>

                </div>

                <div className="space-y-5">

                  {bookingData.passengers?.map(
                    (
                      passenger,
                      index
                    ) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <div>

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">

                              Passenger {index + 1}

                            </p>

                            <h4 className="mt-1 text-lg font-bold text-white">

                              {
                                passenger.full_name
                              }

                            </h4>

                          </div>

                          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300">

                            <Armchair className="h-3.5 w-3.5" />

                            {
                              passenger.seat_label
                            }

                          </div>

                        </div>

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-xl border border-white/5 bg-black/20 p-3">

                            <div className="flex items-center gap-2">

                              <Globe2 className="h-3.5 w-3.5 text-cyan-400" />

                              <span className="text-[10px] text-slate-500">

                                Nationality

                              </span>

                            </div>

                            <p className="mt-2 text-sm font-bold text-white">

                              {
                                passenger.nationality
                              }

                            </p>

                          </div>

                          <div className="rounded-xl border border-white/5 bg-black/20 p-3">

                            <div className="flex items-center gap-2">

                              <IdCard className="h-3.5 w-3.5 text-yellow-400" />

                              <span className="text-[10px] text-slate-500">

                                Passport

                              </span>

                            </div>

                            <p className="mt-2 font-mono text-sm font-bold text-yellow-400">

                              {
                                passenger.passport_no
                              }

                            </p>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* PAYMENT */}

              <div className="flex items-center justify-between rounded-[28px] border border-emerald-500/10 bg-emerald-500/[0.04] p-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">

                    <CreditCard className="h-5 w-5 text-emerald-400" />

                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">

                      Payment Status

                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-400">

                      Paid Successfully

                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">

                    Total Price

                  </p>

                  <h3 className="mt-1 font-mono text-3xl font-black text-emerald-400">

                    ₹
                    {bookingData.total_price.toLocaleString(
                      'en-IN'
                    )}

                  </h3>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-10 flex flex-wrap justify-center gap-5">

          <button className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.03]">

            <Download className="h-4 w-4" />

            Download Ticket

          </button>

          <button className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08]">

            <Share2 className="h-4 w-4" />

            Share Ticket

          </button>

        </div>

        {/* FOOT TEXT */}

        <div className="mt-6 flex items-center gap-2 text-xs tracking-wide text-slate-600">

          <Shield className="h-3.5 w-3.5" />

          SkyLine AI Secure Confirmation Node System Layer

        </div>

      </div>

      {/* FOOTER */}

      <footer className="mt-16 border-t border-white/5 bg-black/20 py-5 text-center text-xs tracking-wide text-slate-600">

        © 2026 SkyLine AI Aerospace Networks. All rights verified.

      </footer>

    </div>
  );
}