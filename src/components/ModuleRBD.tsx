import React, { useState, useMemo } from 'react';
import {
  GitCommit,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Layers,
  Settings2,
  Zap,
} from 'lucide-react';
import { ComponentBlock } from '../types/reliability';
import { solveRBDSystem, calculateAvailability } from '../utils/mathReliability';

export const ModuleRBD: React.FC = () => {
  const [topologyType, setTopologyType] = useState<'series' | 'parallel' | 'hybrid' | 'k_out_of_n'>('hybrid');
  const [evalTime, setEvalTime] = useState<number>(1000); // hours
  const [kParam, setKParam] = useState<number>(2);
  const [nParam, setNParam] = useState<number>(3);

  // Preset component blocks
  const [blocks, setBlocks] = useState<ComponentBlock[]>([
    {
      id: 'B1',
      name: '主逆变/感知模块 A',
      type: 'block',
      failureRate: 0.0001,
      mtbf: 10000,
      mttr: 4,
      cost: 15,
      operationalStatus: 'normal',
      description: '关键信号链路节点 A',
    },
    {
      id: 'B2',
      name: '冗余逆变/感知模块 B',
      type: 'block',
      failureRate: 0.0001,
      mtbf: 10000,
      mttr: 4,
      cost: 15,
      operationalStatus: 'normal',
      description: '关键信号链路节点 B',
    },
    {
      id: 'B3',
      name: '主控仲裁运算主板',
      type: 'block',
      failureRate: 0.00005,
      mtbf: 20000,
      mttr: 2,
      cost: 28,
      operationalStatus: 'normal',
      description: '中央协调控制器',
    },
    {
      id: 'B4',
      name: '闭环纯水冷却/供电总成',
      type: 'block',
      failureRate: 0.00008,
      mtbf: 12500,
      mttr: 6,
      cost: 12,
      operationalStatus: 'normal',
      description: '保障性基础设施',
    },
  ]);

  // Topology switch helper presets
  const applyPreset = (type: 'series' | 'parallel' | 'hybrid' | 'k_out_of_n') => {
    setTopologyType(type);
    if (type === 'series') {
      setBlocks([
        { id: 'S1', name: '大功率 IGBT 桥臂', type: 'block', failureRate: 8.3e-6, mtbf: 120000, mttr: 4, cost: 20, operationalStatus: 'normal' },
        { id: 'S2', name: '直流平波电容组', type: 'block', failureRate: 4.0e-6, mtbf: 250000, mttr: 3, cost: 12, operationalStatus: 'normal' },
        { id: 'S3', name: '门极驱动控制板', type: 'block', failureRate: 5.5e-6, mtbf: 180000, mttr: 2, cost: 16, operationalStatus: 'normal' },
        { id: 'S4', name: '水冷散热闭环泵', type: 'block', failureRate: 6.7e-6, mtbf: 150000, mttr: 5, cost: 14, operationalStatus: 'normal' },
      ]);
    } else if (type === 'parallel') {
      setBlocks([
        { id: 'P1', name: 'A列主运行大机组', type: 'block', failureRate: 1.5e-4, mtbf: 6500, mttr: 12, cost: 180, operationalStatus: 'normal' },
        { id: 'P2', name: 'B列热备用互锁机组', type: 'block', failureRate: 1.5e-4, mtbf: 6500, mttr: 12, cost: 180, operationalStatus: 'normal' },
      ]);
    } else if (type === 'k_out_of_n') {
      setKParam(2);
      setNParam(3);
      setBlocks([
        { id: 'K1', name: '联锁安全计算机 A (2oo3)', type: 'block', failureRate: 1.2e-5, mtbf: 85000, mttr: 1, cost: 45, operationalStatus: 'normal' },
        { id: 'K2', name: '联锁安全计算机 B (2oo3)', type: 'block', failureRate: 1.2e-5, mtbf: 85000, mttr: 1, cost: 45, operationalStatus: 'normal' },
        { id: 'K3', name: '联锁安全计算机 C (2oo3)', type: 'block', failureRate: 1.2e-5, mtbf: 85000, mttr: 1, cost: 45, operationalStatus: 'normal' },
      ]);
    } else {
      // Hybrid
      setBlocks([
        { id: 'H1', name: '感知前向主激光雷达', type: 'block', failureRate: 2.0e-5, mtbf: 50000, mttr: 3, cost: 25, operationalStatus: 'normal' },
        { id: 'H2', name: '感知前向长焦双目视觉', type: 'block', failureRate: 2.5e-5, mtbf: 40000, mttr: 2, cost: 18, operationalStatus: 'normal' },
        { id: 'H3', name: '主自动驾驶 SoC (Orin-A)', type: 'block', failureRate: 1.0e-5, mtbf: 100000, mttr: 1, cost: 60, operationalStatus: 'normal' },
        { id: 'H4', name: '备自动驾驶 SoC (Orin-B)', type: 'block', failureRate: 1.0e-5, mtbf: 100000, mttr: 1, cost: 60, operationalStatus: 'normal' },
      ]);
    }
  };

  // Toggle individual block failure
  const toggleStatus = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, operationalStatus: b.operationalStatus === 'normal' ? 'failed' : 'normal' } : b))
    );
  };

  // Solve system analytical status
  const systemMetrics = useMemo(() => {
    return solveRBDSystem(topologyType, blocks, kParam, nParam, evalTime);
  }, [topologyType, blocks, kParam, nParam, evalTime]);

  // System Inherent Availability
  const avgMTTR = useMemo(() => {
    return blocks.reduce((acc, b) => acc + b.mttr, 0) / (blocks.length || 1);
  }, [blocks]);

  const availabilityMetrics = useMemo(() => {
    return calculateAvailability(systemMetrics.systemMTBF, avgMTTR);
  }, [systemMetrics.systemMTBF, avgMTTR]);

  // Sensitivity / Birnbaum Importance Approximation
  const importanceRank = useMemo(() => {
    return blocks.map((b) => {
      // Structural sensitivity: what happens if this block fails?
      const testBlocks = blocks.map((tb) =>
        tb.id === b.id ? { ...tb, operationalStatus: 'failed' } : { ...tb, operationalStatus: 'normal' }
      );
      const res = solveRBDSystem(topologyType, testBlocks, kParam, nParam, evalTime);
      const drop = (systemMetrics.systemReliability - res.systemReliability);
      return {
        id: b.id,
        name: b.name,
        importanceScore: Math.max(0, drop),
        isBottleneck: drop > 0.4 || (topologyType === 'series' && b.failureRate > 1e-5),
      };
    }).sort((a, b) => b.importanceScore - a.importanceScore);
  }, [blocks, topologyType, kParam, nParam, evalTime, systemMetrics.systemReliability]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                模块 03 / 可靠性框图
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                可靠性框图 (RBD) 与拓扑仿真系统
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              交互搭建串联、并联、混联及 k/n(G) 表决冗余拓扑，实时注入单点故障并解析系统可用度与重要度。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'series', label: '串联 (Series)' },
              { id: 'parallel', label: '并联 (Parallel)' },
              { id: 'hybrid', label: '混联 (Hybrid)' },
              { id: 'k_out_of_n', label: 'k/n 表决 (Voting)' },
            ].map((top) => (
              <button
                key={top.id}
                onClick={() => applyPreset(top.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  topologyType === top.id
                    ? 'bg-purple-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {top.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Evaluation Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>评估任务剖面时间 t</span>
              <span className="font-mono font-bold text-indigo-600">{evalTime} 小时</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={evalTime}
              onChange={(e) => setEvalTime(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {topologyType === 'k_out_of_n' && (
            <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-purple-900 block">表决逻辑: {kParam} 取 {nParam} (k/n)</span>
                <span className="text-[11px] text-purple-700">至少需 {kParam} 个节点存活方可保障系统运转</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKParam(Math.max(1, kParam - 1))}
                  className="w-6 h-6 rounded bg-white text-purple-700 border border-purple-200 text-xs font-bold"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-purple-900">{kParam}</span>
                <button
                  onClick={() => setKParam(Math.min(nParam, kParam + 1))}
                  className="w-6 h-6 rounded bg-white text-purple-700 border border-purple-200 text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">提示：点击下方任意方框可实时注入【故障/修复】</span>
            <button
              onClick={() => {
                setBlocks((prev) => prev.map((b) => ({ ...b, operationalStatus: 'normal' })));
              }}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              全部复位
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800">
              可靠性方框拓扑画布 ({topologyType === 'series' ? '纯串联系统' : topologyType === 'parallel' ? '纯并联冗余' : topologyType === 'hybrid' ? '混联冗余架构' : `${kParam}oo${nParam} 表决架构`})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                systemMetrics.isFunctioning
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {systemMetrics.isFunctioning ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  系统拓扑通路连通 (正常工作)
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  系统拓扑被割断 (停机失效)
                </>
              )}
            </span>
          </div>
        </div>

        {/* Visual Topological Layout */}
        <div className="min-h-56 bg-slate-50/80 border border-slate-200/80 rounded-xl p-6 flex items-center justify-center overflow-x-auto">
          {/* Series Layout */}
          {topologyType === 'series' && (
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">IN</div>
              {blocks.map((block, idx) => (
                <React.Fragment key={block.id}>
                  <div
                    onClick={() => toggleStatus(block.id)}
                    className={`cursor-pointer transition-all duration-200 p-4 rounded-xl border-2 w-48 text-center select-none shadow-xs hover:scale-102 ${
                      block.operationalStatus === 'failed'
                        ? 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-white border-emerald-400 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-slate-400">{block.id}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          block.operationalStatus === 'failed' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {block.operationalStatus === 'failed' ? '已击穿' : '正常'}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-800 truncate">{block.name}</div>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono">
                      MTBF: {block.mtbf.toLocaleString()}h
                    </div>
                  </div>
                  {idx < blocks.length - 1 && (
                    <div className={`w-8 h-1 ${systemMetrics.isFunctioning ? 'bg-emerald-500' : 'bg-rose-300'}`} />
                  )}
                </React.Fragment>
              ))}
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">OUT</div>
            </div>
          )}

          {/* Parallel Layout */}
          {topologyType === 'parallel' && (
            <div className="flex items-center gap-4">
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">IN</div>
              <div className="flex flex-col gap-4">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    onClick={() => toggleStatus(block.id)}
                    className={`cursor-pointer transition-all duration-200 p-4 rounded-xl border-2 w-56 text-center select-none shadow-xs hover:scale-102 ${
                      block.operationalStatus === 'failed'
                        ? 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-white border-emerald-400 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-slate-400">{block.id}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          block.operationalStatus === 'failed' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {block.operationalStatus === 'failed' ? '故障跳闸' : '在线热备'}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-800 truncate">{block.name}</div>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono">
                      MTBF: {block.mtbf.toLocaleString()}h | MTTR: {block.mttr}h
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">OUT</div>
            </div>
          )}

          {/* Hybrid Layout */}
          {topologyType === 'hybrid' && (
            <div className="flex items-center gap-4">
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">IN</div>
              {/* Stage 1: Parallel Pair */}
              <div className="flex flex-col gap-3">
                {[blocks[0], blocks[1]].filter(Boolean).map((block) => (
                  <div
                    key={block.id}
                    onClick={() => toggleStatus(block.id)}
                    className={`cursor-pointer transition-all duration-200 p-3 rounded-xl border-2 w-48 text-center select-none shadow-xs hover:scale-102 ${
                      block.operationalStatus === 'failed'
                        ? 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-white border-emerald-400 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-mono text-slate-400">{block.id}</span>
                      <span
                        className={`px-1 rounded text-[9px] font-bold ${
                          block.operationalStatus === 'failed' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {block.operationalStatus === 'failed' ? '离线' : '正常'}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-800 truncate">{block.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">MTBF: {block.mtbf}h</div>
                  </div>
                ))}
              </div>

              <div className={`w-8 h-1 ${systemMetrics.isFunctioning ? 'bg-emerald-500' : 'bg-rose-300'}`} />

              {/* Stage 2: Parallel Pair */}
              <div className="flex flex-col gap-3">
                {[blocks[2], blocks[3]].filter(Boolean).map((block) => (
                  <div
                    key={block.id}
                    onClick={() => toggleStatus(block.id)}
                    className={`cursor-pointer transition-all duration-200 p-3 rounded-xl border-2 w-48 text-center select-none shadow-xs hover:scale-102 ${
                      block.operationalStatus === 'failed'
                        ? 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-white border-emerald-400 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-mono text-slate-400">{block.id}</span>
                      <span
                        className={`px-1 rounded text-[9px] font-bold ${
                          block.operationalStatus === 'failed' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {block.operationalStatus === 'failed' ? '离线' : '正常'}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-800 truncate">{block.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">MTBF: {block.mtbf}h</div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">OUT</div>
            </div>
          )}

          {/* k-out-of-n Layout */}
          {topologyType === 'k_out_of_n' && (
            <div className="flex items-center gap-4">
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">IN</div>
              <div className="flex flex-col gap-3">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    onClick={() => toggleStatus(block.id)}
                    className={`cursor-pointer transition-all duration-200 p-3.5 rounded-xl border-2 w-56 text-center select-none shadow-xs hover:scale-102 ${
                      block.operationalStatus === 'failed'
                        ? 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-white border-emerald-400 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-mono text-slate-400">{block.id}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          block.operationalStatus === 'failed' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {block.operationalStatus === 'failed' ? '表决弃权' : '有效票'}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-800">{block.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">MTBF: {block.mtbf}h</div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 bg-purple-100 text-purple-800 text-xs font-mono rounded-lg border border-purple-200">
                表决器 ({kParam}/{nParam})
              </div>
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-mono rounded-lg">OUT</div>
            </div>
          )}
        </div>

        {/* Calculated System Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
            <span className="text-[10px] text-slate-400 font-mono block">系统综合可靠度 R(t={evalTime}h)</span>
            <span className="text-lg font-mono font-bold text-emerald-600">
              {(systemMetrics.systemReliability * 100).toFixed(3)}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">任务持续时间保全概率</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
            <span className="text-[10px] text-slate-400 font-mono block">系统等效 MTBF</span>
            <span className="text-lg font-mono font-bold text-indigo-600">
              {systemMetrics.systemMTBF.toLocaleString()} 小时
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">平均故障间隔时间</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
            <span className="text-[10px] text-slate-400 font-mono block">固有可用度 (Availability Ai)</span>
            <span className="text-lg font-mono font-bold text-purple-600">
              {(availabilityMetrics.availability * 100).toFixed(4)}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ai = MTBF / (MTBF + MTTR)</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
            <span className="text-[10px] text-slate-400 font-mono block">年均非计划停机时间</span>
            <span className="text-lg font-mono font-bold text-rose-600">
              {availabilityMetrics.downtimeHoursPerYear.toFixed(2)} 小时/年
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">8,760h 连续运行基准</span>
          </div>
        </div>

        {/* Sensitivity & Bottleneck Analysis */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
            组件结构重要度 (Birnbaum Structural Importance) 与薄弱瓶颈辨识
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {importanceRank.map((imp, idx) => (
              <div
                key={imp.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800">{imp.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 text-[11px]">
                    重要度: {imp.importanceScore.toFixed(3)}
                  </span>
                  {imp.isBottleneck && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-semibold">
                      关键瓶颈
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
