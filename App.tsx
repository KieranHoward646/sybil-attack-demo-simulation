import React from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { Dashboard } from './components/Dashboard';
import { useVanetSimulation } from './hooks/useVanetSimulation';

export default function App() {
  const { vehicles, stats, config, updateConfig, resetSimulation, chartData, threatLevel } = useVanetSimulation();

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden font-sans">
      {/* Left Side: 3D Visualization */}
      <main className="flex-grow relative border-r border-neutral-800">
        <SimulationCanvas vehicles={vehicles} />
        
        {/* Overlay Legend */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded border border-white/10 text-xs text-white pointer-events-none select-none">
           <h3 className="font-bold mb-2 uppercase text-neutral-400">Map Legend</h3>
           <div className="space-y-1">
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-sm"></div> 正常节点 (Normal)</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm border border-red-300"></div> 女巫节点 (Sybil)</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-blue-500"></div> 真实警报 (True Alert)</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-fuchsia-500"></div> 虚假警报 (False Alert)</div>
           </div>
        </div>
      </main>

      {/* Right Side: Control Dashboard */}
      <aside className="w-[400px] flex-shrink-0 bg-neutral-900 shadow-2xl z-10">
        <Dashboard 
            stats={stats}
            config={config}
            updateConfig={updateConfig}
            resetSimulation={resetSimulation}
            chartData={chartData}
            threatLevel={threatLevel}
        />
      </aside>
    </div>
  );
}