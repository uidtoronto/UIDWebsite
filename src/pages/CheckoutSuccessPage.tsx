import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';

export default function CheckoutSuccessPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [polling, setPolling] = useState(true);
  const { subscription, loading } = useSubscription(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  // Poll until subscription is confirmed (webhook may take a moment)
  useEffect(() => {
    if (!polling) return;
    if (subscription?.status === 'active') {
      setPolling(false);
      return;
    }
    const timer = setTimeout(() => {
      setPolling(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [subscription, polling]);

  const isConfirmed = subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
        {loading || polling ? (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-14 h-14 text-emerald-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Confirming your membership…</h1>
            <p className="text-gray-500 text-sm">
              Please wait while we confirm your payment with Stripe.
            </p>
          </>
        ) : isConfirmed ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to UID Toronto!</h1>
            <p className="text-gray-500 text-sm mb-2">
              Your membership is now active.
            </p>
            {subscription?.product && (
              <div className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
                {subscription.product.name}
              </div>
            )}
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/membership"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                View Membership Plans
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Received!</h1>
            <p className="text-gray-500 text-sm mb-8">
              Your payment was successful. Your membership will be activated shortly — this usually takes less than a minute.
            </p>
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}