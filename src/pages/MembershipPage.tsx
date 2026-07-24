import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Star, Zap } from 'lucide-react';
import { STRIPE_PRODUCTS, StripeProduct } from '../stripe-config';
import { createCheckoutSession } from '../lib/stripe';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

export default function MembershipPage() {
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const { subscription } = useSubscription();

  const annualProduct = STRIPE_PRODUCTS.find(p => p.mode === 'subscription' && p.price === 240);
  const monthlyProduct = STRIPE_PRODUCTS.find(p => p.mode === 'subscription' && p.price === 20);

  async function handleCheckout(product: StripeProduct) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    setLoadingPriceId(product.priceId);
    try {
      const { url } = await createCheckoutSession(product.priceId, product.mode);
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPriceId(null);
    }
  }

  const isCurrentPlan = (product: StripeProduct) =>
    subscription.isActive && subscription.priceId === product.priceId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-red-600/20 text-red-400 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 border border-red-600/30">
            Membership Plans
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Join UID Toronto
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Choose the membership plan that works best for you and gain full access to all member benefits.
          </p>
          {subscription.isActive && subscription.planName && (
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-full text-sm font-medium">
              <Check className="w-4 h-4" />
              Active plan: {subscription.planName}
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly */}
          {monthlyProduct && (
            <PlanCard
              product={monthlyProduct}
              icon={<Zap className="w-5 h-5" />}
              badge={null}
              isCurrentPlan={isCurrentPlan(monthlyProduct)}
              isLoading={loadingPriceId === monthlyProduct.priceId}
              onCheckout={() => handleCheckout(monthlyProduct)}
              perLabel="/ month"
            />
          )}

          {/* Annual */}
          {annualProduct && (
            <PlanCard
              product={annualProduct}
              icon={<Star className="w-5 h-5" />}
              badge="Best Value"
              isCurrentPlan={isCurrentPlan(annualProduct)}
              isLoading={loadingPriceId === annualProduct.priceId}
              onCheckout={() => handleCheckout(annualProduct)}
              perLabel="/ year"
              highlight
            />
          )}
        </div>

        {/* Benefits */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-white mb-8">All memberships include</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              'Access to all UID Toronto events',
              'Voting rights at general assemblies',
              'Member-exclusive newsletters',
              'Networking opportunities',
              'Community programs access',
              'Digital membership card',
            ].map(benefit => (
              <div key={benefit} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 text-left">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlanCardProps {
  product: StripeProduct;
  icon: React.ReactNode;
  badge: string | null;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onCheckout: () => void;
  perLabel: string;
  highlight?: boolean;
}

function PlanCard({ product, icon, badge, isCurrentPlan, isLoading, onCheckout, perLabel, highlight }: PlanCardProps) {
  return (
    <div className={`relative rounded-2xl p-8 flex flex-col border transition-all duration-300 ${
      highlight
        ? 'bg-gradient-to-b from-red-600/20 to-slate-800/80 border-red-500/40 shadow-xl shadow-red-900/20'
        : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}>
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-red-600 text-white text-xs font-bold tracking-wide uppercase px-4 py-1 rounded-full shadow-lg">
            {badge}
          </span>
        </div>
      )}

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
        highlight ? 'bg-red-600/30 text-red-400' : 'bg-white/10 text-slate-300'
      }`}>
        {icon}
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">{product.description}</p>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-white">{product.currencySymbol}{product.price.toFixed(2)}</span>
        <span className="text-slate-400 text-sm ml-1">{perLabel}</span>
      </div>

      {isCurrentPlan ? (
        <div className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-semibold text-sm">
          <Check className="w-4 h-4" />
          Current Plan
        </div>
      ) : (
        <button
          onClick={onCheckout}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            highlight
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            'Get Started'
          )}
        </button>
      )}
    </div>
  );
}