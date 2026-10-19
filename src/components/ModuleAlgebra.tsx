import React, { useState } from 'react';
import { Activity, Calculator, ArrowRight, Info, CheckCircle2, Sliders, TrendingUp } from 'lucide-react';
import { bathtubHazard } from '../utils/mathReliability';

export const ModuleAlgebra: React.FC = () => {
  const [hazardMode, setHazardMode] = useState<'constant' | 'linear' | 'weibull' | 'bathtub'>('weibull');
  const [time, setTime] = useState<number>(3500); // 0 to 10000 hours
  const [constLambda, setConstLambda] = useState<number>(0.0002);
  const [weibullBeta, setWeibullBeta] = useState<number>(2.2);
  const [weibullEta, setWeibullEta] = useState<number>(6000);

  // Calculate curves over 100 points
  const maxT = 10000;
  const numPoints = 80;
  const points: { t: number; lambda: number; R: number; F: number; f: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * maxT;
    let l = 0;
    let r = 1;

    if (hazardMode === 'constant') {
      l = constLambda;
      r = Math.exp(-l * t);
    } else if (hazardMode === 'linear') {
      const c = 0.00000006;
      l = c * t;
      r = Math.exp(-0.5 * c * t * t);
    } else if (hazardMode === 'weibull') {
      const ratio = Math.max(0.0001, t / weibullEta);
      l = (weibullBeta / weibullEta) * Math.pow(ratio, weibullBeta - 1);
      r = Math.exp(-Math.pow(ratio, weibullBeta));
    } else {
      // Bathtub
      const b = bathtubHazard(t, maxT);
      l = b.total;
      // Approximate R(t)
      const ratio = t / 5000;
      r = Math.exp(-Math.pow(ratio, 1.4));
    }

    const failureF = 1 - r;
    const density = l * r;
    points.push({ t, lambda: l, R: r, F: failureF, f: density });
  }

  // Current values at slider `time`
  const currentRatio = Math.max(0.0001, time / (weibullEta || 6000));
  let curLambda = 0;
  let curR = 1;

  if (hazardMode === 'constant') {
    curLambda = constLambda;
    curR = Math.exp(-curLambda * time);
  } else if (hazardMode === 'linear') {
    const c = 0.00000006;
    curLambda = c * time;
    curR = Math.exp(-0.5 * c * time * time);
  } else if (hazardMode === 'weibull') {
    curLambda = (weibullBeta / weibullEta) * Math.pow(currentRatio, weibullBeta - 1);
    curR = Math.exp(-Math.pow(currentRatio, weibullBeta));
  } else {
    curLambda = bathtubHazard(time, maxT).total;
    curR = Math.exp(-Math.pow(time / 5000, 1.4));
  }
  const curF = 1 - curR;
  const curDensity = curLambda * curR;

  // Max values for chart normalization
  const maxLambdaInPoints = Math.max(...points.map((p) => p.lambda)) || 1e-4;
  const maxDensityInPoints = Math.max(...points.map((p) => p.f)) || 1e-4;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold tracking-wide">
                模块 01 / 核心基础
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">可靠性代数与概率微积分建模</h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              严格形式化推演失效率函数 <span className="font-mono text-indigo-600 font-semibold">λ(t)</span>、可靠度函数 <span className="font-mono text-emerald-600 font-semibold">R(t)</span>、累积故障分布 <span className="font-mono text-rose-600 font-semibold">F(t)</span> 与故障概率密度 <span className="font-mono text-amber-600 font-semibold">f(t)</span> 的微积分对应法则。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">模型模式:</span>
            {[
              { id: 'constant', label: '常失效率 (指数)' },
              { id: 'linear', label: '线性磨损 (瑞利)' },
              { id: 'weibull', label: '威布尔演化' },
              { id: 'bathtub', label: '经典浴盆曲线' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setHazardMode(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  hazardMode === m.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span className="font-medium">当前运行时间 t</span>
              <span className="font-mono font-bold text-indigo-600">{time} 小时</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxT}
              step="50"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0h</span>
              <span>5,000h</span>
              <span>10,000h</span>
            </div>
          </div>

          {hazardMode === 'weibull' && (
            <>
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span className="font-medium">形状参数 β (斜率)</span>
                  <span className="font-mono font-bold text-indigo-600">{weibullBeta.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.05"
                  value={weibullBeta}
                  onChange={(e) => setWeibullBeta(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0.5 (早期故障)</span>
                  <span>1.0 (偶然)</span>
                  <span>4.0 (磨损)</span>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span className="font-medium">特征寿命 η (尺度)</span>
                  <span className="font-mono font-bold text-indigo-600">{weibullEta} h</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="9000"
                  step="100"
                  value={weibullEta}
                  onChange={(e) => setWeibullEta(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>2,000h</span>
                  <span>6,000h</span>
                  <span>9,000h</span>
                </div>
              </div>
            </>
          )}

          {hazardMode === 'constant' && (
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 md:col-span-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span className="font-medium">失效率 λ (1/h)</span>
                <span className="font-mono font-bold text-indigo-600">{(constLambda * 1e6).toFixed(1)} FIT (10⁻⁶/h)</span>
              </div>
              <input
                type="range"
                min="0.00005"
                max="0.0008"
                step="0.00001"
                value={constLambda}
                onChange={(e) => setConstLambda(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>50 FIT</span>
                <span>200 FIT (MTBF=5000h)</span>
                <span>800 FIT</span>
              </div>
            </div>
          )}

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 flex flex-col justify-center">
            <div className="text-[11px] text-indigo-600 font-medium">瞬时评估 (t = {time}h)</div>
            <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">可靠度 R(t)</span>
                <span className="font-bold text-emerald-700">{(curR * 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">故障概率 F(t)</span>
                <span className="font-bold text-rose-600">{(curF * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Curves Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Curves Visualizer (SVG Canvas) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              动态可靠度与失效率联动曲线族
            </h3>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-1 bg-emerald-500 rounded-sm"></span> R(t) 可靠度
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-1 bg-rose-400 rounded-sm"></span> F(t) 累积故障
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-2.5 h-1 bg-indigo-500 rounded-sm"></span> λ(t) 失效率
              </span>
            </div>
          </div>

          <div className="relative w-full h-64 bg-slate-50/70 border border-slate-200/60 rounded-xl overflow-hidden p-2">
            <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[0, 60, 120, 180].map((y) => (
                <line key={y} x1="30" y1={y + 10} x2="490" y2={y + 10} stroke="#e2e8f0" strokeDasharray="3,3" />
              ))}
              {[100, 200, 300, 400].map((x) => (
                <line key={x} x1={x + 30} y1="10" x2={x + 30} y2="210" stroke="#f1f5f9" />
              ))}

              {/* Axes labels */}
              <text x="35" y="25" fill="#94a3b8" fontSize="9" fontFamily="monospace">1.0 (100%)</text>
              <text x="35" y="115" fill="#94a3b8" fontSize="9" fontFamily="monospace">0.5 (50%)</text>
              <text x="35" y="205" fill="#94a3b8" fontSize="9" fontFamily="monospace">0.0</text>
              <text x="450" y="225" fill="#94a3b8" fontSize="9" fontFamily="monospace">10,000h</text>

              {/* R(t) Path */}
              <path
                d={points.reduce((acc, p, idx) => {
                  const x = 30 + (p.t / maxT) * 450;
                  const y = 200 - p.R * 190;
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* F(t) Path */}
              <path
                d={points.reduce((acc, p, idx) => {
                  const x = 30 + (p.t / maxT) * 450;
                  const y = 200 - p.F * 190;
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4,3"
              />

              {/* Lambda(t) Path normalized */}
              <path
                d={points.reduce((acc, p, idx) => {
                  const x = 30 + (p.t / maxT) * 450;
                  const normL = Math.min(1.0, p.lambda / (maxLambdaInPoints * 1.1));
                  const y = 200 - normL * 180;
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.2"
              />

              {/* Current Time Indicator Line */}
              {(() => {
                const lineX = 30 + (time / maxT) * 450;
                const pointY_R = 200 - curR * 190;
                return (
                  <g>
                    <line x1={lineX} y1="10" x2={lineX} y2="210" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,3" />
                    {/* Circle on R */}
                    <circle cx={lineX} cy={pointY_R} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    {/* Time tooltip */}
                    <rect x={Math.min(380, Math.max(30, lineX - 35))} y="6" width="70" height="18" rx="4" fill="#1e293b" />
                    <text x={Math.min(380, Math.max(30, lineX - 35)) + 35} y="18" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      t={time}h
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>联动规律：</strong>任意时刻必有恒等式 <span className="font-mono text-slate-700 font-semibold">R(t) + F(t) ≡ 1</span>。失效率 <span className="font-mono text-indigo-600">λ(t)</span> 反映的是“在活过时刻 t 的幸存者中，下一瞬发生故障的条件速率”，不同于全局分布密度 <span className="font-mono text-amber-600">f(t) = λ(t)·R(t)</span>。
            </span>
          </div>
        </div>

        {/* Right: Step-by-Step Mathematical Derivation Slice */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">5步代数微积分形式化体系</h3>
                <p className="text-xs text-slate-400">从条件概率到 MTBF 的严谨数学闭环</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
                    失效率 (Hazard Rate) 的条件极限定义
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600">条件概率</span>
                </div>
                <div className="font-mono text-xs bg-white p-2 rounded border border-slate-200/50 text-slate-800">
                  λ(t) = lim[Δt→0] P(t &lt; T ≤ t+Δt | T &gt; t) / Δt = f(t) / R(t)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
                    一阶齐次微分方程组建
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600">导数转化</span>
                </div>
                <div className="font-mono text-xs bg-white p-2 rounded border border-slate-200/50 text-slate-800">
                  f(t) = dF(t)/dt = - dR(t)/dt &nbsp;⇒&nbsp; dR(t)/dt = - λ(t) · R(t)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
                    分离变量积分：可靠度经典主公式
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600">核心公式</span>
                </div>
                <div className="font-mono text-xs bg-indigo-50/50 p-2 rounded border border-indigo-200 text-indigo-900 font-bold">
                  R(t) = exp( - ∫₀ᵗ λ(u) du )
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">4</span>
                    平均无故障时间 (MTBF / MTTF) 面积定理
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600">全域积分</span>
                </div>
                <div className="font-mono text-xs bg-white p-2 rounded border border-slate-200/50 text-slate-800">
                  MTBF = E[T] = ∫₀^∞ t·f(t) dt = ∫₀^∞ R(t) dt &nbsp;(分部积分展开)
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> 满足保真概率测度空间
            </span>
            <span>可切换上方选项观察不同失效率函数响应</span>
          </div>
        </div>
      </div>
    </div>
  );
};
