'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Crown,
  Loader2,
  Plane,
  Sofa,
  Star,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

import { useFlightStore } from '@/stores/flightStore';

interface Seat {
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

interface SeatMapProps {
  flightId: string;
  onSeatSelect: (seat: Seat) => void;
  // CHANGED FROM selectedSeatId?: string TO MATCH YOUR parent page.tsx ARRAY PASS
  selectedSeatIds: string[];
}

export default function SeatMap({
  flightId,
  onSeatSelect,
  selectedSeatIds = [], // Fallback assignment array
}: SeatMapProps) {
  const supabase = createClient();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { optimisticSelectSeat } = useFlightStore();

  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* SEAT MAP */
  const seatMap = useMemo(() => {
    const map = new Map<string, Seat>();
    seats.forEach((seat) => {
      map.set(seat.seat_number, seat);
    });
    return map;
  }, [seats]);

  /* FETCH SEATS */
  useEffect(() => {
    fetchSeats();

    const channel = supabase
      .channel(`seat-live-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          const updatedSeat = payload.new as Seat;
          setSeats((prevSeats) =>
            prevSeats.map((seat) =>
              seat.id === updatedSeat.id ? updatedSeat : seat
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flightId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('flight_id', flightId)
        .order('seat_number');

      if (error) throw error;
      setSeats(data || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load seats.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) return;
    optimisticSelectSeat(seat);
    onSeatSelect(seat);
  };

  const getSeatColor = (seat: Seat) => {
    // 1. CRITICAL HIGHLIGHT RULE OVERRIDE: Check if item is inside your selections array
    if (selectedSeatIds.includes(seat.id)) {
      return 'bg-amber-400 border-amber-300 text-slate-950 font-black ring-4 ring-amber-400/30 scale-105 shadow-amber-400/30';
    }

    // 2. OCCUPIED CHECK FALLBACK RULE
    if (!seat.is_available) {
      return 'bg-red-600/70 border-red-400/20 opacity-60 cursor-not-allowed text-white';
    }

    // 3. PRESERVE ORIGINAL CABIN CLASS BRAND IDENTITIES
    switch (seat.class) {
      case 'first':
        return 'bg-purple-600 hover:bg-purple-500 border-purple-400/30 shadow-purple-500/20 text-white';
      case 'business':
        return 'bg-blue-600 hover:bg-blue-500 border-blue-400/30 shadow-blue-500/20 text-white';
      default:
        return 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/30 shadow-emerald-500/20 text-white';
    }
  };

  const getSeat = (row: number, col: string) => {
    return seatMap.get(`${row}${col}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-14 w-14 animate-spin text-blue-400" />
          <p className="text-gray-400">Loading cabin seats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0b1120]/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
      {/* HEADER */}
      <div className="border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-8 text-center">
        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
          <Plane className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold tracking-[0.25em] text-gray-300">
            LIVE AIRCRAFT CABIN
          </span>
        </div>
        <h2 className="mt-5 text-3xl font-black text-white">
          Choose Your Perfect Seat
        </h2>
        <p className="mt-3 text-gray-400">Real-time seat availability</p>
      </div>

      {/* LEGEND */}
      <div className="border-b border-white/10 bg-black/20 px-6 py-5">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Legend color="bg-purple-600" label="First Class" icon={<Crown className="h-4 w-4" />} />
          <Legend color="bg-blue-600" label="Business" icon={<Star className="h-4 w-4" />} />
          <Legend color="bg-emerald-600" label="Economy" icon={<Sofa className="h-4 w-4" />} />
          <Legend color="bg-amber-400" label="Selected" />
          <Legend color="bg-red-600" label="Occupied" />
        </div>
      </div>

      {/* AIRCRAFT TOP */}
      <div className="flex justify-center pt-8">
        <div className="flex h-24 w-44 items-center justify-center rounded-t-full border border-white/10 border-b-0 bg-gradient-to-b from-gray-700/30 to-transparent">
          <Plane className="h-10 w-10 rotate-90 text-blue-400" />
        </div>
      </div>

      {/* SEAT GRID */}
      <div className="overflow-x-auto px-6 pb-10">
        <div className="mx-auto min-w-[760px] max-w-5xl">
          {rows.map((row) => {
            const cabinLabel =
              row === 1
                ? 'FIRST CLASS'
                : row === 3
                ? 'BUSINESS CLASS'
                : row === 9
                ? 'ECONOMY CLASS'
                : null;

            return (
              <div key={row}>
                {cabinLabel && (
                  <div className="my-7 flex justify-center">
                    <div className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-bold tracking-[0.3em] text-gray-300 backdrop-blur-xl">
                      {cabinLabel}
                    </div>
                  </div>
                )}

                <div className="mb-3 flex items-center justify-center gap-2">
                  {/* ROW NUMBER COLUMN ELEMENT */}
                  <div className="mr-2 flex w-10 items-center justify-center text-sm font-bold text-gray-500">
                    {row}
                  </div>

                  {columns.map((col) => {
                    const seat = getSeat(row, col);

                    if (!seat) {
                      return <div key={col} className="h-14 w-14" />;
                    }

                    const isSelected = selectedSeatIds.includes(seat.id);

                    return (
                      <div key={col} className="relative">
                        {/* AISLE RECOGNITION SPACING CHANNELS */}
                        {col === 'D' && <div className="mr-7" />}

                        <button
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={!seat.is_available}
                          className={`
                            relative
                            h-14 w-14
                            rounded-2xl
                            border
                            shadow-lg
                            transition-all
                            duration-200
                            hover:-translate-y-1
                            hover:shadow-2xl
                            active:scale-95
                            ${getSeatColor(seat)}
                          `}
                        >
                          {/* SEAT IDENTITY STRING LABELS */}
                          <div className="text-[11px] font-bold">
                            {seat.seat_number}
                          </div>

                          <div className={`mt-1 text-[10px] ${isSelected ? 'text-slate-900/70 font-semibold' : 'opacity-80'}`}>
                            {seat.class === 'first'
                              ? 'F'
                              : seat.class === 'business'
                              ? 'B'
                              : 'E'}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOOLTIP OVERLAYS FEEDBACK CONTROLS */}
      {hoveredSeat && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl border border-white/10 bg-[#111827]/95 px-6 py-4 shadow-2xl backdrop-blur-2xl">
          <div className="text-lg font-bold text-white">
            Seat {hoveredSeat.seat_number}
          </div>
          <div className="mt-1 text-sm text-gray-300">
            {hoveredSeat.class.toUpperCase()} CLASS
          </div>
          {hoveredSeat.extra_fee > 0 && (
            <div className="mt-1 text-sm text-yellow-400">
              +₹{hoveredSeat.extra_fee}
            </div>
          )}
          {!hoveredSeat.is_available && (
            <div className="mt-1 text-sm text-red-400">Occupied</div>
          )}
        </div>
      )}
    </div>
  );
}

/* LEGEND COMPONENT SUBELEMENT */
interface LegendProps {
  color: string;
  label: string;
  icon?: React.ReactNode;
}

function Legend({ color, label, icon }: LegendProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
      <div className={`h-4 w-4 rounded-full ${color}`} />
      {icon}
      <span className="text-xs font-medium text-gray-300">{label}</span>
    </div>
  );
}