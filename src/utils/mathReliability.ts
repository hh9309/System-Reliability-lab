/**
 * System Reliability Mathematics & Algorithms
 */

// Lanczos approximation for the Gamma function
export function gamma(z: number): number {
  const g = 7;
  const C = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Weibull functions
export function weibullReliability(t: number, beta: number, eta: number): number {
  if (t <= 0) return 1.0;
  return Math.exp(-Math.pow(t / eta, beta));
}

export function weibullUnreliability(t: number, beta: number, eta: number): number {
  return 1.0 - weibullReliability(t, beta, eta);
}

export function weibullPDF(t: number, beta: number, eta: number): number {
  if (t <= 0) return 0;
  const ratio = t / eta;
  return (beta / eta) * Math.pow(ratio, beta - 1) * Math.exp(-Math.pow(ratio, beta));
}

export function weibullHazard(t: number, beta: number, eta: number): number {
  if (t <= 0) return 0;
  const ratio = t / eta;
  return (beta / eta) * Math.pow(ratio, beta - 1);
}

export function weibullMTTF(beta: number, eta: number): number {
  return eta * gamma(1 + 1 / beta);
}

export function weibullB10(beta: number, eta: number): number {
  // F(t) = 0.1 => t = eta * (-ln(0.9))^(1/beta)
  return eta * Math.pow(-Math.log(0.9), 1 / beta);
}

export function weibullMedian(beta: number, eta: number): number {
  // F(t) = 0.5 => t = eta * (ln(2))^(1/beta)
  return eta * Math.pow(Math.log(2), 1 / beta);
}

// Exponential functions
export function expReliability(t: number, lambda: number): number {
  if (t <= 0) return 1.0;
  return Math.exp(-lambda * t);
}

export function expHazard(): number {
  return 1; // Constant relative
}

// Normal Distribution
export function normalPDF(t: number, mu: number, sigma: number): number {
  const diff = (t - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * diff * diff);
}

// Error function approximation for Normal CDF
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

export function normalCDF(t: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((t - mu) / (sigma * Math.sqrt(2))));
}

export function normalReliability(t: number, mu: number, sigma: number): number {
  return 1.0 - normalCDF(t, mu, sigma);
}

export function normalHazard(t: number, mu: number, sigma: number): number {
  const r = normalReliability(t, mu, sigma);
  if (r <= 1e-7) return 1.0;
  return normalPDF(t, mu, sigma) / r;
}

// Bathtub Curve composite hazard rate
export function bathtubHazard(t: number, tMax: number): {
  total: number;
  early: number;
  useful: number;
  wearout: number;
} {
  const normT = Math.max(0.01, t / tMax); // 0.01 to 1.0
  // Early failure: decreasing power law
  const early = 0.0006 * Math.pow(normT, -0.65);
  // Useful life: constant random failure
  const useful = 0.00015;
  // Wear-out: progressive aging
  const wearout = 0.0018 * Math.pow(Math.max(0, normT - 0.4), 2.8);
  const total = early + useful + wearout;
  return { total, early, useful, wearout };
}

// Preventive Maintenance Cost Optimization (Age Replacement Policy)
// C(Tp) = [Cp * R(Tp) + Cf * (1 - R(Tp))] / integral_0^Tp R(t) dt
export function calculateMaintenanceCostCurve(
  beta: number,
  eta: number,
  cp: number,
  cf: number,
  steps = 80
): {
  data: { tp: number; costRate: number; rTp: number; fTp: number }[];
  optimalTp: number;
  minCostRate: number;
  isWearout: boolean;
} {
  const isWearout = beta > 1.05;
  const maxTp = Math.round(eta * 1.5);
  const stepSize = maxTp / steps;
  const data: { tp: number; costRate: number; rTp: number; fTp: number }[] = [];

  let optimalTp = maxTp;
  let minCostRate = Infinity;

  // Numerical trapezoidal integration accumulator
  let integratedR = 0;
  let prevT = 0;
  let prevR = 1.0;

  for (let i = 1; i <= steps; i++) {
    const tp = i * stepSize;
    const rTp = weibullReliability(tp, beta, eta);
    const fTp = 1 - rTp;

    // Trapezoidal step
    integratedR += ((prevR + rTp) / 2) * (tp - prevT);
    prevT = tp;
    prevR = rTp;

    const expectedCost = cp * rTp + cf * fTp;
    const costRate = integratedR > 0 ? expectedCost / integratedR : 0;

    data.push({ tp, costRate, rTp, fTp });

    if (isWearout && costRate < minCostRate && tp > eta * 0.05) {
      minCostRate = costRate;
      optimalTp = tp;
    }
  }

  if (!isWearout) {
    // When beta <= 1, minimum cost is at infinity (run to failure)
    optimalTp = maxTp;
    minCostRate = data[data.length - 1]?.costRate || 0;
  }

  return { data, optimalTp, minCostRate, isWearout };
}

// Combinations (n choose k)
export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let c = 1;
  for (let i = 1; i <= r; i++) {
    c = (c * (n - (r - i))) / i;
  }
  return c;
}

// RBD Analytical System Calculation
export function solveRBDSystem(
  systemType: 'series' | 'parallel' | 'hybrid' | 'k_out_of_n',
  components: { mtbf: number; failureRate?: number; operationalStatus?: string }[],
  k = 2,
  n = 3,
  evalTime = 1000
): {
  systemReliability: number;
  systemMTBF: number;
  systemFailureRate: number;
  isFunctioning: boolean;
  blockReliabilities: number[];
} {
  const blockReliabilities = components.map((c) => {
    if (c.operationalStatus === 'failed') return 0;
    const lambda = c.failureRate || 1 / c.mtbf;
    return Math.exp(-lambda * evalTime);
  });

  let systemReliability = 1.0;
  let systemMTBF = 0;
  let systemFailureRate = 0;
  let isFunctioning = true;

  if (systemType === 'series') {
    // Series: R_sys = prod(R_i), lambda_sys = sum(lambda_i)
    let sumLambda = 0;
    let prodR = 1.0;
    for (let i = 0; i < components.length; i++) {
      if (components[i].operationalStatus === 'failed') {
        isFunctioning = false;
      }
      const lambda = components[i].failureRate || 1 / components[i].mtbf;
      sumLambda += lambda;
      prodR *= blockReliabilities[i];
    }
    systemReliability = isFunctioning ? prodR : 0;
    systemFailureRate = sumLambda;
    systemMTBF = sumLambda > 0 ? 1 / sumLambda : 0;
  } else if (systemType === 'parallel') {
    // Parallel: R_sys = 1 - prod(1 - R_i)
    let prodUnrel = 1.0;
    let anyWorking = false;
    for (let i = 0; i < components.length; i++) {
      if (components[i].operationalStatus !== 'failed') {
        anyWorking = true;
      }
      prodUnrel *= 1 - blockReliabilities[i];
    }
    isFunctioning = anyWorking;
    systemReliability = isFunctioning ? 1 - prodUnrel : 0;

    // Approximate MTBF for parallel units (using average MTBF * harmonic factor)
    const avgMtbf = components.reduce((acc, c) => acc + c.mtbf, 0) / (components.length || 1);
    let harmonic = 0;
    for (let i = 1; i <= components.length; i++) harmonic += 1 / i;
    systemMTBF = avgMtbf * harmonic;
    systemFailureRate = systemMTBF > 0 ? 1 / systemMTBF : 0;
  } else if (systemType === 'k_out_of_n') {
    // k out of n: R_sys = sum_{j=k}^n C(n,j) R^j (1-R)^(n-j)
    const avgR = blockReliabilities.reduce((a, b) => a + b, 0) / (blockReliabilities.length || 1);
    let sumProb = 0;
    const num = n || components.length;
    const req = k || 2;
    for (let j = req; j <= num; j++) {
      sumProb += nCr(num, j) * Math.pow(avgR, j) * Math.pow(1 - avgR, num - j);
    }
    const workingCount = components.filter((c) => c.operationalStatus !== 'failed').length;
    isFunctioning = workingCount >= req;
    systemReliability = isFunctioning ? Math.min(1, Math.max(0, sumProb)) : 0;

    const baseMtbf = components[0]?.mtbf || 5000;
    // MTBF for k-out-of-n: (baseMtbf) * sum_{j=k}^n (1/j)
    let sumFrac = 0;
    for (let j = req; j <= num; j++) sumFrac += 1 / j;
    systemMTBF = baseMtbf * sumFrac;
    systemFailureRate = systemMTBF > 0 ? 1 / systemMTBF : 0;
  } else {
    // Hybrid (Series-Parallel standard: Two parallel branches in series)
    // Branch 1: Comp 0, 1 in parallel; Branch 2: Comp 2, 3 in parallel
    const r1 = 1 - (1 - (blockReliabilities[0] || 0.9)) * (1 - (blockReliabilities[1] || 0.9));
    const r2 = 1 - (1 - (blockReliabilities[2] || 0.9)) * (1 - (blockReliabilities[3] || 0.9));
    systemReliability = r1 * r2;
    const c0Working = components[0]?.operationalStatus !== 'failed' || components[1]?.operationalStatus !== 'failed';
    const c1Working = components[2]?.operationalStatus !== 'failed' || components[3]?.operationalStatus !== 'failed';
    isFunctioning = c0Working && c1Working;
    if (!isFunctioning) systemReliability = 0;
    systemMTBF = (components[0]?.mtbf || 5000) * 1.45;
    systemFailureRate = 1 / systemMTBF;
  }

  return {
    systemReliability,
    systemMTBF: Math.round(systemMTBF),
    systemFailureRate,
    isFunctioning,
    blockReliabilities,
  };
}

// Inherent Availability Ai = MTBF / (MTBF + MTTR)
export function calculateAvailability(mtbf: number, mttr: number): {
  availability: number;
  unavailability: number;
  downtimeHoursPerYear: number;
} {
  const total = mtbf + mttr;
  if (total <= 0) return { availability: 0, unavailability: 1, downtimeHoursPerYear: 8760 };
  const availability = mtbf / total;
  const unavailability = 1 - availability;
  const downtimeHoursPerYear = unavailability * 8760;
  return { availability, unavailability, downtimeHoursPerYear };
}

// FTA Solver
export function solveFTATree(
  gates: { id: string; type: 'AND' | 'OR' | 'VOTING_2_3'; inputs: string[] }[],
  basicEvents: { id: string; prob?: number; probability?: number; isFailed: boolean }[]
): {
  topEventFailed: boolean;
  topProbability: number;
  minimalCutSets: string[][];
} {
  const eventMap = new Map(basicEvents.map((e) => [e.id, e]));

  // Live fault injection evaluation
  function evaluateGateState(gateId: string): boolean {
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return false;

    const childStates = gate.inputs.map((inp) => {
      if (inp.startsWith('G_')) {
        return evaluateGateState(inp);
      }
      return eventMap.get(inp)?.isFailed || false;
    });

    if (gate.type === 'AND') {
      return childStates.every((s) => s === true);
    } else if (gate.type === 'OR') {
      return childStates.some((s) => s === true);
    } else if (gate.type === 'VOTING_2_3') {
      const trueCount = childStates.filter(Boolean).length;
      return trueCount >= 2;
    }
    return false;
  }

  // Probability quantitative evaluation (Top down approx)
  function evaluateGateProb(gateId: string): number {
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return 0;

    const childProbs = gate.inputs.map((inp) => {
      if (inp.startsWith('G_')) {
        return evaluateGateProb(inp);
      }
      const ev = eventMap.get(inp);
      return ev?.probability ?? ev?.prob ?? 0.01;
    });

    if (gate.type === 'AND') {
      return childProbs.reduce((acc, p) => acc * p, 1);
    } else if (gate.type === 'OR') {
      return 1 - childProbs.reduce((acc, p) => acc * (1 - p), 1);
    } else if (gate.type === 'VOTING_2_3') {
      // 2 out of 3: p1*p2 + p2*p3 + p1*p3 - 2*p1*p2*p3
      const [p1, p2, p3] = childProbs;
      return p1 * p2 + p2 * p3 + p1 * p3 - 2 * p1 * p2 * p3;
    }
    return 0;
  }

  const topEventFailed = evaluateGateState('G_TOP');
  const topProbability = evaluateGateProb('G_TOP');

  // Minimal Cut Sets deduction for the top gate
  const topGate = gates.find((g) => g.id === 'G_TOP');
  let minimalCutSets: string[][] = [];
  if (topGate?.type === 'OR') {
    // Single order or lower order cut sets
    topGate.inputs.forEach((inp) => {
      if (inp.startsWith('G_')) {
        const sub = gates.find((g) => g.id === inp);
        if (sub?.type === 'AND') {
          minimalCutSets.push(sub.inputs);
        } else {
          sub?.inputs.forEach((si) => minimalCutSets.push([si]));
        }
      } else {
        minimalCutSets.push([inp]);
      }
    });
  } else {
    // AND gate
    minimalCutSets.push(topGate?.inputs.filter((i) => !i.startsWith('G_')) || []);
  }

  return { topEventFailed, topProbability, minimalCutSets };
}
