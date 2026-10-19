import React, { useState, useMemo } from 'react';
import {
  GitFork,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Zap,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { FTABasicEvent, FTAGate } from '../types/reliability';
import { solveFTATree } from '../utils/mathReliability';

export const ModuleFTA: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'adcu' | 'traction' | 'turbine'>('adcu');

  // Basic events with occurrence probability and live injection status
  const [basicEvents, setBasicEvents] = useState<FTABasicEvent[]>([
    {
      id: 'BE_CLK',
      name: '双SoC时钟共模抖动/晶振击穿',
      probability: 0.00008,
      isFailed: false,
      description: '物理共模单点时钟源',
      code: 'BE1',
    },
    {
      id: 'BE_PWR_A',
      name: '主通道 DCDC 电源异常失电',
      probability: 0.0015,
      isFailed: false,
      description: 'SoC-A 供电模块',
      code: 'BE2',
    },
    {
      id: 'BE_PWR_B',
      name: '备用通道 DCDC 电源异常失电',
      probability: 0.0015,
      isFailed: false,
      description: 'SoC-B 供电模块',
      code: 'BE3',
    },
    {
      id: 'BE_CAN_A',
      name: '底盘 CAN-A 总线物理短路',
      probability: 0.002,
      isFailed: false,
      description: '主执行总线',
      code: 'BE4',
    },
    {
      id: 'BE_CAN_B',
      name: '底盘 CAN-B 总线物理短路',
      probability: 0.002,
      isFailed: false,
      description: '备执行总线',
      code: 'BE5',
    },
  ]);

  // Logic Gates for the tree
  const [gates, setGates] = useState<FTAGate[]>([
    {
      id: 'G_TOP',
      name: '顶事件: 自动驾驶域控规划指令全失效',
      gateType: 'OR',
      childEventIds: ['BE_CLK'],
      childGateIds: ['G_PWR', 'G_CAN'],
    },
    {
      id: 'G_PWR',
      name: '供电系统双路失效',
      gateType: 'AND',
      childEventIds: ['BE_PWR_A', 'BE_PWR_B'],
    },
    {
      id: 'G_CAN',
      name: '通信总线双路中断',
      gateType: 'AND',
      childEventIds: ['BE_CAN_A', 'BE_CAN_B'],
    },
  ]);

  // Presets changer
  const switchPreset = (type: 'adcu' | 'traction' | 'turbine') => {
    setSelectedPreset(type);
    if (type === 'adcu') {
      setBasicEvents([
        { id: 'BE_CLK', name: '双SoC共享外部时钟源失效(共因)', probability: 0.00008, isFailed: false, description: '共因失效单点', code: 'BE1' },
        { id: 'BE_PWR_A', name: '主通道 DCDC-A 供电中断', probability: 0.0015, isFailed: false, description: 'SoC-A 供电', code: 'BE2' },
        { id: 'BE_PWR_B', name: '备用通道 DCDC-B 供电中断', probability: 0.0015, isFailed: false, description: 'SoC-B 供电', code: 'BE3' },
        { id: 'BE_CAN_A', name: '底盘 CAN-A 总线断线短路', probability: 0.002, isFailed: false, description: '主控制网络', code: 'BE4' },
        { id: 'BE_CAN_B', name: '底盘 CAN-B 总线断线短路', probability: 0.002, isFailed: false, description: '冗余网络', code: 'BE5' },
      ]);
      setGates([
        { id: 'G_TOP', name: '顶事件: 自动驾驶域控规划指令全失效', gateType: 'OR', childEventIds: ['BE_CLK'], childGateIds: ['G_PWR', 'G_CAN'] },
        { id: 'G_PWR', name: '供电系统双路全失电', gateType: 'AND', childEventIds: ['BE_PWR_A', 'BE_PWR_B'] },
        { id: 'G_CAN', name: '通信总线双路全中断', gateType: 'AND', childEventIds: ['BE_CAN_A', 'BE_CAN_B'] },
      ]);
    } else if (type === 'traction') {
      setBasicEvents([
        { id: 'BE_IGBT_A', name: '上桥臂 IGBT 热击穿短路', probability: 0.004, isFailed: false, description: '功率芯片', code: 'BE1' },
        { id: 'BE_GATE_FLT', name: '光纤隔离驱动板欠压保护误动', probability: 0.003, isFailed: false, description: '驱动回路', code: 'BE2' },
        { id: 'BE_PUMP_1', name: '主水冷循环泵机械卡死', probability: 0.008, isFailed: false, description: '散热泵1', code: 'BE3' },
        { id: 'BE_PUMP_2', name: '备用水冷循环泵机械卡死', probability: 0.008, isFailed: false, description: '散热泵2', code: 'BE4' },
      ]);
      setGates([
        { id: 'G_TOP', name: '顶事件: 牵引变流器紧急跳闸切断', gateType: 'OR', childEventIds: ['BE_IGBT_A', 'BE_GATE_FLT'], childGateIds: ['G_COOL'] },
        { id: 'G_COOL', name: '双水冷循环泵组全故障', gateType: 'AND', childEventIds: ['BE_PUMP_1', 'BE_PUMP_2'] },
      ]);
    } else {
      setBasicEvents([
        { id: 'BE_FOD', name: '吞咽外来物(FOD)形成表面凹坑', probability: 0.0006, isFailed: false, description: '外物损伤', code: 'BE1' },
        { id: 'BE_CREEP', name: '榫齿长期高温蠕变微空洞集聚', probability: 0.0018, isFailed: false, description: '蠕变疲劳', code: 'BE2' },
        { id: 'BE_OVERTEMP', name: '燃烧室局部热斑气膜孔过烧', probability: 0.0022, isFailed: false, description: '高温过热', code: 'BE3' },
      ]);
      setGates([
        { id: 'G_TOP', name: '顶事件: 航空涡轮叶片疲劳断裂飞脱', gateType: 'OR', childEventIds: ['BE_FOD', 'BE_CREEP', 'BE_OVERTEMP'], childGateIds: [] },
      ]);
    }
  };

  // Toggle failure injection
  const toggleEventFailure = (id: string) => {
    setBasicEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFailed: !e.isFailed } : e))
    );
  };

  // Dynamic tree evaluation
  const treeEvaluation = useMemo(() => {
    // Flatten gates inputs
    const formattedGates = gates.map((g) => ({
      id: g.id,
      type: g.gateType,
      inputs: [...g.childEventIds, ...(g.childGateIds || [])],
    }));

    return solveFTATree(formattedGates, basicEvents);
  }, [gates, basicEvents]);

  // Check state of intermediate gates for visual rendering
  const gateStates = useMemo(() => {
    const states: Record<string, boolean> = {};
    const eventMap = new Map(basicEvents.map((e) => [e.id, e.isFailed]));

    gates.forEach((g) => {
      if (g.id !== 'G_TOP') {
        if (g.gateType === 'AND') {
          states[g.id] = g.childEventIds.every((id) => eventMap.get(id));
        } else {
          states[g.id] = g.childEventIds.some((id) => eventMap.get(id));
        }
      }
    });

    states['G_TOP'] = treeEvaluation.topEventFailed;
    return states;
  }, [gates, basicEvents, treeEvaluation.topEventFailed]);

  // Minimal Cut Sets deduction and categorization
  const cutSetsAnalysis = useMemo(() => {
    const mcsList: { order: number; events: string[]; risk: string }[] = [];

    // Find 1st order cut sets (single events leading to top OR gate)
    const topGate = gates.find((g) => g.id === 'G_TOP');
    if (topGate?.gateType === 'OR') {
      topGate.childEventIds.forEach((eid) => {
        const ev = basicEvents.find((e) => e.id === eid);
        mcsList.push({
          order: 1,
          events: [ev?.name || eid],
          risk: '高危致命单点 (1阶割集: 单一失效即导致系统瘫痪)',
        });
      });

      // Child AND gates produce 2nd order cut sets
      topGate.childGateIds?.forEach((gid) => {
        const sub = gates.find((g) => g.id === gid);
        if (sub?.gateType === 'AND') {
          const names = sub.childEventIds.map((id) => basicEvents.find((e) => e.id === id)?.name || id);
          mcsList.push({
            order: sub.childEventIds.length,
            events: names,
            risk: `${sub.childEventIds.length}阶冗余割集 (需所有组件同时失效)`,
          });
        }
      });
    }

    return mcsList;
  }, [gates, basicEvents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                模块 04 / 故障树分析
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                故障树分析 (FTA) 与底事件联动系统
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              通过与门 (AND Gate)、或门 (OR Gate) 定量推演顶事件概率，辨识最小割集 (MCS) 与消除共因失效隐患。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'adcu', label: '自动驾驶域控 (双Orin)' },
              { id: 'traction', label: '高铁变流器紧急跳闸' },
              { id: 'turbine', label: '航空叶片疲劳断裂' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => switchPreset(p.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedPreset === p.id
                    ? 'bg-rose-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">顶事件失效率 / 概率 Q_top</span>
              <span className="text-sm font-mono font-bold text-rose-600">
                {(treeEvaluation.topProbability * 100).toFixed(5)}%
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold font-mono">
              ~{(treeEvaluation.topProbability * 1e6).toFixed(1)} FIT
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">最小割集 (MCS) 总数</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {cutSetsAnalysis.length} 个割集
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              包含 {cutSetsAnalysis.filter((c) => c.order === 1).length} 个 1阶单点割集
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">点击下方底事件圆形进行【故障注入】</span>
            <button
              onClick={() => {
                setBasicEvents((prev) => prev.map((e) => ({ ...e, isFailed: false })));
              }}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> 重置状态
            </button>
          </div>
        </div>
      </div>

      {/* Visual Interactive Fault Tree Diagram */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-800">
              逻辑树拓扑演化 (实时故障状态自底向上蔓延)
            </h3>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              treeEvaluation.topEventFailed
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {treeEvaluation.topEventFailed ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                ⚠️ 顶事件被触发！系统发生非计划故障停机
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                顶事件受控（系统当前未发生全局故障）
              </>
            )}
          </div>
        </div>

        {/* Tree Container */}
        <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-6 flex flex-col items-center space-y-6 overflow-x-auto">
          {/* Level 1: Top Event Box */}
          <div
            className={`p-4 rounded-xl border-2 w-80 text-center shadow-xs transition-all ${
              gateStates['G_TOP']
                ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-mono mb-1">TOP EVENT</div>
            <div className="text-xs font-bold">{gates[0]?.name.replace('顶事件: ', '')}</div>
            <div className="text-[10px] font-mono mt-1 text-slate-500">
              触发状态: {gateStates['G_TOP'] ? '【已触发】' : '【安全】'}
            </div>
          </div>

          {/* Level 2: Top Gate Symbol (OR Gate) */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-slate-300" />
            <div
              className={`px-4 py-1.5 rounded-lg border-2 text-xs font-mono font-bold flex items-center gap-1.5 ${
                gateStates['G_TOP']
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <span>或门 (OR GATE)</span>
              <span className="text-[10px] opacity-80">(任一输入满足即触发)</span>
            </div>
            <div className="w-0.5 h-4 bg-slate-300" />
          </div>

          {/* Level 3: Intermediate Gates & Direct Basic Events */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {/* Direct Basic Event (Single Point Failures like Clock) */}
            {gates[0]?.childEventIds.map((eid) => {
              const ev = basicEvents.find((e) => e.id === eid);
              if (!ev) return null;
              return (
                <div key={ev.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-slate-300" />
                  <div
                    onClick={() => toggleEventFailure(ev.id)}
                    className={`cursor-pointer p-3.5 rounded-full border-2 w-40 h-40 flex flex-col items-center justify-center text-center shadow-xs transition-all hover:scale-105 ${
                      ev.isFailed
                        ? 'bg-rose-100 border-rose-500 text-rose-900'
                        : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 mb-1 font-bold">
                      单点割集 {ev.code}
                    </span>
                    <span className="text-xs font-semibold leading-tight line-clamp-2">{ev.name}</span>
                    <span className="text-[9px] font-mono text-slate-500 mt-1">
                      P = {(ev.probability * 100).toFixed(4)}%
                    </span>
                    <span
                      className={`text-[9px] font-bold mt-1 px-1.5 rounded ${
                        ev.isFailed ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ev.isFailed ? '已击穿' : '正常'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Intermediate AND Gates */}
            {gates.slice(1).map((gate) => (
              <div key={gate.id} className="flex flex-col items-center space-y-4">
                <div className="w-0.5 h-4 bg-slate-300" />
                <div
                  className={`p-3 rounded-xl border-2 text-center w-full max-w-xs shadow-xs transition-all ${
                    gateStates[gate.id]
                      ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 font-mono">INTERMEDIATE</div>
                  <div className="text-xs font-bold">{gate.name}</div>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                    与门 (AND) - 双冗余全部失效
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-slate-300" />

                {/* Child Basic Events of this AND gate */}
                <div className="flex gap-3">
                  {gate.childEventIds.map((cid) => {
                    const ev = basicEvents.find((e) => e.id === cid);
                    if (!ev) return null;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => toggleEventFailure(ev.id)}
                        className={`cursor-pointer p-3 rounded-full border-2 w-32 h-32 flex flex-col items-center justify-center text-center shadow-xs transition-all hover:scale-105 ${
                          ev.isFailed
                            ? 'bg-rose-100 border-rose-500 text-rose-900'
                            : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
                        }`}
                      >
                        <span className="text-[9px] font-mono text-slate-400 mb-0.5">{ev.code}</span>
                        <span className="text-[11px] font-semibold leading-tight line-clamp-2">{ev.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 mt-1">
                          {(ev.probability * 100).toFixed(3)}%
                        </span>
                        <span
                          className={`text-[9px] font-bold mt-1 px-1.5 rounded ${
                            ev.isFailed ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ev.isFailed ? '已失效' : '完好'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Cut Sets (MCS) Breakdown Table */}
        <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            解析出的最小割集 (Minimal Cut Sets - MCS) 与薄弱环节定位
          </h4>
          <div className="space-y-2">
            {cutSetsAnalysis.map((mcs, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      mcs.order === 1 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    割集 {idx + 1} ({mcs.order} 阶)
                  </span>
                  <span className="font-semibold text-slate-800">
                    {mcs.events.join(' ∩ ')}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{mcs.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
