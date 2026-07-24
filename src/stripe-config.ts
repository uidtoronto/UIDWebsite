export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  /** Price ID from Stripe — used to create Embedded Checkout Sessions. */
  priceId: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'monthly',
    name: 'Monthly Membership',
    description: 'Flexible monthly membership with full access to all UID benefits and community resources.',
    price: 20.00,
    currencySymbol: 'C$',
    mode: 'subscription',
    interval: 'month',
    priceId: 'price_1TsHOtCIqsWOqM1z3shb8WMU',
    features: [
      'Full UID membership access',
      'Community resources & network',
      'Event discounts & early access',
      'Cancel anytime',
    ],
  },
  {
    id: 'annual',
    name: 'Annual Membership',
    description: 'Best value — commit annually and unlock the full UID experience with exclusive perks.',
    price: 240.00,
    currencySymbol: 'C$',
    mode: 'subscription',
    interval: 'year',
    popular: true,
    priceId: 'price_1TsHPICIqsWOqM1zVMCiDCJZ',
    features: [
      'Everything in Monthly',
      'Priority member support',
      'Exclusive annual member benefits',
      'Save vs. monthly billing',
    ],
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find((p) => p.priceId === priceId);
}
