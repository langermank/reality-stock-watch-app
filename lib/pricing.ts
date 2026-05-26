/** Pure pricing math for the bonding curve. No React or Supabase imports. */

export type PricingParams = {
  /** season.k_constant */
  kConstant: number;
  /** season.base_price */
  basePrice: number;
  /** Denominator floor — prevents div/zero at market start. */
  minSupplyFloor: number;
};

/**
 * Spot price for one contestant.
 * @param sharesOutstanding - contestant.total_shares_outstanding
 * @param totalAllShares - sum of total_shares_outstanding across all contestants
 */
export function derivePrice(
  sharesOutstanding: number,
  totalAllShares: number,
  params: PricingParams
): number {
  const { kConstant, basePrice, minSupplyFloor } = params;
  const effectiveTotal = Math.max(totalAllShares, minSupplyFloor);
  return basePrice + (kConstant / Math.sqrt(effectiveTotal)) * sharesOutstanding;
}

/**
 * Cost (in dollars) to buy `n` fractional shares.
 * Uses the closed-form integral of the bonding curve.
 * @param n - shares to buy
 * @param contestantShares - contestant.total_shares_outstanding (S)
 * @param totalAllShares - sum across all contestants (T)
 */
export function buyCost(
  n: number,
  contestantShares: number,
  totalAllShares: number,
  params: PricingParams
): number {
  const { kConstant, basePrice, minSupplyFloor } = params;
  const S = contestantShares;
  const T = Math.max(totalAllShares, minSupplyFloor);
  const sqrtT = Math.sqrt(T);
  const sqrtTn = Math.sqrt(T + n);
  return (
    n * basePrice +
    kConstant *
      (2 * (S - T) * (sqrtTn - sqrtT) +
        (2 / 3) * (Math.pow(T + n, 1.5) - Math.pow(T, 1.5)))
  );
}

/**
 * Solve for shares given a dollar amount (binary search).
 * Fee is deducted first; remaining amount buys shares.
 * @param dollars - gross dollar amount entered by user
 * @param feeRate - default 0.02
 * @returns shares, effectiveDollars (after fee), fee amount
 */
export function sharesForDollars(
  dollars: number,
  contestantShares: number,
  totalAllShares: number,
  params: PricingParams,
  feeRate = 0.02
): { shares: number; effectiveDollars: number; fee: number } {
  const fee = dollars * feeRate;
  const effectiveDollars = dollars - fee;

  const TOLERANCE = 0.00001;
  const MAX_ITER = 50;

  let lo = 0;
  let hi = effectiveDollars / params.basePrice; // rough upper bound

  // Expand upper bound until cost(hi) >= effectiveDollars
  while (buyCost(hi, contestantShares, totalAllShares, params) < effectiveDollars) {
    hi *= 2;
  }

  let shares = 0;
  for (let i = 0; i < MAX_ITER; i++) {
    const mid = (lo + hi) / 2;
    const cost = buyCost(mid, contestantShares, totalAllShares, params);
    if (Math.abs(cost - effectiveDollars) < TOLERANCE) {
      shares = mid;
      break;
    }
    if (cost < effectiveDollars) {
      lo = mid;
    } else {
      hi = mid;
    }
    shares = mid;
  }

  return { shares, effectiveDollars, fee };
}

/**
 * Proceeds from selling `n` shares (integral in reverse; fee deducted from proceeds).
 * @param n - shares to sell
 * @param feeRate - default 0.02
 */
export function sellProceeds(
  n: number,
  contestantShares: number,
  totalAllShares: number,
  params: PricingParams,
  feeRate = 0.02
): { proceeds: number; fee: number } {
  const { kConstant, basePrice, minSupplyFloor } = params;
  const S = contestantShares;
  const T = Math.max(totalAllShares, minSupplyFloor);
  const sqrtT = Math.sqrt(T);
  const sqrtTn = Math.sqrt(T - n);

  // Mirror of buyCost: supply decreases from T to T-n
  const grossProceeds =
    n * basePrice +
    kConstant *
      (2 * (S - T) * (sqrtT - sqrtTn) +
        (2 / 3) * (Math.pow(T, 1.5) - Math.pow(T - n, 1.5)));

  const fee = grossProceeds * feeRate;
  return { proceeds: grossProceeds - fee, fee };
}
