import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ShieldAlert, Users, Zap, RefreshCcw, Play, Square } from 'lucide-react';
import { SimulationStats, SimulationConfig, ChartDataPoint, SystemThreatLevel } from '../types';
import { THREAT_CONFIG, COLORS } from '../constants';

interface DashboardProps {
  stats: SimulationStats;
  config: SimulationConfig;
  updateConfig: (key: keyof SimulationConfig, value: number | boolean) => void;
  resetSimulation: () => void;
  chartData: ChartDataPoint[];
  threatLevel: SystemThreatLevel;
}

const StatItem: React.FC<{ label: string; value: string | number; color?: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700">
    <div className="flex items-center gap-2 text-neutral-400 text-sm">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`text-lg font-mono font-bold ${color || 'text-white'}`}>{value}</div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  config, 
  updateConfig, 
  resetSimulation,
  chartData,
  threatLevel
}) => {
  const threat = THREAT_CONFIG[threatLevel];

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 text-white overflow-y-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-blue-400 mb-1">系统状态控制台</h1>
        <p className="text-xs text-neutral-500 font-mono">VANET SECURITY MONITOR v1.0</p>
      </div>

      {/* System Status Grid */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-300 uppercase mb-3 flex items-center gap-2">
            <Activity size={16} /> 系统状态 (System Status)
        </h2>
        <div className="grid grid-cols-2 gap-3">
            <StatItem icon={<Users size={14}/>} label="车辆总数" value={stats.totalVehicles} />
            <StatItem icon={<ShieldAlert size={14}/>} label="女巫节点" value={stats.sybilCount} color="text-red-500" />
            <StatItem icon={<Zap size={14}/>} label="共识延迟" value={`${stats.consensusLatency}ms`} color={stats.consensusLatency > 100 ? 'text-yellow-400' : 'text-green-400'} />
            <StatItem icon={<Activity size={14}/>} label="成功率" value={`${stats.successRate}%`} />
            <StatItem icon={<AlertTriangle size={14}/>} label="虚假警报" value={stats.falseAlerts} color="text-fuchsia-400" />
            <StatItem icon={<AlertTriangle size={14}/>} label="真实警报" value={stats.trueAlerts} color="text-blue-400" />
        </div>
      </section>

      {/* Attack Control */}
      <section className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
        <h2 className="text-sm font-semibold text-neutral-300 uppercase mb-4 flex items-center gap-2">
            <Zap size={16} /> 攻击控制 (Attack Control)
        </h2>
        
        <div className="space-y-4 mb-6">
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">女巫攻击节点比例 (Ratio)</span>
                    <span className="font-mono text-red-400">{(config.sybilRatio * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" min="0" max="1" step="0.05"
                    value={config.sybilRatio}
                    onChange={(e) => updateConfig('sybilRatio', parseFloat(e.target.value))}
                    disabled={config.isAttackActive}
                    className="w-full accent-red-500 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
            </div>
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">女巫攻击强度 (Strength)</span>
                    <span className="font-mono text-orange-400">{(config.attackStrength * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" min="0" max="1" step="0.1"
                    value={config.attackStrength}
                    onChange={(e) => updateConfig('attackStrength', parseFloat(e.target.value))}
                    className="w-full accent-orange-500 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={() => updateConfig('isAttackActive', !config.isAttackActive)}
                className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                    config.isAttackActive 
                    ? 'bg-neutral-700 hover:bg-neutral-600 text-white' 
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
            >
                {config.isAttackActive ? <><Square size={16}/> 停止攻击</> : <><Play size={16}/> 启动攻击</>}
            </button>
            <button 
                onClick={resetSimulation}
                className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-neutral-300 transition-colors"
                title="重置"
            >
                <RefreshCcw size={20} />
            </button>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="flex-grow min-h-[200px] flex flex-col">
        <h2 className="text-sm font-semibold text-neutral-300 uppercase mb-3 flex items-center gap-2">
            <Activity size={16} /> 性能指标 (Metrics)
        </h2>
        <div className="flex-grow bg-neutral-900 rounded-lg border border-neutral-800 p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" tick={false} />
                    <YAxis yAxisId="left" stroke={COLORS.NORMAL} fontSize={10} label={{ value: '延迟(ms)', angle: -90, position: 'insideLeft', fill: '#888' }} />
                    <YAxis yAxisId="right" orientation="right" stroke={COLORS.FALSE_ALERT} fontSize={10} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="latency" stroke={COLORS.NORMAL} dot={false} strokeWidth={2} name="共识延迟" isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="falseAlertRate" stroke={COLORS.FALSE_ALERT} dot={false} strokeWidth={2} name="虚假警报率" isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </section>

      {/* Attack Explanation */}
      <section>
          <div className={`${threat.color} p-4 rounded-t-lg text-center transition-colors duration-500`}>
              <h2 className="text-2xl font-black text-white drop-shadow-md">{threat.label}</h2>
              <p className="text-white/90 text-sm mt-1">{threat.description}</p>
          </div>
          <div className="bg-neutral-800 p-4 rounded-b-lg border border-neutral-700 border-t-0 text-xs text-neutral-400 leading-relaxed">
             <h3 className="font-bold text-white mb-2">女巫攻击危害说明</h3>
             <p className="mb-2">在车联网(VANET)中，女巫攻击者创建大量虚假身份，通过以下方式破坏系统：</p>
             <ul className="list-disc pl-4 space-y-1">
                 <li><strong className="text-blue-400">伪造交通事件</strong>：在安全路段制造虚假事故警报</li>
                 <li><strong className="text-red-400">操控共识</strong>：通过多数投票使恶意交易被接受</li>
                 <li><strong className="text-yellow-400">资源耗尽</strong>：增加网络延迟，降低系统吞吐量</li>
                 <li><strong className="text-orange-400">引发事故</strong>：导致正常车辆做出危险驾驶决策</li>
             </ul>
          </div>
      </section>

    </div>
  );
};