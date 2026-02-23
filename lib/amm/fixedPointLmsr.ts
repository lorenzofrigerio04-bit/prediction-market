/**
 * Fixed-point LMSR (BigInt only). No floats in AMM path.
 * Scale: 1 unit = SCALE micros (1_000_000).
 * All amounts and prices use this scale; truncation is toward zero.
 */

const SCALE = 1_000_000n;

/**
 * exp(xScaled/SCALE) * SCALE as BigInt (truncate toward zero).
 * xScaled is BigInt; uses Taylor series. Supports negative x (exp(x) = 1/exp(-x)).
 */
function expScaled(xScaled: bigint): bigint {
  if (xScaled === 0n) return SCALE;
  if (xScaled < 0n) return (SCALE * SCALE) / expScaled(-xScaled);
  // Taylor: exp(y) = 1 + y + y^2/2! + ...; we want exp(y)*SCALE with y = xScaled/SCALE
  let term = SCALE;
  let sum = term;
  let k = 1n;
  const maxIter = 80;
  for (let i = 0; i < maxIter; i++) {
    term = (term * xScaled) / (k * SCALE);
    if (term === 0n) break;
    sum += term;
    k += 1n;
  }
  return sum;
}

/**
 * ln(zScaled/SCALE) * SCALE as BigInt (truncate toward zero).
 * zScaled >= SCALE. Uses Newton iteration for ln.
 */
function lnScaled(zScaled: bigint): bigint {
  if (zScaled <= 0n) throw new Error("lnScaled: non-positive argument");
  if (zScaled === SCALE) return 0n;
  // Newton: x_{n+1} = x_n + (z - exp(x_n)) / exp(x_n) = x_n + z/exp(x_n) - 1
  // We want x such that exp(x/SCALE) = zScaled/SCALE, so x = ln(zScaled/SCALE)*SCALE.
  let x = 0n;
  if (zScaled > SCALE) {
    x = SCALE; // initial guess
  }
  for (let i = 0; i < 30; i++) {
    const ex = expScaled(x);
    if (ex === 0n) break;
    const delta = (zScaled * SCALE) / ex - SCALE;
    x = x + delta;
    if (delta >= -1n && delta <= 1n) break;
  }
  return x;
}

/**
 * Cost in micros: C(q_yes, q_no) = b * ln(exp(q_yes/b) + exp(q_no/b))
 * All args and return in micros (BigInt). Truncate toward zero.
 */
function costMicros(
  qYesMicros: bigint,
  qNoMicros: bigint,
  bMicros: bigint
): bigint {
  if (bMicros <= 0n) throw new Error("bMicros must be positive");
  if (qYesMicros < 0n || qNoMicros < 0n) throw new Error("quantities cannot be negative");

  if (qYesMicros === 0n && qNoMicros === 0n) {
    // C(0,0) = b * ln(2)
    return (bMicros * lnScaled(2n * SCALE)) / SCALE;
  }

  // Log-sum-exp: C = b * (ln(exp(q_yes/b) + exp(q_no/b))) = b * (maxQ/b + ln(exp((q_yes-maxQ)/b) + exp((q_no-maxQ)/b)))
  const maxQ = qYesMicros > qNoMicros ? qYesMicros : qNoMicros;
  const argYes = (qYesMicros - maxQ) * SCALE / bMicros;
  const argNo = (qNoMicros - maxQ) * SCALE / bMicros;
  const expYes = expScaled(argYes);
  const expNo = expScaled(argNo);
  const sum = expYes + expNo;
  const lnSum = lnScaled(sum);
  return (bMicros * (lnSum + (maxQ * SCALE) / bMicros)) / SCALE;
}

/**
 * Price for YES outcome in micros (0 to SCALE). p_yes = exp(q_yes/b) / (exp(q_yes/b) + exp(q_no/b))
 */
export function priceYesMicros(
  qYesMicros: bigint,
  qNoMicros: bigint,
  bMicros: bigint
): bigint {
  if (bMicros <= 0n) throw new Error("bMicros must be positive");
  if (qYesMicros < 0n || qNoMicros < 0n) throw new Error("quantities cannot be negative");

  if (qYesMicros === 0n && qNoMicros === 0n) return SCALE / 2n; // 0.5

  const maxQ = qYesMicros > qNoMicros ? qYesMicros : qNoMicros;
  const argYes = (qYesMicros - maxQ) * SCALE / bMicros;
  const argNo = (qNoMicros - maxQ) * SCALE / bMicros;
  const expYes = expScaled(argYes);
  const expNo = expScaled(argNo);
  const sum = expYes + expNo;
  if (sum === 0n) return SCALE / 2n;
  return (expYes * SCALE) / sum;
}

/**
 * Buy shares given max cost (in micros). Returns shareMicros and actualCostMicros (truncated).
 */
export function buyGivenMaxCost(
  qYesMicros: bigint,
  qNoMicros: bigint,
  bMicros: bigint,
  outcome: "YES" | "NO",
  maxCostMicros: bigint
): { shareMicros: bigint; actualCostMicros: bigint } {
  if (bMicros <= 0n) throw new Error("bMicros must be positive");
  if (qYesMicros < 0n || qNoMicros < 0n) throw new Error("quantities cannot be negative");
  if (maxCostMicros <= 0n) throw new Error("maxCostMicros must be positive");

  const initialCost = costMicros(qYesMicros, qNoMicros, bMicros);

  // Binary search for shareMicros (in micros). Upper bound: maxCostMicros * 50n + bMicros * 10n
  let low = 0n;
  let high = maxCostMicros * 50n + bMicros * 10n;
  if (high < SCALE) high = SCALE;

  const maxIter = 120;
  let shareMicros = 0n;

  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2n;
    if (mid === low) {
      shareMicros = low;
      break;
    }

    let newCost: bigint;
    if (outcome === "YES") {
      newCost = costMicros(qYesMicros + mid, qNoMicros, bMicros);
    } else {
      newCost = costMicros(qYesMicros, qNoMicros + mid, bMicros);
    }
    const costDiff = newCost - initialCost;

    if (costDiff <= maxCostMicros) {
      low = mid;
      shareMicros = mid;
    } else {
      high = mid;
    }
  }

  let actualCostMicros: bigint;
  if (outcome === "YES") {
    actualCostMicros = costMicros(qYesMicros + shareMicros, qNoMicros, bMicros) - initialCost;
  } else {
    actualCostMicros = costMicros(qYesMicros, qNoMicros + shareMicros, bMicros) - initialCost;
  }
  if (actualCostMicros < 0n) actualCostMicros = 0n;
  if (actualCostMicros > maxCostMicros) actualCostMicros = maxCostMicros;

  return { shareMicros, actualCostMicros };
}

/**
 * Sell given shares; returns proceeds in micros (truncate toward zero).
 */
export function sellGivenShares(
  qYesMicros: bigint,
  qNoMicros: bigint,
  bMicros: bigint,
  outcome: "YES" | "NO",
  shareMicros: bigint
): bigint {
  if (bMicros <= 0n) throw new Error("bMicros must be positive");
  if (qYesMicros < 0n || qNoMicros < 0n) throw new Error("quantities cannot be negative");
  if (shareMicros <= 0n) throw new Error("shareMicros must be positive");

  if (outcome === "YES" && shareMicros > qYesMicros) throw new Error("cannot sell more YES shares than available");
  if (outcome === "NO" && shareMicros > qNoMicros) throw new Error("cannot sell more NO shares than available");

  const initialCost = costMicros(qYesMicros, qNoMicros, bMicros);
  let finalCost: bigint;
  if (outcome === "YES") {
    finalCost = costMicros(qYesMicros - shareMicros, qNoMicros, bMicros);
  } else {
    finalCost = costMicros(qYesMicros, qNoMicros - shareMicros, bMicros);
  }
  const proceeds = initialCost - finalCost;
  return proceeds < 0n ? 0n : proceeds;
}

export { SCALE };
