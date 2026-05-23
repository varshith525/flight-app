'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SeatMap from '@/components/SeatMap';
import { useFlightStore } from '@/stores/flightStore';
import { Plane, Users, Armchair, CreditCard, ArrowLeft, ChevronRight } from 'lucide-react';

interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  aircraft_type: string;
  base_price: number;
}

function getAirlineDetails(flightNo: string, basePrice: number) {
  if (basePrice % 4 === 0) {
    return { name: 'IndiGo', color: 'text-blue-400', codePrefix: '6E' };
  } else if (basePrice % 3 === 0) {
    return { name: 'Air India', color: 'text-red-400', codePrefix: 'AI' };
  } else if (basePrice % 2 === 0) {
    return { name: 'Akasa Air', color: 'text-orange-400', codePrefix: 'QP' };
  } else {
    return { name: 'SpiceJet', color: 'text-yellow-500', codePrefix: 'SG' };
  }
}

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const flightId = params.id as string;
  const { searchQuery } = useFlightStore();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetPassengerCount, setTargetPassengerCount] = useState<number>(1);

  useEffect(() => {
    if (searchQuery?.passengers) {
      setTargetPassengerCount(searchQuery.passengers);
      sessionStorage.setItem('fallback_passenger_count', String(searchQuery.passengers));
    } else {
      const storedFallback = sessionStorage.getItem('fallback_passenger_count');
      if (storedFallback) {
        setTargetPassengerCount(Number(storedFallback));
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const { data, error } = await supabase
          .from('flights')
          .select('*')
          .eq('id', flightId)
          .single();

        if (error) {
          console.error(error);
          return;
        }
        setFlight(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (flightId) {
      fetchFlight();
    }
  }, [flightId, supabase]);

  // Robust seat selection validation parser
  const handleSeatSelect = (seat: any) => {
    if (!seat) return;

    // Check if seat is already in selected group by checking both id or seat_number
    const alreadySelected = selectedSeats.find((s) => s.id === seat.id || s.seat_number === seat.seat_number);

    if (alreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id && s.seat_number !== seat.seat_number));
      return;
    }

    if (selectedSeats.length >= targetPassengerCount) {
      alert(`You can only select ${targetPassengerCount} seat(s) as per your choice configuration.`);
      return;
    }

    setSelectedSeats([...selectedSeats, seat]);
  };

  const totalPrice = flight
    ? (flight.base_price * selectedSeats.length) +
      selectedSeats.reduce((total, seat) => total + (seat.extra_fee || 0), 0)
    : 0;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat layout allocation inside the cabin map before proceeding.");
      return;
    }

    try {
      // Save data under plural and singular keys to guarantee compatibility with your booking page parser
      sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
      sessionStorage.setItem('selectedSeat', JSON.stringify(selectedSeats[0] || null));
      sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
      
      // Push navigation to Next.js route engine cleanly
      router.push('/booking');
    } catch (routeErr) {
      console.warn("Client route transition failed, applying window location override strategy:", routeErr);
      window.location.href = '/booking';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading seat layout configuration...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-red-400">
        <p className="text-lg font-medium">Flight asset parameters not found</p>
      </div>
    );
  }

  const airline = getAirlineDetails(flight.flight_no, flight.base_price);
  const displayFlightNo = `${airline.codePrefix}-${flight.flight_no.replace(/\D/g, '') || '731'}`;

  // Button is enabled if you have selected at least one seat layout item
  const isButtonDisabled = selectedSeats.length === 0;

  return (
    <div className="min-h-screen w-full bg-[#020617] bg-gradient-to-b from-[#020617] via-black to-[#0b1329] text-slate-100 antialiased flex flex-col justify-between">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute right-[-5%] top-[20%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="w-full h-24 block" aria-hidden="true" />

      <div className="flex-grow flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full max-w-7xl space-y-6">
          
          <div className="flex justify-start">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to flights
            </button>
          </div>

          <div className="text-center border-b border-slate-800/60 pb-6 space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Select Your Seats
            </h1>
            <p className="text-sm md:text-base text-slate-400 flex items-center justify-center gap-2">
              <span className="font-semibold text-slate-200">{flight.origin}</span>
              <span className="text-slate-600">→</span>
              <span className="font-semibold text-slate-200">{flight.destination}</span>
              <span className="mx-2 h-1 w-1 rounded-full bg-slate-700" />
              <span className={`${airline.color} font-medium`}>{airline.name} ({displayFlightNo})</span>
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start w-full">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl shadow-2xl min-h-[500px] flex flex-col justify-between">
              <div className="mb-6 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  Aircraft Cabin Map Facing Forward
                </span>
              </div>
              
              <div className="flex-grow flex justify-center items-center w-full overflow-x-auto py-4">
                <div className="w-full max-w-3xl min-w-[300px]">
                  <SeatMap
                    flightId={flight.id}
                    onSeatSelect={handleSeatSelect}
                    selectedSeatIds={selectedSeats.map((seat) => seat.id || seat.seat_number)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 shadow-xl backdrop-blur-md lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight border-b border-slate-800/60 pb-4">
                Flight Summary
              </h2>

              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Plane className="h-3 w-3 -rotate-45" /> Carrier
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">{airline.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{displayFlightNo}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Equipment</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200 truncate" title={flight.aircraft_type}>
                      {flight.aircraft_type || 'Boeing 737'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-800/40 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> Party Size
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {targetPassengerCount} Ticket{targetPassengerCount > 1 ? 's' : ''} Required
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Armchair className="h-3.5 w-3.5 text-cyan-400" /> Selected Allocations
                    </p>
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {selectedSeats.length}/{targetPassengerCount}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((seat) => (
                        <div
                          key={seat.id || seat.seat_number}
                          className="inline-flex items-center rounded-lg bg-amber-400 text-slate-950 px-2.5 py-1 text-xs font-mono font-bold ring-1 ring-amber-400/20"
                        >
                          {seat.seat_number}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs italic text-slate-500 py-1">
                        Tap desired seats inside the cabin layout map...
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-800/40 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="h-3 w-3" /> Ledger Aggregate
                    </p>
                    <p className="text-2xl font-black tracking-tight text-emerald-400 mt-1">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Base fare + fees</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isButtonDisabled}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none cursor-pointer"
                >
                  Continue to Booking
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer className="w-full py-6 border-t border-white/5 bg-black/40 backdrop-blur-md text-center text-xs text-slate-500 tracking-wide">
        © 2026 SkyLine AI Aerospace Systems. All rights monitored by AI flight infrastructure protocols.
      </footer>
    </div>
  );
}