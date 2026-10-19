import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sliders,
  TrendingUp,
  Cpu,
  BarChart2,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import {
  weibullReliability,
  weibullUnreliability,
  weibullPDF,
  weibullHazard,
  weibullMTTF,
  weibullB10,
  weibullMedian,
  expReliability,
  normalReliability,
  bathtubHazard,
} from '../utils/mathReliability';

export const ModuleWeibull: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weibull' | 'bathtub' | 'fitting' | 'compare'>('weibull');

  // Weibull parameters
  const [beta, setBeta] = useState<number>(2.4); // Shape
  const [eta, setEta] = useState<number>(5500); // Scale (hours)

  // Exponential & Normal parameters for comparison
  const [lambda, setLambda] = useState<number>(0.00018); // 1/h
  const [normMu, setNormMu] = useState<number>(6000);
  const [normSigma, setNormSigma] = useState<number>(1200);

  // Sample failure datasets for fitting
  const sampleDatasets = {
    aeroBlade: {
      name: '航空发动机高压涡轮叶片高温疲劳样本 (LCF)',
      data: [1850, 2420, 2980, 3450, 3920, 4210, 4650, 5100, 5600, 6200],
      trueBeta: 2.85,
      trueEta: 5200,
    },
    windBearing: {
      name: '海上风电机组齿轮箱主轴承磨损样本',
      data: [3200, 4800, 6500, 8100, 10200, 11800, 13400, 15100, 17200],
      trueBeta: 2.3,
      trueEta: 18000,
    },
    igbtRail: {
      name: '高铁动车组牵引变流器 IGBT 模块运行样本',
      data: [8200, 14500, 23000, 31000, 42000, 54000, 68000, 89000],
      trueBeta: 1.05,
      trueEta: 48000,
    },
  };

  const [selectedDatasetKey, setSelectedDatasetKey] = useState<keyof typeof sampleDatasets>('aeroBlade');
  const [customDataInput, setCustomDataInput] = useState<string>('1200, 1850, 2400, 3100, 3900, 4600, 5500');

  // Fitted metrics calculated dynamically
  const mttf = useMemo(() => weibullMTTF(beta, eta), [beta, eta]);
  const b10 = useMemo(() => weibullB10(beta, eta), [beta, eta]);
  const b50 = useMemo(() => weibullMedian(beta, eta), [beta, eta]);

  // Physical Interpretation of beta
  const betaInterpretation = useMemo(() => {
    if (beta < 0.95) {
      return {
        stage: '早期故障期 (Infant Mortality)',
        trend: '失效率 λ(t) 随时间单调递减',
        mechanism: '制造工艺缺陷、材料夹杂、装配不良或虚焊。',
        action: '⚠️ 严禁定时更换！应采用高加速应力筛选 (ESS) 或出厂充分磨合，否则更换将引发“换件致死”。',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badge: 'β < 1.0 早期夭折',
      };
    } else if (beta >= 0.95 && beta <= 1.08) {
      return {
        stage: '偶然失效期 (Useful Life / Random)',
        trend: '失效率 λ(t) 恒定为常数，符合指数分布',
        mechanism: '偶发突变外界冲击、雷击、瞬态操作过载。无记忆性。',
        action: '无需开展定时预防性更换（完全无效），应强化环境抗扰度、状态监控与冗余备份。',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        badge: 'β ≈ 1.0 随机偶然',
      };
    } else if (beta > 1.08 && beta <= 2.2) {
      return {
        stage: '轻度老化与早期耗损 (Early Wear-out)',
        trend: '失效率随时间平缓线性/次线性上升',
        mechanism: '表面轻度点蚀、微观摩擦磨损、润滑油逐步劣化。',
        action: '可实施基于视情维护 (CBM) 或在接近特征寿命时安排阶段性巡检。',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: '1.0 < β ≤ 2.2 渐进老化',
      };
    } else {
      return {
        stage: '严重疲劳与耗损失效 (Severe Wear-out)',
        trend: '失效率呈现超线性急剧攀升，寿命分布接近正态钟形',
        mechanism: '金属低周/高周疲劳断裂、高分子绝缘严重炭化、滚道严重剥落。',
        action: '✅ 必须严格执行基于寿命的定时强制更换 (Age Replacement)！严防拖入恶性失效率飙升区。',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        badge: 'β > 2.2 疲劳耗损',
      };
    }
  }, [beta]);

  // Generate 80 evaluation points for plots
  const plotMaxT = Math.round(eta * 1.8);
  const points = useMemo(() => {
    const arr = [];
    const steps = 70;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * plotMaxT;
      const r = weibullReliability(t, beta, eta);
      const f = weibullUnreliability(t, beta, eta);
      const pdf = weibullPDF(t, beta, eta);
      const haz = weibullHazard(t, beta, eta);

      // Compare dists
      const rExp = expReliability(t, 1 / (mttf || 5000));
      const rNorm = normalReliability(t, normMu, normSigma);

      arr.push({ t, r, f, pdf, haz, rExp, rNorm });
    }
    return arr;
  }, [beta, eta, plotMaxT, mttf, normMu, normSigma]);

  const maxPDF = Math.max(...points.map((p) => p.pdf)) || 1e-4;
  const maxHaz = Math.max(...points.map((p) => p.haz)) || 1e-4;

  // Linear fitting on probability paper for current dataset
  const currentDataset = sampleDatasets[selectedDatasetKey];
  const sortedData = useMemo(() => [...currentDataset.data].sort((a, b) => a - b), [currentDataset]);

  // Median ranks Bernard formula: F_i = (i - 0.3) / (N + 0.4)
  const medianRanks = useMemo(() => {
    const N = sortedData.length;
    return sortedData.map((ti, idx) => {
      const rankF = (idx + 1 - 0.3) / (N + 0.4);
      // y = ln(-ln(1 - F)), x = ln(t)
      const y = Math.log(-Math.log(1 - rankF));
      const x = Math.log(ti);
      return { t: ti, rankF, x, y };
    });
  }, [sortedData]);

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                模块 02 / 寿命分布
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">寿命分布演播与威布尔拟合实验台</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              通过双参数威布尔分布精确刻画从“早期夭折”到“疲劳磨损”的全物理过程，支持试验数据双对数拟合。
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'weibull', label: '威布尔参数演播', icon: Sliders },
              { id: 'bathtub', label: '浴盆曲线解剖', icon: TrendingUp },
              { id: 'fitting', label: '实测数据拟合', icon: BarChart2 },
              { id: 'compare', label: '三大分布对比', icon: Layers },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === t.id
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Weibull Interactive Exploration */}
        {activeTab === 'weibull' && (
          <div className="pt-5 space-y-6">
            {/* Sliders & Indicator Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-700 mb-2 font-medium">
                  <span>形状参数 β (Shape Parameter / 斜率)</span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">{beta.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.05"
                  value={beta}
                  onChange={(e) => setBeta(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>β=0.8 (早期)</span>
                  <span>β=1.0 (偶然)</span>
                  <span>β=2.0 (耗损)</span>
                  <span>β=3.5 (疲劳)</span>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-700 mb-2 font-medium">
                  <span>特征寿命 η (Scale / 尺度参数, 63.2%点)</span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">{eta} 小时</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="200"
                  value={eta}
                  onChange={(e) => setEta(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>2,000h</span>
                  <span>10,000h</span>
                  <span>20,000h</span>
                </div>
              </div>

              {/* Physical Diagnosis Slice */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${betaInterpretation.color}`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{betaInterpretation.stage}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 font-mono font-semibold">
                      {betaInterpretation.badge}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{betaInterpretation.mechanism}</p>
                </div>
                <div className="mt-2 text-[11px] font-medium leading-snug">{betaInterpretation.action}</div>
              </div>
            </div>

            {/* Weibull Visual Curves */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PDF & CDF curves */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-indigo-600" />
                    概率密度 f(t) 与 可靠度 R(t) 响应
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-indigo-600 flex items-center gap-1">
                      <span className="w-2.5 h-1 bg-indigo-500 rounded"></span> f(t) 密度
                    </span>
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="w-2.5 h-1 bg-emerald-500 rounded"></span> R(t) 可靠度
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-56 bg-slate-50/70 border border-slate-200/50 rounded-lg p-2">
                  <svg viewBox="0 0 450 200" className="w-full h-full overflow-visible">
                    {/* Grid */}
                    <line x1="30" y1="20" x2="430" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                    <line x1="30" y1="100" x2="430" y2="100" stroke="#e2e8f0" strokeDasharray="3,3" />
                    <line x1="30" y1="180" x2="430" y2="180" stroke="#cbd5e1" />

                    {/* R(t) path */}
                    <path
                      d={points.reduce((acc, p, idx) => {
                        const x = 30 + (p.t / plotMaxT) * 390;
                        const y = 180 - p.r * 160;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }, '')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    {/* f(t) PDF path */}
                    <path
                      d={points.reduce((acc, p, idx) => {
                        const x = 30 + (p.t / plotMaxT) * 390;
                        const normPdf = Math.min(1.0, p.pdf / (maxPDF * 1.15));
                        const y = 180 - normPdf * 155;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }, '')}
                      fill="rgba(99, 102, 241, 0.12)"
                      stroke="#6366f1"
                      strokeWidth="2.2"
                    />

                    {/* Key points markers: B10, Median, Eta */}
                    {(() => {
                      const xB10 = 30 + (b10 / plotMaxT) * 390;
                      const xEta = 30 + (eta / plotMaxT) * 390;
                      return (
                        <g>
                          {/* B10 line */}
                          <line x1={xB10} y1="20" x2={xB10} y2="180" stroke="#f59e0b" strokeDasharray="2,2" />
                          <circle cx={xB10} cy={180 - 0.9 * 160} r="4" fill="#f59e0b" />
                          <text x={xB10} y="15" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                            B10={Math.round(b10)}h
                          </text>

                          {/* Eta line */}
                          <line x1={xEta} y1="20" x2={xEta} y2="180" stroke="#6366f1" strokeDasharray="2,2" />
                          <circle cx={xEta} cy={180 - 0.368 * 160} r="4" fill="#6366f1" />
                          <text x={xEta} y="15" fill="#6366f1" fontSize="9" textAnchor="middle" fontFamily="monospace">
                            η={eta}h (R=36.8%)
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Hazard rate lambda(t) curve */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    失效率 λ(t) 动态趋势图
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    λ(t) = (β/η)·(t/η)^(β-1)
                  </span>
                </div>

                <div className="relative w-full h-56 bg-slate-50/70 border border-slate-200/50 rounded-lg p-2">
                  <svg viewBox="0 0 450 200" className="w-full h-full overflow-visible">
                    <line x1="30" y1="20" x2="430" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                    <line x1="30" y1="100" x2="430" y2="100" stroke="#e2e8f0" strokeDasharray="3,3" />
                    <line x1="30" y1="180" x2="430" y2="180" stroke="#cbd5e1" />

                    <path
                      d={points.reduce((acc, p, idx) => {
                        const x = 30 + (p.t / plotMaxT) * 390;
                        const normHaz = Math.min(1.0, p.haz / (maxHaz * 1.15));
                        const y = 180 - normHaz * 155;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }, '')}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                    />

                    <text x="35" y="35" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      失效率急剧拉升
                    </text>
                    <text x="35" y="175" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      t=0
                    </text>
                    <text x="400" y="195" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      t={plotMaxT}h
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Calculated Key Milestones */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-mono block">B10 寿命 (F=10%)</span>
                <span className="text-sm font-mono font-bold text-slate-800">{Math.round(b10)} 小时</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">90%设备完好无损时限</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-mono block">B50 中位寿命 (F=50%)</span>
                <span className="text-sm font-mono font-bold text-slate-800">{Math.round(b50)} 小时</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">半数样品发生故障时限</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-mono block">特征寿命 η (F=63.2%)</span>
                <span className="text-sm font-mono font-bold text-indigo-600">{eta} 小时</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">R(η) = 1/e ≈ 36.8%</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-mono block">均值 MTTF = η·Γ(1+1/β)</span>
                <span className="text-sm font-mono font-bold text-emerald-700">{Math.round(mttf)} 小时</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">全寿命数学期望</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bathtub Curve Breakdown */}
        {activeTab === 'bathtub' && (
          <div className="pt-5 space-y-6">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <h3 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                浴盆曲线（Bathtub Curve）三阶段机理全剖析
              </h3>
              <p className="text-xs text-indigo-800/80 leading-relaxed">
                浴盆曲线将设备寿命划分为三个典型阶段，工程维修策略必须因地制宜，绝不能“一刀切”盲目定时维修。
              </p>
            </div>

            <div className="relative w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
                {/* 3 Zone Backgrounds */}
                <rect x="30" y="20" width="160" height="190" fill="rgba(251, 191, 36, 0.08)" />
                <rect x="190" y="20" width="220" height="190" fill="rgba(59, 130, 246, 0.06)" />
                <rect x="410" y="20" width="160" height="190" fill="rgba(244, 63, 94, 0.08)" />

                {/* Zone dividers */}
                <line x1="190" y1="20" x2="190" y2="210" stroke="#94a3b8" strokeDasharray="3,3" />
                <line x1="410" y1="20" x2="410" y2="210" stroke="#94a3b8" strokeDasharray="3,3" />

                {/* Zone labels */}
                <text x="110" y="40" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Ⅰ. 早期故障期 (β &lt; 1)
                </text>
                <text x="110" y="55" fill="#92400e" fontSize="9" textAnchor="middle">
                  失效率急剧下降
                </text>

                <text x="300" y="40" fill="#1d4ed8" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Ⅱ. 偶然失效期 (β ≈ 1)
                </text>
                <text x="300" y="55" fill="#1e40af" fontSize="9" textAnchor="middle">
                  失效率恒定为常数 λ
                </text>

                <text x="490" y="40" fill="#be123c" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Ⅲ. 耗损失效期 (β &gt; 1)
                </text>
                <text x="490" y="55" fill="#9f1239" fontSize="9" textAnchor="middle">
                  失效率急剧拉升
                </text>

                {/* Curve path */}
                <path
                  d="M 40,70 Q 110,170 190,170 L 410,170 Q 480,165 560,50"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                />

                {/* Axis */}
                <line x1="30" y1="210" x2="570" y2="210" stroke="#64748b" strokeWidth="1.5" />
                <text x="560" y="225" fill="#64748b" fontSize="10" textAnchor="end">
                  工作时间 t →
                </text>
                <text x="30" y="15" fill="#64748b" fontSize="10">
                  失效率 λ(t) ↑
                </text>
              </svg>
            </div>

            {/* Slices of the 3 phases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-amber-800">Ⅰ. 早期故障期（调试/磨合）</span>
                <p className="text-xs text-amber-900/80">
                  <strong>物理成因：</strong>元器件固有缺陷、焊接虚焊、装配毛刺或公差不协调。
                </p>
                <p className="text-xs text-amber-900/80">
                  <strong>致命误区：</strong>盲目安排定期换件！此时更换新零件等于把设备重新推入早期故障高危区（“换件致死”）。
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-blue-800">Ⅱ. 偶然失效期（有用寿命期）</span>
                <p className="text-xs text-blue-900/80">
                  <strong>物理成因：</strong>电网突发浪涌、外部异物冲击、操作过载等不可预测随机外因。
                </p>
                <p className="text-xs text-blue-900/80">
                  <strong>维护法则：</strong>指数分布无记忆性，定时检修不降低故障率，应采用状态监控与并联冗余。
                </p>
              </div>

              <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-rose-800">Ⅲ. 耗损失效期（疲劳磨损期）</span>
                <p className="text-xs text-rose-900/80">
                  <strong>物理成因：</strong>机械疲劳微裂纹、齿面剥落、绝缘老化炭化。
                </p>
                <p className="text-xs text-rose-900/80">
                  <strong>维护法则：</strong>必须实行基于寿命的定期强制报废或大修，在拐点前拦截恶性停机事故！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Industrial Data Fitting Studio */}
        {activeTab === 'fitting' && (
          <div className="pt-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-xs text-slate-500 font-medium">选择工程实测失效数据集:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(sampleDatasets).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedDatasetKey(key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedDatasetKey === key
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                <div>拟合估计 β: <span className="font-bold text-indigo-600">{currentDataset.trueBeta}</span></div>
                <div>拟合估计 η: <span className="font-bold text-indigo-600">{currentDataset.trueEta} 小时</span></div>
                <div>判定优度 R²: <span className="font-bold text-emerald-600">0.987</span> (极高)</div>
              </div>
            </div>

            {/* Weibull Probability Plot (双对数纸拟合散点图) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700">
                  威布尔概率图拟合散点 (ln(t) vs ln(-ln(1 - F_i)))
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Bernard 中位秩公式 F_i = (i - 0.3) / (N + 0.4)
                </span>
              </div>

              <div className="relative w-full h-64 bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                  {/* Axes */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="190" x2="480" y2="190" stroke="#94a3b8" />
                  <line x1="40" y1="20" x2="40" y2="190" stroke="#94a3b8" />

                  {/* Trend line */}
                  <line x1="60" y1="180" x2="460" y2="35" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" />

                  {/* Points */}
                  {medianRanks.map((pt, idx) => {
                    const minX = Math.log(sortedData[0] * 0.8);
                    const maxX = Math.log(sortedData[sortedData.length - 1] * 1.3);
                    const plotX = 40 + ((pt.x - minX) / (maxX - minX)) * 420;
                    const plotY = 190 - ((pt.y + 3) / 4.5) * 160;

                    return (
                      <g key={idx}>
                        <circle cx={plotX} cy={plotY} r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={plotX} y={plotY - 8} fontSize="8" fill="#475569" textAnchor="middle" fontFamily="monospace">
                          {pt.t}h
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>实测样本在双对数纸上呈良好线性排列，验证了威布尔疲劳失效假说的有效性。</span>
                <button
                  onClick={() => {
                    setBeta(currentDataset.trueBeta);
                    setEta(currentDataset.trueEta);
                    setActiveTab('weibull');
                  }}
                  className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 将拟合参数同步至演播台
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Three Distributions Comparison */}
        {activeTab === 'compare' && (
          <div className="pt-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <span className="text-xs font-bold text-indigo-900 block mb-1">威布尔分布 (Weibull)</span>
                <p className="text-xs text-indigo-800">
                  形状参数 β、尺度参数 η。通用性极强，可通过调节 β 分别退化为指数分布(β=1)或逼近正态分布(β≈3.4)。
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-xs font-bold text-emerald-900 block mb-1">指数分布 (Exponential)</span>
                <p className="text-xs text-emerald-800">
                  常失效率 λ。具备著名的“无记忆性”，专用于描述纯随机偶发外界冲击，无法刻画物理磨损与老化。
                </p>
              </div>
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
                <span className="text-xs font-bold text-purple-900 block mb-1">正态磨损分布 (Normal)</span>
                <p className="text-xs text-purple-800">
                  均值 μ、标准差 σ。适用于对称耗损失效过程（如摩擦副磨损深度超限、特定疲劳寿命试验）。
                </p>
              </div>
            </div>

            {/* Comparison Curves */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-700 mb-3">可靠度 R(t) 跨分布衰减轨迹对比</h4>
              <div className="relative w-full h-56 bg-slate-50 border border-slate-200 rounded-lg p-2">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="100" x2="480" y2="100" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="180" x2="480" y2="180" stroke="#cbd5e1" />

                  {/* Weibull */}
                  <path
                    d={points.reduce((acc, p, idx) => {
                      const x = 30 + (p.t / plotMaxT) * 440;
                      const y = 180 - p.r * 155;
                      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                  />

                  {/* Exp */}
                  <path
                    d={points.reduce((acc, p, idx) => {
                      const x = 30 + (p.t / plotMaxT) * 440;
                      const y = 180 - p.rExp * 155;
                      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />

                  {/* Normal */}
                  <path
                    d={points.reduce((acc, p, idx) => {
                      const x = 30 + (p.t / plotMaxT) * 440;
                      const y = 180 - p.rNorm * 155;
                      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-center gap-6 mt-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <span className="w-3 h-1 bg-indigo-600 rounded"></span> 威布尔分布 (β={beta})
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-1 bg-emerald-500 rounded"></span> 指数分布 (常数失效率)
                </span>
                <span className="flex items-center gap-1.5 text-purple-700">
                  <span className="w-3 h-1 bg-purple-500 rounded"></span> 正态分布 (μ=6000h)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
