import React, { useState } from 'react';
import {
  Layers,
  TrendingDown,
  AlertOctagon,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle2,
  XCircle,
  Activity,
  Calculator,
} from 'lucide-react';

export const ModuleKnowledgeSlices: React.FC = () => {
  const [activeSlice, setActiveSlice] = useState<'slice1' | 'slice2' | 'slice3' | 'slice4'>('slice1');

  // Interactive Trap 1: Series Collapse Simulator
  const [singleCompR, setSingleCompR] = useState<number>(0.99);
  const [numSeries, setNumSeries] = useState<number>(20);
  const seriesSysR = Math.pow(singleCompR, numSeries);

  // Interactive Slice 2: Availability Calculator
  const [inputMTBF, setInputMTBF] = useState<number>(8000);
  const [inputMTTR, setInputMTTR] = useState<number>(16);
  const calcAvailability = inputMTBF / (inputMTBF + inputMTTR);
  const annualDowntime = (1 - calcAvailability) * 8760;

  // Interactive Slice 4: Same MTBF but different beta comparison
  const [sampleTime, setSampleTime] = useState<number>(500); // early 500h

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                模块 10 / 知识导引
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                系统可靠性基本要素与多维切片知识导引
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              四大工程维度深切片：三大基本要素、可用度机理、三大致命陷阱与“平均寿命”误区警示。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'slice1', label: '切片一：浴盆曲线解构' },
              { id: 'slice2', label: '切片二：MTBF与可用度' },
              { id: 'slice3', label: '切片三：三大致命陷阱' },
              { id: 'slice4', label: '切片四：误区警示与诊断' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSlice(s.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeSlice === s.id
                    ? 'bg-rose-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slice 1 */}
      {activeSlice === 'slice1' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider block">
              SLICE 01 / TRIAD ELEMENTS
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              【切片一：可靠性基本要素的浴盆曲线解构】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              系统可靠性由<strong>失效率（Failure Rate）</strong>、<strong>可靠度（Reliability）</strong>与<strong>维修度（Maintainability）</strong>三大基本要素交织构成。经典的<strong>浴盆曲线（Bathtub Curve）</strong>完整刻画了产品从早期故障期（调试期）、偶然失效期（稳定期）到耗损失效期（磨损期）的全寿命演变规律。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                要素一：失效率 λ(t) (Hazard Rate)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                描述已正常运行至时刻 t 的健康设备，在后续极短微元 Δt 内发生失效的条件概率密度。是浴盆曲线形态的本质物理载体。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                要素二：可靠度 R(t) (Reliability)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                产品在规定使用条件和规定时间内，完成规定功能的概率。数学上是失效率负指数全域积分，满足 R(t) + F(t) ≡ 1。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                要素三：维修度 M(t) (Maintainability)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                系统在发生故障后，在规定时间与环境资源下修复至正常功能状态的能力，直接决定了平均修复时间 MTTR 与可用度。
              </p>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">工程精要准则</span>
              <p className="leading-relaxed text-indigo-900/90">
                浴盆曲线各阶段的物理失效机理完全异构：早期（制造应力释放）必须依靠筛选淘汰；中期（偶发冲击）依靠降额与并联冗余容错；后期（物理磨损老化）必须依靠状态监控与基于寿命的以龄强制更换。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Slice 2 */}
      {activeSlice === 'slice2' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider block">
              SLICE 02 / AVAILABILITY METRICS
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              【切片二：MTBF 与可用度核心指标】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              MTBF（平均故障间隔时间）量化产品无故障运行能力；固有可用度（Availability）则综合考量了故障发生与后续维修恢复的效率，是评估连续生产系统效能的关键指标。
            </p>
          </div>

          {/* Interactive Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                固有可用度交互计算沙盘
              </h4>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                  <span>平均无故障时间 MTBF</span>
                  <span className="font-mono font-bold text-indigo-600">{inputMTBF} 小时</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={inputMTBF}
                  onChange={(e) => setInputMTBF(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                  <span>平均修复时间 MTTR</span>
                  <span className="font-mono font-bold text-amber-600">{inputMTTR} 小时</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  value={inputMTTR}
                  onChange={(e) => setInputMTTR(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">固有可用度 A = MTBF / (MTBF + MTTR)</span>
                <div className="text-3xl font-mono font-bold text-emerald-600 my-1">
                  {(calcAvailability * 100).toFixed(4)}%
                </div>
                <span className="text-xs text-slate-500 font-mono block">
                  年均非计划停机时长: <strong className="text-rose-600">{annualDowntime.toFixed(2)} 小时/年</strong>
                </span>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 leading-snug p-2.5 bg-slate-50 rounded-lg">
                <strong>高可用度启示：</strong>提升可用度不仅可以通过拉长 MTBF（造昂贵高寿命元器件），还可以通过模块化快拆设计、插拔式备件与自动化报警大幅压缩 MTTR。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slice 3 */}
      {activeSlice === 'slice3' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider block">
              SLICE 03 / THREE FATAL TRAPS
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              【切片三：三大致命可靠性陷阱】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              盲目增加串联组件导致系统可靠性呈指数级崩塌；忽视早期磨合期故障直接投入高强度运营；预防性维修周期过短引发过度维修或过长导致突发灾难性失效。
            </p>
          </div>

          {/* Interactive Trap 1: Series Collapse Simulator */}
          <div className="p-5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold text-rose-900">
                陷阱一：串联指数崩塌模拟器（The Curse of Series Architecture）
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>单个组件的高可靠度 R_i</span>
                    <span className="font-mono font-bold text-rose-700">{(singleCompR * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.95"
                    max="0.999"
                    step="0.001"
                    value={singleCompR}
                    onChange={(e) => setSingleCompR(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>串联组件总数量 N</span>
                    <span className="font-mono font-bold text-rose-700">{numSeries} 个</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={numSeries}
                    onChange={(e) => setNumSeries(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">系统整体可靠度 R_sys = R_i^N</span>
                  <div className="text-3xl font-mono font-bold text-rose-600 my-1">
                    {(seriesSysR * 100).toFixed(2)}%
                  </div>
                  <p className="text-xs text-rose-900/80 leading-relaxed">
                    哪怕每一个零件都高达 {(singleCompR * 100).toFixed(1)}% 的极佳质量，一旦有 {numSeries} 个零件串联，整机可靠度就会直接雪崩至 {(seriesSysR * 100).toFixed(2)}%！
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Traps 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 block">
                陷阱二：忽视早期磨合与“换件致死”悲剧
              </span>
              <p className="text-xs text-amber-950/80 leading-relaxed">
                在 β &lt; 1 的早期故障期，新零件具有最高初始失效率。盲目制定过于密集的“定时更换维护”策略，会导致刚熬过磨合期的高可靠性零件被拆下，换上充满不确定性的全新零件，引发工业界恶名昭彰的“换件致死（Maintenance-Induced Failures）”。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
              <span className="text-xs font-bold text-purple-900 block">
                陷阱三：过度维修 vs 欠维护成本倒挂
              </span>
              <p className="text-xs text-purple-950/80 leading-relaxed">
                周期过短：频繁停机拆装消耗巨额计划备件费与工时，侵蚀生产利润；周期过长：微观疲劳裂纹突发失控，引发几倍甚至几十倍的非计划重大停机与灾难性安全事故。必须利用帕累托模型精确寻找谷底平衡点。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Slice 4 */}
      {activeSlice === 'slice4' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider block">
              SLICE 04 / MISCONCEPTION BUSTER
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              【切片四：误区警示与诊断陷阱】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              警惕<strong>“平均寿命高即系统绝对安全”</strong>的误区（必须结合威布尔分布的离散度与具体工况环境进行综合容错设计）。
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-800">
                深度解密：为什么“相同 MTBF”完全不等于“相同的安全性”？
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              假设有两个系统，数学期望寿命完全一致（MTTF 均为 <strong>5000 小时</strong>）：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>系统 A：威布尔 β = 3.5 (集中磨损型)</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">高离散度低</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  寿命高度集中在 4000~6000 小时之间。在运行前 2000 小时内，几乎发生故障的概率接近 <strong>0%</strong>。
                </p>
                <div className="text-[11px] text-emerald-700 font-mono">
                  前期极度安全，适于高可靠性任务。
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>系统 B：威布尔 β = 0.7 (早期夭折型)</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px]">早期高危</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  虽然平均能活 5000 小时（极个别“寿星”拉高了平均数），但在前 500 小时内，由于早期缺陷，发生故障的概率高达 <strong>30% 以上</strong>！
                </p>
                <div className="text-[11px] text-rose-700 font-mono">
                  直接投入高负荷运营将酿成灾难！
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>首席诊断警言：</strong>脱离寿命分布的形状参数（离散程度）而孤立地谈论“平均寿命（MTBF）”，是工业界最昂贵且危险的数学陷阱。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
