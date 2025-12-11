import { useState, useEffect, useRef, useCallback } from 'react';
import { Vehicle, VehicleType, AlertStatus, SimulationConfig, SimulationStats, ChartDataPoint, SystemThreatLevel } from '../types';
import { GRID_SIZE, BLOCK_SIZE } from '../constants';

const TOTAL_CARS = 50;

// Helper to get random position on grid
const getRandomGridPosition = (): [number, number, number] => {
  const range = GRID_SIZE / 2;
  // Snap to grid lines (roads)
  const isHorizontal = Math.random() > 0.5;
  let x, z;
  
  if (isHorizontal) {
    x = (Math.random() * GRID_SIZE) - range;
    // Round z to nearest block multiple
    z = Math.round(((Math.random() * GRID_SIZE) - range) / BLOCK_SIZE) * BLOCK_SIZE;
  } else {
    z = (Math.random() * GRID_SIZE) - range;
    x = Math.round(((Math.random() * GRID_SIZE) - range) / BLOCK_SIZE) * BLOCK_SIZE;
  }
  return [x, 0.25, z];
};

export const useVanetSimulation = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [config, setConfig] = useState<SimulationConfig>({
    sybilRatio: 0,
    attackStrength: 0,
    isAttackActive: false,
    totalVehicles: TOTAL_CARS,
  });
  
  const [stats, setStats] = useState<SimulationStats>({
    totalVehicles: TOTAL_CARS,
    sybilCount: 0,
    consensusLatency: 20,
    successRate: 99.9,
    falseAlerts: 0,
    trueAlerts: 1, // Start with one real accident
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [threatLevel, setThreatLevel] = useState<SystemThreatLevel>(SystemThreatLevel.SAFE);

  // Initialize vehicles
  useEffect(() => {
    const initialVehicles: Vehicle[] = Array.from({ length: TOTAL_CARS }).map((_, i) => ({
      id: i,
      type: VehicleType.NORMAL,
      position: getRandomGridPosition(),
      rotation: 0,
      targetNode: [0, 0], // Logic simplified for visualizer
      speed: 0.1 + Math.random() * 0.1,
      alertStatus: i === 0 ? AlertStatus.TRUE_ALERT : AlertStatus.NONE, // Vehicle 0 always has real trouble
    }));
    setVehicles(initialVehicles);
  }, []);

  // Update Stats and Threats based on Config
  useEffect(() => {
    const activeSybilCount = config.isAttackActive 
      ? Math.floor(config.totalVehicles * config.sybilRatio) 
      : 0;
    
    // Calculate simulated metrics
    const baseLatency = 20; // ms
    // Exponential latency increase based on sybil count and strength
    const addedLatency = activeSybilCount * (config.attackStrength * 5) * 1.5; 
    const latency = Math.min(baseLatency + addedLatency, 2000); // Cap at 2000ms

    // Success rate drops as Sybils increase
    const success = Math.max(100 - (activeSybilCount / config.totalVehicles * 100) * config.attackStrength, 0);

    // False alerts proportional to active Sybils and strength
    const falseAlertCount = Math.floor(activeSybilCount * config.attackStrength * 1.5);

    setStats(prev => ({
      ...prev,
      sybilCount: activeSybilCount,
      consensusLatency: Math.floor(latency),
      successRate: parseFloat(success.toFixed(2)),
      falseAlerts: falseAlertCount,
    }));

    // Determine Threat Level
    const sybilPercentage = activeSybilCount / config.totalVehicles;
    if (sybilPercentage > 0.5 && config.attackStrength > 0.5) setThreatLevel(SystemThreatLevel.CRITICAL);
    else if (sybilPercentage > 0.3) setThreatLevel(SystemThreatLevel.DANGER);
    else if (sybilPercentage > 0.1 && config.isAttackActive) setThreatLevel(SystemThreatLevel.UNDER_ATTACK);
    else setThreatLevel(SystemThreatLevel.SAFE);

  }, [config]);

  // Animation Loop for vehicle movement & Chart update
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const lastChartUpdate = useRef<number>(0);

  const animate = useCallback(() => {
    setVehicles(prevVehicles => {
      return prevVehicles.map(v => {
        // Simple grid movement logic
        let [x, y, z] = v.position;
        const speed = v.speed;
        
        // Determine direction based on grid snapping
        // If roughly aligned with X axis block
        const onXAxis = Math.abs(z % BLOCK_SIZE) < 0.1;
        const onZAxis = Math.abs(x % BLOCK_SIZE) < 0.1;

        let newX = x;
        let newZ = z;
        let newRot = v.rotation;

        // Basic wandering logic
        if (onXAxis && Math.random() > 0.02) {
            newX += (Math.cos(v.rotation) > 0 ? speed : -speed);
        } else if (onZAxis && Math.random() > 0.02) {
            newZ += (Math.sin(v.rotation) > 0 ? speed : -speed);
        } else {
            // Turn at intersection
             if (Math.random() > 0.5) {
                newRot += Math.PI / 2;
             } else {
                newRot -= Math.PI / 2;
             }
             // Nudge away from intersection to prevent getting stuck
             newX += Math.cos(newRot) * speed;
             newZ += Math.sin(newRot) * speed;
        }

        // Boundary wrap
        const limit = GRID_SIZE / 2;
        if (newX > limit) newX = -limit;
        if (newX < -limit) newX = limit;
        if (newZ > limit) newZ = -limit;
        if (newZ < -limit) newZ = limit;

        // Dynamic Type Switching based on Config
        // We only switch types for indices > 0 to preserve the one "True Alert" car
        let currentType = v.type;
        let currentAlert = v.alertStatus;
        
        if (v.id !== 0) {
            const sybilCountTarget = config.isAttackActive 
                ? Math.floor(config.totalVehicles * config.sybilRatio) 
                : 0;
            
            // Simple logic: lower IDs become Sybils first (deterministic for visualization stability)
            if (v.id <= sybilCountTarget) {
                currentType = VehicleType.SYBIL;
                // Sybils generate false alerts based on attack strength
                if (Math.random() < config.attackStrength * 0.1) {
                    currentAlert = AlertStatus.FALSE_ALERT;
                } else if (Math.random() < 0.05) {
                     currentAlert = AlertStatus.NONE; // Stop alerting occasionally
                }
            } else {
                currentType = VehicleType.NORMAL;
                currentAlert = AlertStatus.NONE;
            }
        } else {
            // The one true alert car
            currentAlert = AlertStatus.TRUE_ALERT; 
        }

        return {
          ...v,
          position: [newX, y, newZ],
          rotation: newRot,
          type: currentType,
          alertStatus: currentAlert
        };
      });
    });

    // Update Chart Data periodically (every 1s)
    const now = Date.now();
    if (now - lastChartUpdate.current > 1000) {
       setStats(currentStats => {
           setChartData(prevData => {
               const newData = [...prevData, {
                   time: new Date().toLocaleTimeString('en-US', { hour12: false, minute:'2-digit', second:'2-digit' }),
                   latency: currentStats.consensusLatency,
                   falseAlertRate: currentStats.falseAlerts
               }];
               // Keep last 20 points
               if (newData.length > 20) newData.shift();
               return newData;
           });
           return currentStats;
       });
       lastChartUpdate.current = now;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [config]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const updateConfig = (key: keyof SimulationConfig, value: number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetSimulation = () => {
    setConfig({
        sybilRatio: 0,
        attackStrength: 0,
        isAttackActive: false,
        totalVehicles: TOTAL_CARS,
    });
  };

  return { vehicles, stats, config, updateConfig, resetSimulation, chartData, threatLevel };
};