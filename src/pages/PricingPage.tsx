import React from 'react';
import { CreditCard, ShieldCheck, RefreshCcw } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { PricingCard } from '../components/stripe/PricingCard';
import { useSubscription } from '../hooks/useSubscription';

export function PricingPage() {
  const { subscription, isActive, loading } = useSubscription();

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400">
            <CreditCard className="h-3.5 w-3.5" />
            Membership Plans
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/50">
            Join our community with a plan that fits your needs. All plans include full
            membership access and can be managed at any time.
          </p>

          {!loading && isActive && subscription && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              You have an active subscription
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {STRIPE_PRODUCTS.map((product) => {
            const isCurrent =
              isActive && subscription?.price_id === product.priceId;
            return (
              <PricingCard
                key={product.id}
                product={product}
                isCurrentPlan={isCurrent}
              />
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-white/20" />
            Secure checkout via Stripe
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-white/20" />
            Cancel or change anytime
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-white/20" />
            Billed in CAD
          </div>
        </div>
      </div>
    </div>
  );
}