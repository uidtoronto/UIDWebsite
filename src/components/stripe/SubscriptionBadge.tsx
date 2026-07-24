import { CreditCard, Loader2 } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

interface SubscriptionBadgeProps {
  className?: string;
}

export function SubscriptionBadge({ className = '' }: SubscriptionBadgeProps) {
  const { subscription, product, isActive, loading } = useSubscription();

  if (loading) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-white/40 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading plan…</span>
      </div>
    );
  }

  if (!isActive || !subscription) {
    return (
      <a
        href="/pricing"
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50 transition hover:border-indigo-500/50 hover:text-indigo-400 ${className}`}
      >
        <CreditCard className="h-3 w-3" />
        No active plan
      </a>
    );
  }

  const statusColor =
    subscription.subscription_status === 'active'
      ? 'bg-emerald-500'
      : subscription.subscription_status === 'trialing'
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
      <span className="font-medium text-white">{product?.name ?? 'Subscription'}</span>
      <span className="text-white/40">·</span>
      <span className="capitalize text-white/50">{subscription.subscription_status}</span>
    </div>
  );
}