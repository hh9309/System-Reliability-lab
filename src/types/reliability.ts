/**
 * System Reliability Engineering Data Types
 */

export type DistributionType = 'weibull' | 'exponential' | 'normal';

export interface WeibullParams {
  beta: number; // Shape parameter (形状参数)
  eta: number;  // Scale parameter / Characteristic life (尺度参数/特征寿命, hours)
  gamma: number; // Location parameter (位置参数, default 0)
}

export interface ExponentialParams {
  lambda: number; // Constant failure rate (失效率, 1/hours)
}

export interface NormalParams {
  mu: number;    // Mean lifetime (均值, hours)
  sigma: number; // Standard deviation (标准差, hours)
}

export interface ComponentBlock {
  id: string;
  name: string;
  type: 'series' | 'parallel' | 'block';
  failureRate: number; // in failures per 10^6 hours (FIT or 1/h)
  mtbf: number;        // in hours
  mttr: number;        // in hours (for availability)
  cost: number;        // unit cost (k RMB)
  operationalStatus: 'normal' | 'failed' | 'degraded';
  description?: string;
}

export interface RBDStructure {
  id: string;
  name: string;
  type: 'series' | 'parallel' | 'hybrid' | 'k_out_of_n';
  k?: number;
  n?: number;
  blocks: ComponentBlock[];
}

export interface FTABasicEvent {
  id: string;
  name: string;
  probability: number; // q_i failure probability
  isFailed: boolean;   // for live fault injection
  description: string;
  code: string;
}

export interface FTAGate {
  id: string;
  name: string;
  gateType: 'AND' | 'OR' | 'VOTING_2_3';
  childEventIds: string[]; // references basic events or child gates
  childGateIds?: string[];
  description?: string;
}

export interface IndustrialCase {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
  badge: string;
  mappingConcept: string;
  summary: string;
  challenge: string;
  weibullParams: WeibullParams;
  rbdArchitecture: {
    systemType: 'series' | 'parallel' | 'hybrid' | 'k_out_of_n';
    k?: number;
    n?: number;
    components: {
      name: string;
      mtbf: number;
      mttr: number;
      failureRate: number; // 1/h
      role: string;
    }[];
  };
  ftaTopEvent: {
    name: string;
    gate: 'OR' | 'AND';
    causes: { name: string; prob: number; code: string }[];
  };
  maintenanceParams: {
    cf: number; // corrective failure cost (万 RMB)
    cp: number; // preventive replacement cost (万 RMB)
    currentTp: number; // current maintenance interval (hours)
    optimalTp: number; // optimal maintenance interval (hours)
  };
  engineeringInsight: string;
}

export interface MaintenanceCostModel {
  cp: number; // 预防性更换单次成本
  cf: number; // 故障停机灾难性处理单次成本
  inspectionCost: number; // 周期检查成本
  tp: number; // 当前设定的预防性维修周期 (hours)
  optimalTp: number;
  minCostRate: number;
}
