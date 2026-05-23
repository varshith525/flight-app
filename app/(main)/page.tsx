'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/stores/flightStore';
import { useUserStore } from '@/stores/userStore';
import { createClient } from '@/lib/supabase/client';

interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  base_price: number;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { setSearchQuery, setSelectedFlight } = useFlightStore();
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const searchFlights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setSearched(true);
    setErrorMsg('');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      let url = `${supabaseUrl}/rest/v1/flights?origin=eq.${origin}&destination=eq.${destination}&select=*`;
      
      if (date) {
        url += `&departs_at=gte.${date}T00:00:00&departs_at=lte.${date}T23:59:59`;
      }
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey!,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      });
      
      const data = await response.json();
      setFlights(data || []);
      
      if (data?.length === 0) {
        setErrorMsg(`No flights found from ${origin} to ${destination}.`);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setErrorMsg(err.message || 'Something went wrong');
    }

    setLoading(false);
  };

  const selectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setSearchQuery({ origin, destination, date, passengers });
    router.push(`/seat-selection/${flight.id}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">✈️ Search Flights</h1>

        {/* Search Form */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
          <form onSubmit={searchFlights} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">From</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Origin</option>
                  <option value="DEL">Delhi (DEL)</option>
                  <option value="BOM">Mumbai (BOM)</option>
                  <option value="BLR">Bangalore (BLR)</option>
                  <option value="HYD">Hyderabad (HYD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">To</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Destination</option>
                  <option value="DEL">Delhi (DEL)</option>
                  <option value="BOM">Mumbai (BOM)</option>
                  <option value="BLR">Bangalore (BLR)</option>
                  <option value="HYD">Hyderabad (HYD)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Departure Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Passengers</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {errorMsg}
          </div>
        )}

        {searched && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">
              {flights.length} {flights.length === 1 ? 'Flight' : 'Flights'} Found
            </h2>

            <div className="space-y-4">
              {flights.map((flight) => (
                <div key={flight.id} className="bg-gray-900 rounded-lg shadow-md p-4 hover:shadow-lg transition-all border border-gray-700">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-bold text-lg bg-blue-900 px-2 py-1 rounded text-white">{flight.flight_no}</span>
                        <span className="text-sm text-gray-400">{flight.aircraft_type}</span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div>
                          <div className="font-bold text-xl text-white">{flight.origin}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(flight.departs_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-gray-500 text-xl">→</div>
                        <div>
                          <div className="font-bold text-xl text-white">{flight.destination}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(flight.arrives_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <div className="text-2xl font-bold text-blue-400">
                        ₹{(flight.base_price * passengers).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">for {passengers} passenger(s)</div>
                      <button
                        onClick={() => selectFlight(flight)}
                        className="mt-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
