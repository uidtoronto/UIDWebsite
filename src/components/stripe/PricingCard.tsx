import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import type { StripeProduct } from '../../stripe-config';
import { useAuth } from '../../context/AuthContext';
import { useCheckout } from '../../hooks/useCheckout';
import { EmbeddedCheckout } from './EmbeddedCheckout';

interface PricingCardProps {
  product: StripeProduct;
  isCurrentPlan?: boolean;
}

export function PricingCard({ product, isCurrentPlan }: PricingCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { startCheckout, loading } = useCheckout();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);

    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
      return;
    }

    const result = await startCheckout({
      priceId: product.priceId,
      mode: product.mode,
      returnUrl: `${window.location.origin}/payment-success`,
    });

    if (!result) {
      setError('Checkout could not be started. Please try again.');
      return;
    }

    setClientSecret(result.clientSecret);
  };

  const handleClose = () => {
    setClientSecret(null);
  };

  const handleComplete = () => {
    setClientSecret(null);
    navigate('/payment-success');
  };

  return (
    <>
      <div
        className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 ${
          product.popular
            ? 'border-indigo-500 bg-indigo-950/60 shadow-xl shadow-indigo-500/10'
            : 'border-white/10 bg-white/5 hover:border-white/20'
        }`}
      >
        {product.popular && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
              <Star className="h-3 w-3 fill-white" />
              Best Value
            </span>
          </div>
        )}

        {isCurrentPlan && (
          <div className="absolute -top-3.5 right-6">
            <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
              Current Plan
            </span>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white">{product.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{product.description}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-white/50">{product.currencySymbol}</span>
            <span className="text-5xl font-bold tracking-tight text-white">
              {product.price.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/40">
            per {product.interval}
            {product.interval === 'year' && (
              <span className="ml-2 text-emerald-400">
                ({product.currencySymbol}{(product.price / 12).toFixed(2)}/mo)
              </span>
            )}
          </p>
        </div>

        <ul className="mb-8 space-y-3 flex-1">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                product.popular ? 'bg-indigo-500/20' : 'bg-white/10'
              }`}>
                <Check className={`h-3 w-3 ${product.popular ? 'text-indigo-400' : 'text-white/60'}`} />
              </div>
              <span className="text-sm text-white/70">{feature}</span>
            </li>
          ))}
        </ul>

        {error && (
          <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || isCurrentPlan}
          className={`relative w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
            product.popular
              ? 'bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-600'
              : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/5'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Preparing checkout…
            </span>
          ) : isCurrentPlan ? (
            'Active Plan'
          ) : (
            `Subscribe to ${product.name}`
          )}
        </button>
      </div>

      {clientSecret && (
        <EmbeddedCheckout
          clientSecret={clientSecret}
          onClose={handleClose}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
