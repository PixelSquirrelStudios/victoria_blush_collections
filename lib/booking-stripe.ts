import type Stripe from 'stripe';

export async function resolveBookingPrice(stripe: Stripe, productId: string, configuredPriceId: string, amount: number) {
  if (!productId || !configuredPriceId) throw new Error('Configure the Shift Session Stripe product and price IDs.');
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 1000000) throw new Error('Invalid booking price.');

  const product = await stripe.products.retrieve(productId);
  if (product.deleted || !product.active) throw new Error('The Shift Session Stripe product is unavailable.');
  const configured = await stripe.prices.retrieve(configuredPriceId);
  const validPrice = (price: Stripe.Price) => price.product === productId && price.currency === 'gbp'
    && price.type === 'one_time' && price.billing_scheme === 'per_unit' && !price.transform_quantity
    && !price.custom_unit_amount && price.tax_behavior !== 'exclusive' && price.livemode === product.livemode;
  if (!validPrice(configured)) throw new Error('The configured Stripe price must belong to the Shift Session product and be a fixed, one-time GBP price without added tax.');
  if (configured.active && configured.unit_amount === amount) return configured.id;

  let previousPriceId = 'initial';
  for await (const price of stripe.prices.list({ product: productId, currency: 'gbp', type: 'one_time', limit: 100 })) {
    if (!validPrice(price) || price.unit_amount !== amount) continue;
    if (price.active) return price.id;
    if (previousPriceId === 'initial') previousPriceId = price.id;
  }

  const price = await stripe.prices.create({ product: productId, currency: 'gbp', unit_amount: amount, tax_behavior: 'inclusive' }, {
    idempotencyKey: `shift-session:${productId}:gbp:${amount}:after:${previousPriceId}`,
  });
  if (!price.active || !validPrice(price) || price.unit_amount !== amount) throw new Error('Stripe returned an unavailable booking price.');
  return price.id;
}