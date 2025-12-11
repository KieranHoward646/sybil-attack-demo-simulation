import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle, VehicleType, AlertStatus } from '../types';
import { COLORS, GRID_SIZE, BLOCK_SIZE, ROAD_WIDTH } from '../constants';

// Declare intrinsic elements to fix Typescript errors with @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      boxGeometry: any;
      ringGeometry: any;
      meshBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      directionalLight: any;
      fog: any;
    }
  }
}

const RoadNetwork: React.FC = () => {
  const roads = useMemo(() => {
    const lines = [];
    const limit = GRID_SIZE / 2;
    // Create a grid of roads
    for (let i = -limit; i <= limit; i += BLOCK_SIZE) {
        // Z-axis roads
        lines.push(
            <mesh key={`z-${i}`} position={[i, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[ROAD_WIDTH, GRID_SIZE]} />
                <meshStandardMaterial color={COLORS.ROAD} />
            </mesh>
        );
        // X-axis roads
        lines.push(
            <mesh key={`x-${i}`} position={[0, 0.01, i]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                <planeGeometry args={[ROAD_WIDTH, GRID_SIZE]} />
                <meshStandardMaterial color={COLORS.ROAD} />
            </mesh>
        );
    }
    return lines;
  }, []);

  return <group>{roads}</group>;
};

const CarInstance: React.FC<{ data: Vehicle }> = ({ data }) => {
  const color = data.type === VehicleType.SYBIL ? COLORS.SYBIL : COLORS.NORMAL;
  
  // Alert Indicator Ring
  const hasAlert = data.alertStatus !== AlertStatus.NONE;
  const alertColor = data.alertStatus === AlertStatus.TRUE_ALERT ? COLORS.TRUE_ALERT : COLORS.FALSE_ALERT;

  return (
    <group position={new THREE.Vector3(...data.position)} rotation={[0, -data.rotation, 0]}>
      {/* Car Body */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Roof Indicator for Sybil */}
      {data.type === VehicleType.SYBIL && (
          <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.5, 0.2, 0.5]} />
              <meshStandardMaterial color="#7f1d1d" emissive="#7f1d1d" emissiveIntensity={0.5} />
          </mesh>
      )}

      {/* Alert Signal (Sphere expanding or just a ring) */}
      {hasAlert && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
           <ringGeometry args={[1, 1.2, 32]} />
           <meshBasicMaterial color={alertColor} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Dynamic connection lines could go here if visualizing consensus, 
          but for performance keeping it to indicators */}
    </group>
  );
};

interface SimulationCanvasProps {
  vehicles: Vehicle[];
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ vehicles }) => {
  return (
    <Canvas className="w-full h-full bg-black">
      <PerspectiveCamera makeDefault position={[30, 40, 30]} fov={50} />
      <OrbitControls maxPolarAngle={Math.PI / 2.1} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 20, 10]} intensity={1} />
      <directionalLight position={[-10, 30, 20]} intensity={1.5} castShadow />

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Grid args={[GRID_SIZE, GRID_SIZE]} cellColor="#222" sectionColor="#444" position={[0, 0, 0]} infiniteGrid fadeDistance={50} />
      
      <RoadNetwork />

      {/* Vehicles */}
      {vehicles.map(v => (
        <CarInstance key={v.id} data={v} />
      ))}
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#050505', 10, 90]} />
    </Canvas>
  );
};