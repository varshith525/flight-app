-- Professional Flight Management Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Flights table
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_no VARCHAR(10) NOT NULL UNIQUE,
    origin VARCHAR(3) NOT NULL,
    destination VARCHAR(3) NOT NULL,
    departs_at TIMESTAMPTZ NOT NULL,
    arrives_at TIMESTAMPTZ NOT NULL,
    aircraft_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    base_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seats table
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    seat_number VARCHAR(5) NOT NULL,
    class VARCHAR(20) CHECK (class IN ('economy', 'business', 'first')),
    is_available BOOLEAN DEFAULT TRUE,
    extra_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(flight_id, seat_number)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id),
    seat_id UUID REFERENCES seats(id),
    status VARCHAR(20) DEFAULT 'confirmed',
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    total_price DECIMAL(10,2) NOT NULL,
    pnr_code VARCHAR(8) UNIQUE NOT NULL,
    passenger_name VARCHAR(200) NOT NULL,
    passenger_passport VARCHAR(20) NOT NULL,
    passenger_nationality VARCHAR(100) NOT NULL,
    passenger_dob DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reschedules table
CREATE TABLE reschedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    old_flight_id UUID REFERENCES flights(id),
    new_flight_id UUID REFERENCES flights(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    fee_charged DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Flights are viewable by everyone" ON flights
    FOR SELECT USING (true);

CREATE POLICY "Seats are viewable by everyone" ON seats
    FOR SELECT USING (true);

CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reschedules" ON reschedules
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid())
    );

-- RPC Function: Atomic seat reservation (prevents double-booking)
CREATE OR REPLACE FUNCTION reserve_seat_atomic(
    p_flight_id UUID,
    p_seat_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_seat seats%ROWTYPE;
    v_result JSONB;
BEGIN
    SELECT * INTO v_seat FROM seats 
    WHERE id = p_seat_id AND flight_id = p_flight_id
    FOR UPDATE NOWAIT;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Seat not found');
    END IF;
    
    IF v_seat.is_available = FALSE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Seat already booked');
    END IF;
    
    UPDATE seats SET is_available = FALSE WHERE id = p_seat_id;
    
    RETURN jsonb_build_object('success', true, 'seat', row_to_json(v_seat));
END;
$$;

-- RPC Function: Atomic cancellation with 2-hour rule
CREATE OR REPLACE FUNCTION cancel_booking_atomic(
    p_booking_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking bookings%ROWTYPE;
    v_flight flights%ROWTYPE;
BEGIN
    SELECT b.* INTO v_booking FROM bookings b 
    WHERE b.id = p_booking_id AND b.user_id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;
    
    SELECT * INTO v_flight FROM flights WHERE id = v_booking.flight_id;
    
    IF (v_flight.departs_at - NOW()) < INTERVAL '2 hours' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel within 2 hours of departure');
    END IF;
    
    UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = p_booking_id;
    UPDATE seats SET is_available = TRUE WHERE id = v_booking.seat_id;
    
    RETURN jsonb_build_object('success', true, 'booking_id', p_booking_id);
END;
$$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed flights
INSERT INTO flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price) VALUES
('AI202', 'DEL', 'BOM', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'Airbus A320', 4500),
('AI203', 'BOM', 'DEL', NOW() + INTERVAL '1 day 3 hours', NOW() + INTERVAL '1 day 5 hours', 'Airbus A320', 4500),
('SG456', 'DEL', 'BLR', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2.5 hours', 'Boeing 737', 5200),
('SG457', 'BLR', 'DEL', NOW() + INTERVAL '2 days 4 hours', NOW() + INTERVAL '2 days 6.5 hours', 'Boeing 737', 5200),
('6E789', 'BOM', 'BLR', NOW() + INTERVAL '1 day 6 hours', NOW() + INTERVAL '1 day 8 hours', 'Airbus A321', 3800),
('6E790', 'BLR', 'BOM', NOW() + INTERVAL '1 day 9 hours', NOW() + INTERVAL '1 day 11 hours', 'Airbus A321', 3800),
('UK101', 'DEL', 'HYD', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'Boeing 787', 6200),
('UK102', 'HYD', 'DEL', NOW() + INTERVAL '3 days 4 hours', NOW() + INTERVAL '3 days 6 hours', 'Boeing 787', 6200);

-- Function to generate seats for a flight
CREATE OR REPLACE FUNCTION generate_seats_for_flight(p_flight_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    row_num INTEGER;
    seat_letter CHAR;
    seat_class VARCHAR(20);
    extra_fee DECIMAL;
BEGIN
    FOR row_num IN 1..30 LOOP
        FOR seat_letter IN (SELECT unnest(ARRAY['A','B','C','D','E','F'])) LOOP
            IF row_num <= 2 THEN
                seat_class := 'first';
                extra_fee := 5000;
            ELSIF row_num <= 8 THEN
                seat_class := 'business';
                extra_fee := 2500;
            ELSE
                seat_class := 'economy';
                extra_fee := 0;
            END IF;
            
            INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
            VALUES (p_flight_id, row_num || seat_letter, seat_class, TRUE, extra_fee);
        END LOOP;
    END LOOP;
END;
$$;

-- Generate seats for all flights
DO $$
DECLARE
    flight_record RECORD;
BEGIN
    FOR flight_record IN SELECT id FROM flights LOOP
        PERFORM generate_seats_for_flight(flight_record.id);
    END LOOP;
END;
$$;
