export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
  interval?: 'month' | 'year';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_Ut6XpPqYZD0iFn',
    priceId: 'price_1TtKKIKTV886CoUJfeMOF027',
    name: 'UID Toronto Annual Membership',
    description: 'Become an annual member of the Union of International Democrats Toronto with uninterrupted access to all member benefits.',
    price: 240.00,
    currency: 'cad',
    currencySymbol: 'C$',
    mode: 'subscription',
    interval: 'year',
  },
  {
    id: 'prod_Ut6W4153T8CLbe',
    priceId: 'price_1TtKJ2KTV886CoUJFX8xT41o',
    name: 'UID Toronto Monthly Membership',
    description: 'Flexible monthly membership with full access to all UID Toronto member benefits.',
    price: 20.00,
    currency: 'cad',
    currencySymbol: 'C$',
    mode: 'subscription',
    interval: 'month',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find((p) => p.priceId === priceId);
}