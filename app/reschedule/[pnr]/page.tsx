'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  Calendar,
  Clock3,
  ArrowLeft,
  Save,
  Plane,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function ReschedulePage() {
  const router = useRouter();

  const params = useParams();

  const supabase = createClient();

  const pnr = params?.pnr as string;

  const [booking, setBooking] =
    useState<any>(null);

  const [newDate, setNewDate] =
    useState('');

  const [newTime, setNewTime] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const stored =
      sessionStorage.getItem(
        'bookingData'
      );

    if (!stored) {
      router.push('/my-bookings');
      return;
    }

    const parsed = JSON.parse(stored);

    setBooking(parsed);

    const departure =
      parsed.flight?.departs_at;

    if (departure) {
      const dateObj =
        new Date(departure);

      const yyyy =
        dateObj.getFullYear();

      const mm = String(
        dateObj.getMonth() + 1
      ).padStart(2, '0');

      const dd = String(
        dateObj.getDate()
      ).padStart(2, '0');

      const hh = String(
        dateObj.getHours()
      ).padStart(2, '0');

      const min = String(
        dateObj.getMinutes()
      ).padStart(2, '0');

      setNewDate(
        `${yyyy}-${mm}-${dd}`
      );

      setNewTime(`${hh}:${min}`);
    }
  }, [router]);

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!booking) return;

      const oldDeparture =
        booking.flight?.departs_at;

      /* NEW UPDATED DATETIME */

      const updatedDateTime =
        new Date(
          `${newDate}T${newTime}`
        ).toISOString();

      /* 2 HOUR RULE */

      const now = new Date();

      const selectedTime =
        new Date(updatedDateTime);

      const differenceMs =
        selectedTime.getTime() -
        now.getTime();

      const differenceHours =
        differenceMs / (1000 * 60 * 60);

      if (differenceHours < 2) {
        alert(
          'Flights can only be rescheduled at least 2 hours before departure.'
        );

        setLoading(false);

        return;
      }

      /* UPDATE LOCAL SESSION */

      const updatedBooking = {
        ...booking,

        flight: {
          ...booking.flight,

          departs_at:
            updatedDateTime,
        },
      };

      sessionStorage.setItem(
        'bookingData',
        JSON.stringify(
          updatedBooking
        )
      );

      /* UPDATE BOOKINGS TABLE */

      const { data: bookingRow, error: bookingFetchError } =
        await supabase
          .from('bookings')
          .select('*')
          .eq(
            'pnr_code',
            pnr
          )
          .single();

      if (
        bookingFetchError ||
        !bookingRow
      ) {
        console.error(
          bookingFetchError
        );

        alert(
          'Booking record not found.'
        );

        return;
      }

      const { error: updateError } =
        await supabase
          .from('bookings')
          .update({
            departure_date:
              updatedDateTime,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'pnr_code',
            pnr
          );

      if (updateError) {
        console.error(
          updateError
        );

        alert(
          'Failed to update booking.'
        );

        return;
      }

      /* INSERT RESCHEDULE HISTORY */

      const {
        error: rescheduleError,
      } = await supabase
        .from('reschedules')
        .insert({
          booking_id:
            bookingRow.id,

          old_flight_id:
            bookingRow.flight_id,

          new_flight_id:
            bookingRow.flight_id,

          old_departure:
            oldDeparture,

          new_departure:
            updatedDateTime,

          requested_at:
            new Date().toISOString(),
        });

      if (rescheduleError) {
        console.error(
          rescheduleError
        );
      }

      alert(
        'Flight rescheduled successfully.'
      );

      router.push(
        '/my-bookings'
      );

    } catch (error) {
      console.error(error);

      alert(
        'Failed to reschedule booking.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4 pt-32 pb-20">

      {/* BACKGROUND */}

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[140px]" />

        <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

      </div>

      {/* MAIN CONTAINER */}

      <div className="w-full max-w-2xl mx-auto flex flex-col justify-center">

        {/* BACK BUTTON */}

        <button
          onClick={() =>
            router.push(
              '/my-bookings'
            )
          }
          className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all w-fit"
        >

          <ArrowLeft className="h-4 w-4" />

          Back to Bookings

        </button>

        {/* CARD */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">

          {/* HEADER */}

          <div className="text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">

              <Plane className="h-6 w-6 text-cyan-400" />

            </div>

            <h1 className="text-4xl font-black text-white">

              Reschedule Flight

            </h1>

            <p className="mt-3 text-sm text-slate-400">

              Modify departure date and timing for booking{' '}

              <span className="font-bold text-cyan-400 uppercase">

                {pnr}

              </span>

            </p>

          </div>

          {/* ROUTE */}

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b1220] p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-2xl font-black text-white">

                  {
                    booking.flight
                      ?.origin
                  }

                </p>

                <p className="text-xs uppercase text-slate-500 mt-1">

                  Departure

                </p>

              </div>

              <Plane className="h-5 w-5 text-cyan-400" />

              <div className="text-right">

                <p className="text-2xl font-black text-white">

                  {
                    booking.flight
                      ?.destination
                  }

                </p>

                <p className="text-xs uppercase text-slate-500 mt-1">

                  Arrival

                </p>

              </div>

            </div>

          </div>

          {/* FORM */}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* DATE */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">

                <Calendar className="h-4 w-4 text-blue-400" />

                New Departure Date

              </label>

              <input
                type="date"
                value={newDate}
                min={
                  new Date()
                    .toISOString()
                    .split('T')[0]
                }
                onChange={(e) =>
                  setNewDate(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-[#091120] px-4 text-sm font-medium text-white outline-none transition focus:border-blue-500"
              />

            </div>

            {/* TIME */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">

                <Clock3 className="h-4 w-4 text-cyan-400" />

                New Departure Time

              </label>

              <input
                type="time"
                value={newTime}
                onChange={(e) =>
                  setNewTime(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-[#091120] px-4 text-sm font-medium text-white outline-none transition focus:border-cyan-500"
              />

            </div>

          </div>

          {/* SAVE BUTTON */}

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-50"
          >

            <Save className="h-4 w-4" />

            {loading
              ? 'Saving Changes...'
              : 'Save Rescheduled Flight'}

          </button>

        </div>

      </div>

    </div>
  );
}