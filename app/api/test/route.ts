import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseAnonKey);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/flights?select=flight_no,origin,destination&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json({ 
      success: response.ok, 
      status: response.status,
      data: data 
    });
  } catch (err: any) {
    console.error('Error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
