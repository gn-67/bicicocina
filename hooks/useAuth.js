import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Hackathon demo: fake user so everything works without auth
const DEMO_USER = {
  id: 'demo-user-0000-0000-000000000000',
  email: 'demo@bicicocina.app',
  user_metadata: { display_name: 'Demo Rider' },
};

export function useAuth() {
  const [user] = useState(DEMO_USER);
  const [loading] = useState(false);

  function signUp() {}
  function signIn() {}
  function signOut() {}

  return { user, loading, signUp, signIn, signOut };
}
