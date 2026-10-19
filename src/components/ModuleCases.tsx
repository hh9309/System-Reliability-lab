import React, { useState } from 'react';
import {
  Train,
  Plane,
  Factory,
  Car,
  Wind,
  Network,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { INDUSTRIAL_CASES } from '../data/industrialCases';
import { calculateMaintenanceCostCurve, weibullMTTF } from '../utils/mathReliability';

interface Props {
  onSelectCase?: (caseId: string) => void;
}

export const ModuleCases: React.FC<Props> = ({ onSelectCase }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('hsr-traction');

  const currentCase = INDUSTRIAL_CASES.find((c) => c.id === selectedCaseId) || INDUSTRIAL_CASES[0];

  // Icons lookup
  const caseIcons: Record<string, React.ReactNode> = {
    'hsr-traction': <Train className="w-5 h-5 text-indigo-600" />,
    'aero-blade': <Plane className="w-5 h-5 text-sky-600" />,
    'chem-compressor': <Factory className="w-5 h-5 text-emerald-600" />,
    'auto-domain': <Car className="w-5 h-5 text-purple-600" />,
    'wind-turbine': <Wind className="w-5 h-5 text-teal-600" />,
    'urban-rail-cbtc': <Network className="w-5 h-5 text-amber-600" />,
  };

  // Cost curve for the case
  const costCurve = calculateMaintenanceCostCurve(
    currentCase.weibullParams.beta,
    currentCase.weibullParams.eta,
    currentCase.maintenanceParams.cp,
    currentCase.maintenanceParams.cf,
    50
  );

  const mttf = weibullMTTF(currentCase.weibullParams.beta, currentCase.weibullParams.eta);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                模块 05 / 工程实战
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                六大系统可靠性实战案例库
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              工业级大工程真实场景映射，深入解构高可靠性串联、威布尔疲劳、冗余并联、FTA防共模与运维成本帕累托权衡。
            </p>
          </div>
        </div>

        {/* Case Selector Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {INDUSTRIAL_CASES.map((item) => {
            const isSelected = item.id === selectedCaseId;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedCaseId(item.id)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all text-xs ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-white rounded-lg shadow-2xs border border-slate-200/60">
                    {caseIcons[item.id]}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">CASE 0{INDUSTRIAL_CASES.indexOf(item) + 1}</span>
                </div>
                <span className="font-bold text-slate-800 leading-snug line-clamp-1">{item.title}</span>
                <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{item.industry}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Case Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Case Overview & RBD Architecture */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-600 block">
                  {currentCase.subtitle}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{currentCase.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                {currentCase.badge}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-bold text-slate-700 block mb-1">工程背景与系统职能</span>
                <p className="text-xs text-slate-600 leading-relaxed">{currentCase.summary}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <span className="text-xs font-bold text-amber-900 block mb-1">严苛工况挑战与失效应力</span>
                <p className="text-xs text-amber-800 leading-relaxed">{currentCase.challenge}</p>
              </div>
            </div>

            {/* Architecture Components Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                系统拓扑架构与关键组件可靠度参数
              </h4>
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">子系统 / 关键元器件</th>
                      <th className="py-2.5 px-3">拓扑角色</th>
                      <th className="py-2.5 px-3 font-mono">失效率 λ</th>
                      <th className="py-2.5 px-3 font-mono">MTBF</th>
                      <th className="py-2.5 px-3 font-mono">MTTR (修复时间)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentCase.rbdArchitecture.components.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-800">{c.name}</td>
                        <td className="py-2 px-3 text-slate-500">{c.role}</td>
                        <td className="py-2 px-3 font-mono text-indigo-600">{(c.failureRate * 1e6).toFixed(1)} FIT</td>
                        <td className="py-2 px-3 font-mono font-semibold">{c.mtbf.toLocaleString()} h</td>
                        <td className="py-2 px-3 font-mono text-amber-600">{c.mttr} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Engineering Insight */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">首席可靠性专家洞见与设计对策</span>
                <p className="leading-relaxed text-emerald-950/90">{currentCase.engineeringInsight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance Pareto Tradeoff & Parameters */}
        <div className="space-y-6">
          {/* Weibull & Cost Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              寿命分布参数与经济更换周期
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
                <span className="text-[10px] text-slate-400 block">形状参数 β</span>
                <span className="text-base font-bold text-indigo-600">{currentCase.weibullParams.beta}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {currentCase.weibullParams.beta > 1 ? '磨损失效主导' : '随机偶然失效率'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
                <span className="text-[10px] text-slate-400 block">特征寿命 η</span>
                <span className="text-base font-bold text-indigo-600">{currentCase.weibullParams.eta} h</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">MTTF ≈ {Math.round(mttf)}h</span>
              </div>
            </div>

            {/* Pareto Cost Curve Mini SVG */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-slate-700">维护成本率曲线 C(Tp)</span>
                <span className="font-mono text-[11px] text-rose-600 font-bold">
                  最优周期 Tp*: {currentCase.maintenanceParams.optimalTp}h
                </span>
              </div>

              <div className="relative w-full h-36 bg-white border border-slate-200 rounded-lg p-2">
                <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                  <line x1="20" y1="100" x2="280" y2="100" stroke="#cbd5e1" />
                  {/* Curve */}
                  <path
                    d={costCurve.data.reduce((acc, pt, idx) => {
                      const maxCost = Math.max(...costCurve.data.map((d) => d.costRate)) || 1;
                      const minCost = Math.min(...costCurve.data.map((d) => d.costRate)) || 0;
                      const x = 20 + (idx / costCurve.data.length) * 260;
                      const normY = (pt.costRate - minCost) / (maxCost - minCost || 1);
                      const y = 95 - normY * 75;
                      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.2"
                  />
                  {/* Optimal Marker */}
                  <circle cx="130" cy="80" r="4" fill="#f43f5e" />
                  <text x="130" y="70" fill="#f43f5e" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    Tp*={currentCase.maintenanceParams.optimalTp}h
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono">
                <span className="text-slate-500">
                  计划更换成本 Cp: <strong>{currentCase.maintenanceParams.cp} 万</strong>
                </span>
                <span className="text-slate-500">
                  故障停机损失 Cf: <strong>{currentCase.maintenanceParams.cf} 万</strong>
                </span>
              </div>
            </div>

            {/* Quick Action to Load into Modules */}
            <button
              onClick={() => {
                if (onSelectCase) onSelectCase(currentCase.id);
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>将此案例全套参数装载至全流程实验室</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
