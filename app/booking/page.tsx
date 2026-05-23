'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  User,
  Globe2,
  IdCard,
  ArrowRight,
  ArrowLeft,
  Calendar,
  PlaneTakeoff,
  Armchair,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

interface SeatSelection {
  id: string;
  label: string;
  class_type: string;
  extra_fee?: number;
}

interface FlightData {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  base_price: number;
  carrier?: string;
}

export default function BookingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedSeats, setSelectedSeats] = useState<SeatSelection[]>([]);
  const [flightInfo, setFlightInfo] = useState<FlightData | null>(null);

  const [passengersData, setPassengersData] = useState<
    {
      fullName: string;
      nationality: string;
      passportNo: string;
    }[]
  >([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSessionContext = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signup');
        return;
      }

      const storedSeats = sessionStorage.getItem('selectedSeats');
      const singleSeat = sessionStorage.getItem('selectedSeat');
      const storedFlight = sessionStorage.getItem('selectedFlight');

      let seats: SeatSelection[] = [];

      if (storedSeats) {
        seats = JSON.parse(storedSeats);
      } else if (singleSeat) {
        seats = [JSON.parse(singleSeat)];
      }

      if (storedFlight) {
        setFlightInfo(JSON.parse(storedFlight));
      }

      if (seats.length === 0) {
        router.push('/home');
        return;
      }

      setSelectedSeats(seats);

      setPassengersData(
        seats.map(() => ({
          fullName: '',
          nationality: 'Indian',
          passportNo: '',
        }))
      );
    };

    loadSessionContext();
  }, [router, supabase]);

  const handleInputChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setPassengersData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleBackToSeats = () => {
    if (flightInfo) {
      router.push(`/seat-selection/${flightInfo.id}`);
    } else {
      router.back();
    }
  };

  const handleBooking = async () => {
    for (let i = 0; i < passengersData.length; i++) {
      if (!passengersData[i].fullName.trim()) {
        alert(`Please enter Full Name for Passenger ${i + 1}`);
        return;
      }

      if (!passengersData[i].passportNo.trim()) {
        alert(`Please enter Passport Number for Passenger ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);

      /* GET LOGGED IN USER */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signup');
        return;
      }

      if (!flightInfo) {
        alert('Flight information missing');
        return;
      }

      /* GENERATE PNR */
      const generatedPnr = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      /* CALCULATE TOTAL */
      const totalSeatsFee = selectedSeats.reduce(
        (acc, seat) => acc + (seat.extra_fee || 0),
        0
      );

      const computedTotal =
        flightInfo.base_price * selectedSeats.length + totalSeatsFee + 720;

      /* INSERT EACH PASSENGER BOOKING INTO SUPABASE */
      for (let i = 0; i < passengersData.length; i++) {
        const passenger = passengersData[i];
        const seat = selectedSeats[i];

        // 1. Insert into 'bookings' table with exact database column names
        const { data: bookingRow, error: bookingError } = await supabase
          .from('bookings')
          .insert({
            user_id: user.id,
            flight_id: flightInfo.id,
            seat_id: seat.id,
            total_price: computedTotal,
            pnr_code: generatedPnr, // Maps explicitly to your database table column
            status: 'confirmed'
          })
          .select()
          .single();

        if (bookingError) {
          console.error('Booking Error Details:', bookingError);
          alert(`Booking Error: ${bookingError.message}`);
          return;
        }

        // 2. Insert into 'passengers' table using the newly generated booking ID
        const { error: passengerError } = await supabase
          .from('passengers')
          .insert({
            booking_id: bookingRow.id,
            full_name: passenger.fullName,
            passport_no: passenger.passportNo,
            nationality: passenger.nationality
          });

        if (passengerError) {
          console.error('Passenger Error Details:', passengerError);
          alert(`Passenger Details Error: ${passengerError.message}`);
          return;
        }
      }

      /* STORE SESSION DATA FOR THE CONFIRMATION DASHBOARD */
      const bookingData = {
        pnr: generatedPnr,
        passengers: passengersData.map((p, idx) => ({
          full_name: p.fullName,
          nationality: p.nationality,
          passport_no: p.passportNo,
          seat_label: selectedSeats[idx]?.label,
        })),
        flight: flightInfo,
        seats: selectedSeats,
        total_price: computedTotal,
      };

      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

      /* REDIRECT TO CONFIRMATION SCREEN */
      router.push(`/confirmation/${generatedPnr}`);

    } catch (error) {
      console.error(error);
      alert('Failed to save booking.');
    } finally {
      setLoading(false);
    }
  };

  const baseFaresAggregate = flightInfo
    ? flightInfo.base_price * selectedSeats.length
    : 0;

  const seatFeesAggregate = selectedSeats.reduce(
    (acc, s) => acc + (s.extra_fee || 0),
    0
  );

  const finalLedgerTotal = baseFaresAggregate + seatFeesAggregate;

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 antialiased overflow-x-hidden">
      
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute left-[15%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute right-[15%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[130px]" />
      </div>

      {/* MAIN CENTER CONTAINER */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">

        {/* TOP BAR */}
        <div className="w-full max-w-6xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-white/5 pb-6">
          <button
            onClick={handleBackToSeats}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white cursor-pointer w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Seats
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 self-start sm:self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Security Protocol Active
            </span>
          </div>
        </div>

        {/* PAGE TITLE */}
        <div className="w-full max-w-6xl mb-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Review & Complete Booking
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Finalize passenger details and secure your reservation
          </p>
        </div>

        {/* DATA CONTAINER GRID */}
        <div className="grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[1.4fr_0.9fr] items-start justify-center">

          {/* LEFT SECTION: PASSENGER INPUT CARDS */}
          <div className="space-y-6 w-full">
            {passengersData.map((passenger, index) => {
              const isFilled =
                passenger.fullName.trim() && passenger.passportNo.trim();

              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-6 transition-all duration-300 backdrop-blur-md bg-slate-900/20 ${
                    isFilled
                      ? 'border-blue-500/30 shadow-lg shadow-blue-950/20'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                          isFilled
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">
                          Passenger {index + 1} Details
                        </h3>
                        <p className="text-[11px] text-slate-500 uppercase font-medium tracking-wider">
                          Adult Traveller
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-cyan-300">
                      <Armchair className="h-3.5 w-3.5 text-cyan-400" />
                      Seat {selectedSeats[index]?.label || '---'}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* FULL NAME */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <User className="h-3.5 w-3.5 text-blue-400" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="As written on official passport"
                        value={passenger.fullName}
                        onChange={(e) =>
                          handleInputChange(index, 'fullName', e.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-white/10 bg-[#070d19] px-4 text-xs font-medium text-white outline-none transition focus:border-blue-500"
                      />
                    </div>

                    {/* PASSPORT & NATIONALITY ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PASSPORT */}
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <IdCard className="h-3.5 w-3.5 text-orange-400" />
                          Passport Number
                        </label>
                        <input
                          type="text"
                          placeholder="E.g. Z1234567"
                          value={passenger.passportNo}
                          onChange={(e) =>
                            handleInputChange(index, 'passportNo', e.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-white/10 bg-[#070d19] px-4 text-xs font-medium text-white outline-none transition focus:border-blue-500"
                        />
                      </div>

                      {/* NATIONALITY */}
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
                          Nationality
                        </label>
                        <select
                          value={passenger.nationality}
                          onChange={(e) =>
                            handleInputChange(index, 'nationality', e.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-white/10 bg-[#070d19] px-4 text-xs font-medium text-white outline-none transition focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Indian">Indian</option>
                          <option value="American">American</option>
                          <option value="British">British</option>
                          <option value="Emirati">Emirati</option>
                          <option value="Singaporean">Singaporean</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT SECTION: ITINERARY LEDGER & SUBMIT BUTTON */}
          <div className="w-full max-w-md mx-auto lg:max-w-none lg:sticky lg:top-40 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#090f1c]/90 p-5 backdrop-blur-xl shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Flight Itinerary Summary
              </h3>

              {flightInfo && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                    <div>
                      <p className="text-xl font-black text-white">
                        {flightInfo.origin}
                      </p>
                    </div>

                    <PlaneTakeoff className="h-5 w-5 text-cyan-400" />

                    <div className="text-right">
                      <p className="text-xl font-black text-white">
                        {flightInfo.destination}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Fare</span>
                      <span className="font-semibold text-white">
                        ₹{baseFaresAggregate.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Seat Fees</span>
                      <span className="font-semibold text-white">
                        ₹{seatFeesAggregate.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxes</span>
                      <span className="font-semibold text-white">₹720</span>
                    </div>

                    <div className="flex justify-between border-t border-white/10 pt-3 mt-3">
                      <span className="font-bold text-white">Grand Total</span>
                      <span className="text-2xl font-black text-emerald-400">
                        ₹{(finalLedgerTotal + 720).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing Secure Booking...' : 'Complete Secure Reservation'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}