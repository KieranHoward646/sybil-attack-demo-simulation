import React from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { Dashboard } from './components/Dashboard';
import { useVanetSimulation } from './hooks/useVanetSimulation';

export default function App() {
  const { vehicles, stats, config, updateConfig, resetSimulation, chartData, threatLevel } = useVanetSimulation();

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden font-sans">
      {/* Left Side: 3D Visualization */}
      <main className="flex-grow relative border-r border-neutral-800 bg-white">
        <SimulationCanvas vehicles={vehicles} />
        
        {/* Overlay Legend - Light Theme for White Background */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-neutral-200 text-xs text-neutral-800 pointer-events-none select-none z-10">
           <h3 className="font-extrabold mb-3 uppercase text-neutral-500 tracking-wider">Network Legend</h3>
           <div className="space-y-2">
               <div className="flex items-center gap-3">
                   <div className="w-4 h-4 bg-cyan-400 rounded shadow-sm ring-1 ring-neutral-300"></div> 
                   <span className="font-semibold">正常节点 (Normal)</span>
               </div>
               <div className="flex items-center gap-3">
                   <div className="w-4 h-4 bg-red-500 rounded shadow-sm ring-1 ring-red-200"></div> 
                   <span className="font-semibold">女巫节点 (Sybil)</span>
               </div>
               <div className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-50"></div> 
                   <span className="font-semibold">真实警报 (True Alert)</span>
               </div>
               <div className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full border-2 border-fuchsia-500 bg-fuchsia-50"></div> 
                   <span className="font-semibold">虚假警报 (False Alert)</span>
               </div>
           </div>
        </div>
      </main>

      {/* Right Side: Control Dashboard */}
      <aside className="w-[400px] flex-shrink-0 bg-neutral-900 shadow-2xl z-20">
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