'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  MapPin,
  Clock3,
  Star,
  User,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useFlightStore, Flight } from '@/stores/flightStore';

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Goa', 'Pune', 'Ahmedabad', 'Jaipur',
  'Lucknow', 'Kochi', 'Surat', 'Nagpur', 'Patna',
  'Indore', 'Bhubaneswar', 'Visakhapatnam', 'Chandigarh', 'Coimbatore',
  'New York', 'Los Angeles', 'Chicago', 'San Francisco', 'London',
  'Manchester', 'Dubai', 'Abu Dhabi', 'Singapore', 'Tokyo',
  'Osaka', 'Paris', 'Berlin', 'Sydney', 'Melbourne',
];

const features = [
  {
    icon: <Plane className="h-8 w-8 text-blue-400 md:h-10 md:w-10" />,
    title: 'Realtime Seats',
    description: 'Live seat availability powered by realtime subscriptions.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-green-400 md:h-10 md:w-10" />,
    title: 'Secure Reservations',
    description: 'Atomic seat reservation prevents double bookings.',
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-400 md:h-10 md:w-10" />,
    title: 'Lightning Fast',
    description: 'Optimized Next.js performance.',
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-purple-400 md:h-10 md:w-10" />,
    title: 'Best Prices',
    description: 'Competitive pricing with no hidden fees.',
  },
];

const reviews = [
  {
    name: "Captain Rahul Sharma",
    role: "Frequent Flyer",
    rating: 5,
    comment: "The atomic seat locking on SkyLine AI is incredible. I managed to secure my window seat instantly during a high-traffic holiday rush without any double-booking glitches.",
    date: "May 12, 2026"
  },
  {
    name: "Sneha Hegde",
    role: "Corporate Travel Lead",
    rating: 5,
    comment: "Intelligent scheduling changed how we dispatch team flights. The Next.js routing interface is lightning fast, and managing bookings takes less than two minutes now.",
    date: "April 28, 2026"
  },
  {
    name: "Vikram Malhotra",
    role: "Tech Nomad",
    rating: 5,
    comment: "Cleanest modern UX I've seen on an aviation platform. No hidden fees, real-time subscription seat graphs, and a gorgeous glassmorphic interface that's easy on the eyes.",
    date: "May 19, 2026"
  }
];

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

HomePage.displayName = 'HomePage';

function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    setSearchQuery,
    setSelectedFlight,
    setBookingStep,
  } = useFlightStore();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [passengers, setPassengers] = useState(1);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchFlights = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!origin || !destination) {
      setError('Please select origin and destination');
      return;
    }

    if (origin === destination) {
      setError('Origin and destination cannot be same');
      return;
    }

    try {
      setLoading(true);

      /* PIPELINE STATUS: GUEST SEARCH PERMITTED
         Session verification block removed to allow unauthenticated public searches.
      */
      setSearchQuery({
        origin,
        destination,
        date,
        passengers,
      });

      const { data, error: dbError } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', origin)
        .eq('destination', destination)
        .order('base_price', { ascending: true })
        .limit(10);

      if (dbError) {
        console.error(dbError);
        setError(dbError.message);
        return;
      }

      if (!data || data.length === 0) {
        setFlights([]);
        setError('No flights found for this route.');
        return;
      }

      setFlights(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 200);
    } catch (err: any) {
      console.error('Core Flight System Exception:', err);
      setError('Failed to process search filters.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = async (flight: Flight) => {
    try {
      // Secure check deferred here: Prompt login when they attempt to book a concrete seat map
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('Anonymous navigation halted. Account required for seat allocation maps.');
        router.push('/signup');
        return;
      }

      setSelectedFlight(flight);
      setBookingStep(2);
      router.push(`/seat-selection/${flight.id}`);
    } catch (err) {
      console.error('Session clearance exception on transit handle:', err);
      router.push('/signup');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 antialiased pb-24 flex flex-col items-center select-none">
      {/* Background Mesh Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="absolute right-[-5%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[140px]" />
      </div>

      {/* Safety spacing shield below floating navbar */}
      <div className="h-32 w-full block layout-spacer" aria-hidden="true" />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-16">
        
        {/* HERO TITLE BLOCK */}
        <div className="text-center flex flex-col items-center justify-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              AI Powered Flight Booking
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-tight text-white max-w-4xl text-center">
            Book Flights{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Smarter
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-400 text-center">
            Premium airline booking platform with intelligent scheduling, secure reservations, live seat selection, and a beautiful modern UX.
          </p>
        </div>

        {/* INPUT CONTROL FORM DECK */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <form onSubmit={searchFlights} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1.2fr_140px] items-end">
            {/* ORIGIN */}
            <div className="flex flex-col text-left">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 justify-start">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" /> From
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#091120] px-4 text-sm font-medium text-white outline-none transition focus:border-cyan-500 cursor-pointer"
              >
                <option value="" className="text-slate-500">Select Departure</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* DESTINATION */}
            <div className="flex flex-col text-left">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 justify-start">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" /> To
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#091120] px-4 text-sm font-medium text-white outline-none transition focus:border-cyan-500 cursor-pointer"
              >
                <option value="" className="text-slate-500">Select Destination</option>
                {cities.filter((city) => city !== origin).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* DATE */}
            <div className="flex flex-col text-left">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 justify-start">
                <Calendar className="h-3.5 w-3.5 text-purple-400" /> Departure
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#091120] px-4 text-sm font-medium text-white outline-none transition focus:border-purple-500 cursor-pointer"
              />
            </div>

            {/* PASSENGERS INCREMENTAL CONTROLLER */}
            <div className="flex flex-col text-left">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 justify-start">
                <Users className="h-3.5 w-3.5 text-yellow-400" /> Passengers
              </label>
              <div className="flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-[#091120] px-2 text-sm font-medium text-white">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer font-bold text-base select-none"
                >
                  −
                </button>
                <span className="font-semibold text-sm min-w-[70px] text-center select-none text-slate-200">
                  {passengers} {passengers > 1 ? 'Travellers' : 'Traveller'}
                </span>
                <button
                  type="button"
                  onClick={() => setPassengers(passengers + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer font-bold text-base select-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* BUTTON CONTROLLERS */}
            <div className="flex flex-col justify-end w-full">
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition-all hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                {loading ? 'Validating...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-medium text-red-400 w-full">
              {error}
            </div>
          )}
        </div>

        {/* DYNAMIC SEARCH FLIGHTS RESULTS ELEMENT */}
        <div ref={resultsRef} className="scroll-mt-32 w-full">
          {flights.length > 0 && (
            <div className="w-full flex flex-col items-center">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black tracking-tight text-white">Available Flights</h2>
                <p className="mt-1 text-sm text-slate-400">Showing best live fares computed for your route selection</p>
              </div>

              <div className="space-y-4 w-full">
                {flights.map((flight) => {
                  const airline = getAirlineDetails(flight.flight_no, flight.base_price);
                  const parsedFlightNo = `${airline.codePrefix}-${flight.flight_no.replace(/\D/g, '') || '731'}`;
                  
                  return (
                    <div
                      key={flight.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md transition hover:border-white/20 w-full"
                    >
                      <div className="grid grid-cols-1 gap-6 items-center text-center sm:grid-cols-2 lg:grid-cols-5 justify-items-center">
                        
                        {/* BRAND IDENTITIES */}
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${airline.color}`}>
                            {airline.name}
                          </span>
                          <p className="text-xl font-bold tracking-tight text-white mt-0.5">
                            {parsedFlightNo}
                          </p>
                        </div>

                        {/* ROUTE GEOMETRY */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Route</span>
                          <div className="mt-1 flex items-center justify-center gap-2 text-base font-semibold text-slate-200">
                            <span>{flight.origin}</span>
                            <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" />
                            <span>{flight.destination}</span>
                          </div>
                        </div>

                        {/* SCHEDULE DEPARTURE */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Departure</span>
                          <div className="mt-1 flex items-center justify-center gap-1.5 text-base font-medium text-slate-300">
                            <Clock3 className="h-4 w-4 text-cyan-500 shrink-0" />
                            <span>
                              {new Date(flight.departs_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* AGGREGATED PRICING MATRIX */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Fares From</span>
                          <p className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                            ₹{flight.base_price.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* INTERACTION ACTION BUTTON */}
                        <div className="w-full sm:col-span-2 lg:col-span-1 flex justify-center">
                          <button
                            onClick={() => handleSelectFlight(flight)}
                            className="flex w-full max-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.02] shadow-md shadow-blue-600/10 cursor-pointer"
                          >
                            Select Seats
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* METRICS PLATFORM ADVANTAGES ROW */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full justify-items-center">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/10 flex flex-col items-center text-center w-full max-w-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-2">
                {feature.icon}
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-200">{feature.title}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-normal max-w-[220px]">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* TESTIMONIAL PANEL CARDS */}
        <div className="border-t border-white/5 pt-12 w-full flex flex-col items-center">
          <div className="mb-10 text-center flex flex-col items-center">
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-400 uppercase ring-1 ring-cyan-500/20 w-max">
              User Reviews
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              Trusted by Elite Travellers
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 w-full justify-items-center items-stretch">
            {reviews.map((review, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-sm flex flex-col justify-between text-center items-center w-full max-w-sm"
              >
                <div className="flex flex-col items-center w-full">
                  <div className="flex gap-0.5 justify-center mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300 italic px-2">
                    "{review.comment}"
                  </p>
                </div>
                
                <div className="mt-6 flex flex-col items-center gap-2 border-t border-white/5 pt-4 w-full justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="text-xs font-bold text-white">{review.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{review.role} • {review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default HomePage;