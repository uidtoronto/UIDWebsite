import React from 'react';
import { Crown } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface Props {
  userId: string | undefined;
  className?: string;
}

export default function SubscriptionBadge({ userId, className = '' }: Props) {
  const { subscription, loading } = useSubscription(userId);

  if (loading || !subscription?.product) return null;

  const isAnnual = subscription.product.interval === 'year';

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        isAnnual
          ? 'bg-amber-100 text-amber-700 border border-amber-200'
          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      } ${className}`}
    >
      <Crown className="w-3 h-3" />
      {isAnnual ? 'Annual Member' : 'Monthly Member'}
    </span>
  );
}