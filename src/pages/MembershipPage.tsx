import React from 'react';
import { CheckCircle, Zap, Star, ArrowRight, Loader2 } from 'lucide-react';
import { STRIPE_PRODUCTS, StripeProduct } from '../stripe-config';
import { useCheckout } from '../hooks/useCheckout';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

const ANNUAL = STRIPE_PRODUCTS.find((p) => p.interval === 'year')!;
const MONTHLY = STRIPE_PRODUCTS.find((p) => p.interval === 'month')!;

const BENEFITS = [
  'Access to all UID Toronto events and programs',
  'Voting rights in general assemblies',
  'Networking with international democrats',
  'Monthly newsletter and policy updates',
  'Discounted rates on partner events',
  'Certificate of membership',
];

function PlanCard({
  product,
  featured,
  checkingOut,
  onSelect,
  currentPriceId,
}: {
  product: StripeProduct;
  featured?: boolean;
  checkingOut: boolean;
  onSelect: (p: StripeProduct) => void;
  currentPriceId: string | null;
}) {
  const isActive = currentPriceId === product.priceId;

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 flex flex-col transition-all duration-200 ${
        featured
          ? 'border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-100'
          : 'border-gray-200 bg-white shadow-lg'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow">
            Best Value
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className={`inline-flex items-center gap-2 mb-3 ${featured ? 'text-emerald-600' : 'text-gray-500'}`}>
          {featured ? <Star className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          <span className="text-sm font-medium uppercase tracking-wide">
            {product.interval === 'year' ? 'Annual' : 'Monthly'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">
            {product.currencySymbol}{product.price.toFixed(2)}
          </span>
          <span className="text-gray-400 text-sm">
            /{product.interval === 'year' ? 'year' : 'month'}
          </span>
        </div>
        {product.interval === 'year' && (
          <p className="text-emerald-600 text-sm font-medium mt-1">
            Save {product.currencySymbol}{(MONTHLY.price * 12 - product.price).toFixed(2)} vs monthly
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${featured ? 'text-emerald-500' : 'text-gray-400'}`} />
            {b}
          </li>
        ))}
      </ul>

      {isActive ? (
        <div className="w-full py-3 rounded-xl bg-emerald-100 text-emerald-700 font-semibold text-center text-sm">
          ✓ Current Plan
        </div>
      ) : (
        <button
          onClick={() => onSelect(product)}
          disabled={checkingOut}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
            featured
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
        >
          {checkingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              Get Started
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function MembershipPage() {
  const { startCheckout, loading: checkingOut, error: checkoutError } = useCheckout();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { subscription } = useSubscription(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  function handleSelect(product: StripeProduct) {
    startCheckout(product.priceId, product.mode);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Membership
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join UID Toronto
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Choose the plan that works for you and become part of the Union of International Democrats Toronto community.
          </p>
        </div>

        {checkoutError && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm text-center">
            {checkoutError}
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <PlanCard
            product={MONTHLY}
            checkingOut={checkingOut}
            onSelect={handleSelect}
            currentPriceId={subscription?.priceId ?? null}
          />
          <PlanCard
            product={ANNUAL}
            featured
            checkingOut={checkingOut}
            onSelect={handleSelect}
            currentPriceId={subscription?.priceId ?? null}
          />
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-10">
          Payments are processed securely by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}