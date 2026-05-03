import { useState } from 'react';

const DEMO_USER = {
  id: 'demo',
  email: 'demo@bicicocina.app',
  user_metadata: { display_name: 'Demo Rider' },
};

export function useAuth() {
  const [user] = useState(DEMO_USER);
  const [loading] = useState(false);

  return { user, loading, signOut: () => {} };
}
