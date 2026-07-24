import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import MembershipPage from './pages/MembershipPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';

// Lazy-load the rest of the app shell if it exists, otherwise render a minimal shell
function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="*" element={<Navigate to="/membership" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;