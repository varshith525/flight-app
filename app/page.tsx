import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import HomePage from '@/components/HomePage';

export default async function Home() {

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* NOT LOGGED IN */

  if (!user) {
    redirect('/signup');
  }

  /* LOGGED IN */

  return <HomePage />;
}