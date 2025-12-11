import { SystemThreatLevel } from './types';

export const COLORS = {
  NORMAL: '#4ade80',      // Green-400
  SYBIL: '#ef4444',       // Red-500
  TRUE_ALERT: '#3b82f6',  // Blue-500 (Real accident warning)
  FALSE_ALERT: '#d946ef', // Fuchsia-500 (Fake news)
  ROAD: '#333333',
};

export const THREAT_CONFIG = {
  [SystemThreatLevel.SAFE]: {
    label: '安全 (SAFE)',
    color: 'bg-green-600',
    description: '系统运行正常，网络延迟低，无明显恶意节点。'
  },
  [SystemThreatLevel.UNDER_ATTACK]: {
    label: '受攻击 (UNDER ATTACK)',
    color: 'bg-yellow-500',
    description: '检测到少量女巫节点，共识延迟轻微上升。'
  },
  [SystemThreatLevel.DANGER]: {
    label: '危险 (DANGER)',
    color: 'bg-orange-500',
    description: '女巫节点比例较高，网络拥堵，存在虚假警报。'
  },
  [SystemThreatLevel.CRITICAL]: {
    label: '十分危急 (CRITICAL)',
    color: 'bg-red-600',
    description: '共识机制接近瘫痪，大量虚假信息充斥网络。'
  },
};

export const GRID_SIZE = 60;
export const ROAD_WIDTH = 2;
export const BLOCK_SIZE = 10;