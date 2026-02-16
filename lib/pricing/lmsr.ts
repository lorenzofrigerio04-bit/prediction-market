/**
 * LMSR (Logarithmic Market Scoring Rule) Pricing Engine
 * 
 * Core mathematical functions for LMSR-based prediction market pricing.
 * 
 * LMSR Cost Function: C(q_yes, q_no) = b * ln(exp(q_yes/b) + exp(q_no/b))
 * 
 * Price Calculation: p_yes = exp(q_yes/b) / (exp(q_yes/b) + exp(q_no/b))
 *                    p_no = exp(q_no/b) / (exp(q_yes/b) + exp(q_no/b))
 * 
 * Note: p_init is always 0.5 (shrink to 0.5), meaning initial state q_yes = q_no = 0
 */

/**
 * Calculate the LMSR cost function
 * C(q_yes, q_no) = b * ln(exp(q_yes/b) + exp(q_no/b))
 * 
 * @param qYes - Quantity of YES shares
 * @param qNo - Quantity of NO shares
 * @param b - Liquidity parameter
 * @returns The cost in credits
 */
export function cost(qYes: number, qNo: number, b: number): number {
  if (b <= 0) {
    throw new Error("Liquidity parameter b must be positive");
  }

  // Handle initial state: q_yes = q_no = 0
  if (qYes === 0 && qNo === 0) {
    return b * Math.log(2); // ln(exp(0) + exp(0)) = ln(2)
  }

  // Handle edge case: prevent overflow for very large values
  // Use log-sum-exp trick for numerical stability
  const maxQ = Math.max(qYes, qNo);
  const expYes = Math.exp((qYes - maxQ) / b);
  const expNo = Math.exp((qNo - maxQ) / b);
  const sum = expYes + expNo;
  
  return b * (Math.log(sum) + maxQ / b);
}

/**
 * Get the current price for a given outcome
 * 
 * Price for YES: p_yes = exp(q_yes/b) / (exp(q_yes/b) + exp(q_no/b))
 * Price for NO: p_no = exp(q_no/b) / (exp(q_yes/b) + exp(q_no/b))
 * 
 * @param qYes - Quantity of YES shares
 * @param qNo - Quantity of NO shares
 * @param b - Liquidity parameter
 * @param outcome - "YES" or "NO"
 * @returns Price in [0, 1]
 */
export function getPrice(
  qYes: number,
  qNo: number,
  b: number,
  outcome: "YES" | "NO"
): number {
  if (b <= 0) {
    throw new Error("Liquidity parameter b must be positive");
  }

  if (qYes < 0 || qNo < 0) {
    throw new Error("Quantities cannot be negative");
  }

  // Handle initial state: q_yes = q_no = 0
  // p_init is always 0.5 (shrink to 0.5)
  if (qYes === 0 && qNo === 0) {
    return 0.5;
  }

  // Use log-sum-exp trick for numerical stability
  const maxQ = Math.max(qYes, qNo);
  const expYes = Math.exp((qYes - maxQ) / b);
  const expNo = Math.exp((qNo - maxQ) / b);
  const sum = expYes + expNo;

  if (outcome === "YES") {
    return expYes / sum;
  } else {
    return expNo / sum;
  }
}

/**
 * Calculate shares bought and cost paid when buying shares
 * 
 * When buying shares:
 * - Cost paid = C(q_yes_new, q_no_new) - C(q_yes_old, q_no_old)
 * - Shares bought = q_new - q_old
 * 
 * @param qYes - Current quantity of YES shares
 * @param qNo - Current quantity of NO shares
 * @param b - Liquidity parameter
 * @param outcome - "YES" or "NO" shares to buy
 * @param costToPay - Maximum cost the user is willing to pay (in credits)
 * @returns Object with sharesBought and actualCostPaid
 */
export function buyShares(
  qYes: number,
  qNo: number,
  b: number,
  outcome: "YES" | "NO",
  costToPay: number
): { sharesBought: number; actualCostPaid: number } {
  if (b <= 0) {
    throw new Error("Liquidity parameter b must be positive");
  }

  if (qYes < 0 || qNo < 0) {
    throw new Error("Quantities cannot be negative");
  }

  if (costToPay <= 0) {
    throw new Error("Cost to pay must be positive");
  }

  const initialCost = cost(qYes, qNo, b);
  
  // Binary search to find the number of shares that can be bought
  // We need to find q_new such that C(q_new) - C(q_old) <= costToPay
  // Use a more robust upper bound: cost increases roughly linearly with shares
  // For LMSR, a conservative upper bound is costToPay * 50 + b * 10
  let low = 0;
  let high = Math.max(costToPay * 50 + b * 10, 1000);
  const tolerance = 1e-8;
  const maxIterations = 200;
  let sharesBought = 0;

  // First, verify that we can buy at least some shares
  // Check if the upper bound is sufficient
  let testCost: number;
  if (outcome === "YES") {
    testCost = cost(qYes + high, qNo, b);
  } else {
    testCost = cost(qYes, qNo + high, b);
  }
  
  if (testCost - initialCost < costToPay) {
    // Upper bound too low, expand it
    while (testCost - initialCost < costToPay && high < 1e6) {
      high *= 2;
      if (outcome === "YES") {
        testCost = cost(qYes + high, qNo, b);
      } else {
        testCost = cost(qYes, qNo + high, b);
      }
    }
  }

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    
    let newCost: number;
    if (outcome === "YES") {
      newCost = cost(qYes + mid, qNo, b);
    } else {
      newCost = cost(qYes, qNo + mid, b);
    }
    
    const costDifference = newCost - initialCost;
    
    if (Math.abs(costDifference - costToPay) < tolerance || Math.abs(high - low) < tolerance) {
      sharesBought = mid;
      break;
    }
    
    if (costDifference < costToPay) {
      low = mid;
      sharesBought = mid;
    } else {
      high = mid;
    }
  }

  // Calculate actual cost paid
  let finalCost: number;
  if (outcome === "YES") {
    finalCost = cost(qYes + sharesBought, qNo, b);
  } else {
    finalCost = cost(qYes, qNo + sharesBought, b);
  }
  
  const actualCostPaid = finalCost - initialCost;

  return {
    sharesBought,
    actualCostPaid: Math.max(0, actualCostPaid), // Ensure non-negative
  };
}

/**
 * Calculate credits received when selling shares
 * 
 * When selling shares:
 * - Credits received = C(q_yes_old, q_no_old) - C(q_yes_new, q_no_new)
 * - Shares sold = q_old - q_new
 * 
 * @param qYes - Current quantity of YES shares
 * @param qNo - Current quantity of NO shares
 * @param b - Liquidity parameter
 * @param outcome - "YES" or "NO" shares to sell
 * @param sharesToSell - Number of shares to sell
 * @returns Credits received from selling shares
 */
export function sellShares(
  qYes: number,
  qNo: number,
  b: number,
  outcome: "YES" | "NO",
  sharesToSell: number
): number {
  if (b <= 0) {
    throw new Error("Liquidity parameter b must be positive");
  }

  if (qYes < 0 || qNo < 0) {
    throw new Error("Quantities cannot be negative");
  }

  if (sharesToSell <= 0) {
    throw new Error("Shares to sell must be positive");
  }

  // Check if user has enough shares to sell
  if (outcome === "YES" && sharesToSell > qYes) {
    throw new Error("Cannot sell more YES shares than available");
  }
  if (outcome === "NO" && sharesToSell > qNo) {
    throw new Error("Cannot sell more NO shares than available");
  }

  const initialCost = cost(qYes, qNo, b);
  
  let finalCost: number;
  if (outcome === "YES") {
    finalCost = cost(qYes - sharesToSell, qNo, b);
  } else {
    finalCost = cost(qYes, qNo - sharesToSell, b);
  }
  
  const creditsReceived = initialCost - finalCost;

  return Math.max(0, creditsReceived); // Ensure non-negative
}
