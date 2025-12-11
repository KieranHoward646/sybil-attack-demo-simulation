export enum VehicleType {
  NORMAL = 'NORMAL',
  SYBIL = 'SYBIL',
}

export enum AlertStatus {
  NONE = 'NONE',
  TRUE_ALERT = 'TRUE_ALERT',   // Valid accident/event
  FALSE_ALERT = 'FALSE_ALERT', // Fabricated by Sybil
}

export interface Vehicle {
  id: number;
  type: VehicleType;
  position: [number, number, number]; // x, y, z
  rotation: number; // angle in radians
  targetNode: [number, number];
  speed: number;
  alertStatus: AlertStatus;
}

export interface SimulationConfig {
  sybilRatio: number; // 0 to 1
  attackStrength: number; // 0 to 1
  isAttackActive: boolean;
  totalVehicles: number;
}

export interface SimulationStats {
  totalVehicles: number;
  sybilCount: number;
  consensusLatency: number; // ms
  successRate: number; // percentage
  falseAlerts: number;
  trueAlerts: number;
}

export interface ChartDataPoint {
  time: string;
  latency: number;
  falseAlertRate: number;
}

export enum SystemThreatLevel {
  SAFE = 'SAFE',
  UNDER_ATTACK = 'UNDER_ATTACK',
  DANGER = 'DANGER',
  CRITICAL = 'CRITICAL',
}