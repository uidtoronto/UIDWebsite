export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_Us1RdfDNijqqWB',
    priceId: 'price_1TsHOtCIqsWOqM1z3shb8WMU',
    name: 'UID',
    description: 'Flexible monthly membership with full access to all UID benefits and community resources.',
    price: 20.00,
    currencySymbol: 'C$',
    mode: 'subscription',
    interval: 'month',
    features: [
      'Full UID membership access',
      'Community resources & network',
      'Event discounts & early access',
      'Cancel anytime',
    ],
  },
  {
    id: 'prod_Us1SVS5Lg1xu3R',
    priceId: 'price_1TsHPICIqsWOqM1zVMCiDCJZ',
    name: 'uid',
    description: 'Best value — commit annually and unlock the full uid experience with exclusive perks.',
    price: 240.00,
    currencySymbol: 'C$',
    mode: 'subscription',
    interval: 'year',
    popular: true,
    features: [
      'Everything in UID monthly',
      'Priority member support',
      'Exclusive annual member benefits',
      'Save vs. monthly billing',
    ],
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find((p) => p.priceId === priceId);
}