import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Sparkles, MeshReflectorMaterial, Text, Environment, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle, VehicleType, AlertStatus } from '../types';
import { COLORS, GRID_SIZE, BLOCK_SIZE, ROAD_WIDTH } from '../constants';

// Fix TS for Three elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      boxGeometry: any;
      sphereGeometry: any;
      coneGeometry: any;
      octahedronGeometry: any;
      cylinderGeometry: any;
      ringGeometry: any;
      meshBasicMaterial: any;
      meshPhysicalMaterial: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      directionalLight: any;
      fogExp2: any;
    }
  }
}

// Background Cityscape Generator - High-Tech White City
const Cityscape = () => {
  const buildings = useMemo(() => {
    const items = [];
    const count = 60;
    const range = GRID_SIZE * 1.5;
    
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * range;
      let z = (Math.random() - 0.5) * range;
      
      if (Math.abs(x) < GRID_SIZE / 2 + 5 && Math.abs(z) < GRID_SIZE / 2 + 5) continue;

      const height = 10 + Math.random() * 30;
      const width = 4 + Math.random() * 6;
      
      items.push(
        <mesh key={i} position={[x, height / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[width, height, width]} />
          {/* Silver/White Minimalist Buildings */}
          <meshPhysicalMaterial 
            color="#f1f5f9" // Slate-100
            metalness={0.1}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      );
    }
    return items;
  }, []);

  return <group>{buildings}</group>;
};

// Floor with Reflections - Showroom White
const ReflectiveFloor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40} // High reflection
        roughness={0.5}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#f8fafc" // Very light gray/white
        metalness={0.2}
        mirror={0.7} 
      />
    </mesh>
  );
};

// Road Network - Dark Asphalt for Contrast
const RoadNetwork: React.FC = () => {
  const roads = useMemo(() => {
    const lines = [];
    const limit = GRID_SIZE / 2;
    for (let i = -limit; i <= limit; i += BLOCK_SIZE) {
        // Z-axis roads
        lines.push(
            <group key={`z-${i}`} position={[i, 0.02, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[ROAD_WIDTH, GRID_SIZE]} />
                    <meshStandardMaterial color="#262626" roughness={0.9} />
                </mesh>
                {/* Road Markings */}
                <mesh position={[-ROAD_WIDTH/2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, GRID_SIZE]} />
                    <meshBasicMaterial color="#525252" />
                </mesh>
                <mesh position={[ROAD_WIDTH/2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, GRID_SIZE]} />
                    <meshBasicMaterial color="#525252" />
                </mesh>
            </group>
        );
        // X-axis roads
        lines.push(
            <group key={`x-${i}`} position={[0, 0.02, i]} rotation={[0, Math.PI / 2, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[ROAD_WIDTH, GRID_SIZE]} />
                    <meshStandardMaterial color="#262626" roughness={0.9} />
                </mesh>
                <mesh position={[-ROAD_WIDTH/2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, GRID_SIZE]} />
                    <meshBasicMaterial color="#525252" />
                </mesh>
                <mesh position={[ROAD_WIDTH/2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, GRID_SIZE]} />
                    <meshBasicMaterial color="#525252" />
                </mesh>
            </group>
        );
    }
    return lines;
  }, []);

  return <group>{roads}</group>;
};

const PulseRing: React.FC<{ color: string }> = ({ color }) => {
    const ref = useRef<any>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.z -= delta;
            ref.current.scale.x += delta * 3;
            ref.current.scale.y += delta * 3;
            if (ref.current.scale.x > 8) {
                ref.current.scale.set(1, 1, 1);
            }
        }
    });

    return (
        <mesh ref={ref} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}>
            <ringGeometry args={[0.5, 0.8, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
    );
};

const CarInstance: React.FC<{ data: Vehicle }> = ({ data }) => {
  const isSybil = data.type === VehicleType.SYBIL;
  const color = isSybil ? COLORS.SYBIL : COLORS.NORMAL;
  const hasAlert = data.alertStatus !== AlertStatus.NONE;
  const alertColor = data.alertStatus === AlertStatus.TRUE_ALERT ? COLORS.TRUE_ALERT : COLORS.FALSE_ALERT;

  return (
    <group position={new THREE.Vector3(...data.position)} rotation={[0, -data.rotation, 0]}>
      {/* Light helps illuminate the road below the car */}
      <pointLight 
        color={color} 
        distance={4} 
        intensity={1} 
        decay={2}
        position={[0, 0.5, 0]}
      />

      <group position={[0, 0.5, 0]}>
          {isSybil ? (
              // Sybil Node: Aggressive Red Spikes
              <Float speed={5} rotationIntensity={1} floatIntensity={0.5}>
                  <mesh castShadow>
                      <octahedronGeometry args={[0.6, 0]} />
                      <meshStandardMaterial 
                        color={color} 
                        roughness={0.2}
                        metalness={0.8}
                      />
                  </mesh>
                  <mesh scale={1.2}>
                      <octahedronGeometry args={[0.6, 0]} />
                      <meshBasicMaterial color={color} wireframe />
                  </mesh>
                  {/* Dark glitch particles */}
                  <Sparkles count={10} scale={2} size={3} speed={0.4} opacity={1} color="#000" />
              </Float>
          ) : (
              // Normal Node: Sleek Metallic Pod
              <group>
                  <mesh castShadow receiveShadow>
                      <boxGeometry args={[1.4, 0.4, 0.7]} />
                      <meshPhysicalMaterial 
                        color="#e2e8f0" // Silver
                        metalness={0.8} 
                        roughness={0.2} 
                        clearcoat={1}
                      />
                  </mesh>
                  {/* Colored Indicator Strip */}
                  <mesh position={[0, 0.05, 0]}>
                       <boxGeometry args={[1.45, 0.05, 0.75]} />
                       <meshBasicMaterial color={color} toneMapped={false} />
                  </mesh>
                  <mesh position={[0.2, 0.3, 0]}>
                      <boxGeometry args={[0.6, 0.3, 0.5]} />
                      <meshPhysicalMaterial color="#111" metalness={1} roughness={0} />
                  </mesh>
              </group>
          )}
      </group>

      {hasAlert && <PulseRing color={alertColor} />}
      
      {isSybil && (
          <Text position={[0, 2, 0]} fontSize={0.5} color="#ef4444" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff">
            ! SYBIL !
          </Text>
      )}
    </group>
  );
};

interface SimulationCanvasProps {
  vehicles: Vehicle[];
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ vehicles }) => {
  return (
    <Canvas 
      className="w-full h-full bg-white" // CHANGED: Black to White
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <PerspectiveCamera makeDefault position={[35, 35, 35]} fov={45} />
      <OrbitControls 
        maxPolarAngle={Math.PI / 2.2} 
        minDistance={10}
        maxDistance={100}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
      
      {/* Studio/Daylight Lighting */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight 
        position={[50, 80, 50]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-60, 60, 60, -60]} />
      </directionalLight>
      
      {/* Soft Fog for clean infinity look */}
      <fogExp2 attach="fog" args={['#f8fafc', 0.015]} />
      
      <Environment preset="city" />

      <Cityscape />
      <ReflectiveFloor />
      <RoadNetwork />

      {vehicles.map(v => (
        <CarInstance key={v.id} data={v} />
      ))}
      
    </Canvas>
  );
};