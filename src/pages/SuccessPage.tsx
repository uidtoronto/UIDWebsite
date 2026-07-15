import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export function SuccessPage() {
  const { subscription, product, isActive, loading, refetch } = useSubscription();

  useEffect(() => {
    // Poll a couple times to ensure webhook has been processed
    const t1 = setTimeout(() => refetch(), 2000);
    const t2 = setTimeout(() => refetch(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Success icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white">Payment Successful</h1>
          <p className="mt-2 text-sm text-white/50">
            Thank you for your membership. Your subscription is now active.
          </p>

          {/* Plan details */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading subscription details…
              </div>
            ) : isActive && product ? (
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Plan</span>
                  <span className="text-sm font-semibold text-white">{product.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Billing</span>
                  <span className="text-sm text-white/70 capitalize">{product.interval}ly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Amount</span>
                  <span className="text-sm text-white/70">
                    {product.currencySymbol}{product.price.toFixed(2)} / {product.interval}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Status</span>
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {subscription?.subscription_status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">
                Your subscription details will appear here shortly.
              </p>
            )}
          </div>

          <a
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 active:bg-indigo-600"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          A confirmation email will be sent to your registered address.
        </p>
      </div>
    </div>
  );
}