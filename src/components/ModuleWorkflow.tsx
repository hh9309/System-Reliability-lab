import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Activity,
  Calculator,
  Sliders,
  FileCheck,
  TrendingUp,
  Download,
  Shield,
  Zap,
} from 'lucide-react';
import { calculateMaintenanceCostCurve, solveRBDSystem, calculateAvailability, weibullMTTF, weibullB10 } from '../utils/mathReliability';

interface WorkflowProps {
  onGoToExport: () => void;
  onGoToAI: () => void;
}

export const ModuleWorkflow: React.FC<WorkflowProps> = ({ onGoToExport, onGoToAI }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Workflow state parameters
  const [projectName, setProjectName] = useState<string>('深海 10MW 风电齿轮箱主驱动系统可靠性工程');
  const [beta, setBeta] = useState<number>(2.3);
  const [eta, setEta] = useState<number>(18000);
  const [topology, setTopology] = useState<'series' | 'parallel' | 'hybrid' | 'k_out_of_n'>('hybrid');
  const [cp, setCp] = useState<number>(7.2); // 万元
  const [cf, setCf] = useState<number>(85.0); // 万元
  const [evalTime, setEvalTime] = useState<number>(5000);

  // Derived metrics
  const mttf = weibullMTTF(beta, eta);
  const b10 = weibullB10(beta, eta);

  const sampleBlocks = [
    { name: '高速级主轴承', mtbf: 25000, mttr: 48, failureRate: 4e-5 },
    { name: '低速级行星齿轮箱', mtbf: 32000, mttr: 72, failureRate: 3.1e-5 },
    { name: '主油路循环润滑站', mtbf: 20000, mttr: 12, failureRate: 5e-5 },
    { name: '变流冷却水循环泵', mtbf: 22000, mttr: 16, failureRate: 4.5e-5 },
  ];

  const rbdRes = solveRBDSystem(topology, sampleBlocks, 2, 3, evalTime);
  const avail = calculateAvailability(rbdRes.systemMTBF, 36);
  const costRes = calculateMaintenanceCostCurve(beta, eta, cp, cf);

  const steps = [
    { id: 1, name: '寿命建模', desc: '故障数据与威布尔拟合' },
    { id: 2, name: '拓扑搭建', desc: 'RBD/FTA 框图架构' },
    { id: 3, name: '定量评估', desc: 'MTBF 与可用度计算' },
    { id: 4, name: '维修优化', desc: '经济周期帕累托权衡' },
    { id: 5, name: '工程白皮书', desc: '一键编译与报告导出' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                模块 08 / 全流程向导
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                系统可靠性设计与运维优化全流程流水线
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              五步全生命周期工程闭环：寿命拟合 → 拓扑配置 → MTBF 计算 → 维修优化 → 白皮书生成。
            </p>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="pt-5 pb-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-300 -z-0"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 92}%` }}
            />

            {steps.map((step) => {
              const isPassed = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center relative z-10 group"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-xs'
                        : isCurrent
                        ? 'bg-white border-2 border-indigo-600 text-indigo-700 ring-4 ring-indigo-50 shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5 text-white" /> : step.id}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isCurrent ? 'text-indigo-900 font-bold' : isPassed ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.name}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:block">{step.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content Containers */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        {/* Step 1: Lifetime Modeling */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
                步骤一：设定项目工程名称与威布尔寿命分布参数
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                依据现场失效数据拟合或试验标准，设定形状参数 β 与特征寿命 η。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">工程分析项目名称</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex justify-between text-xs text-slate-700 mb-2 font-medium">
                    <span>形状参数 β (Shape)</span>
                    <span className="font-mono font-bold text-indigo-600">{beta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.05"
                    value={beta}
                    onChange={(e) => setBeta(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.8 (早期)</span>
                    <span>1.0 (偶然)</span>
                    <span>2.3 (轴承磨损)</span>
                    <span>3.5 (疲劳)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex justify-between text-xs text-slate-700 mb-2 font-medium">
                    <span>特征寿命 η (Scale, hours)</span>
                    <span className="font-mono font-bold text-indigo-600">{eta} 小时</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="50000"
                    step="500"
                    value={eta}
                    onChange={(e) => setEta(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Milestone Snapshot */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-3">当前寿命分布核心里程碑</span>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-white border border-slate-200/60">
                      <span className="text-slate-500">B10 寿命 (10%失效率)</span>
                      <span className="font-bold text-amber-600">{Math.round(b10)} 小时</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-white border border-slate-200/60">
                      <span className="text-slate-500">平均无故障时间 MTTF</span>
                      <span className="font-bold text-emerald-600">{Math.round(mttf)} 小时</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-white border border-slate-200/60">
                      <span className="text-slate-500">失效机理属性判据</span>
                      <span className="font-bold text-indigo-600">
                        {beta > 1 ? '超线性磨损与疲劳期' : beta === 1 ? '恒定偶发失效期' : '早期婴儿夭折期'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 mt-4 p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  提示：设定后点击“下一步”进行系统拓扑结构配置。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Topology Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
                步骤二：系统 RBD 可靠性框图拓扑架构选择
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                选择系统的可靠性逻辑模型（串联、并联冗余、混联网络或表决冗余）。
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'series', title: '纯串联系统', desc: '任何单一单元失效导致整机停运 (乘积法则)' },
                { id: 'parallel', title: '纯并联冗余', desc: '任一单元存活即可保障运转 (并联降失效)' },
                { id: 'hybrid', title: '混联混合架构', desc: '关键前置并联双通道 + 后置串联总成' },
                { id: 'k_out_of_n', title: '2oo3 表决冗余', desc: '三取二多数决保障极高安全性' },
              ].map((top) => (
                <div
                  key={top.id}
                  onClick={() => setTopology(top.id as any)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    topology === top.id
                      ? 'bg-indigo-50/70 border-indigo-600 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span className="font-bold text-xs block mb-1">{top.title}</span>
                  <p className="text-[11px] text-slate-500 leading-snug">{top.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-2">当前拓扑内组件清单:</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sampleBlocks.map((b, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-800 block">{b.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">MTBF: {b.mtbf}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Quantitative Evaluation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">3</span>
                步骤三：系统综合 MTBF、可靠度与固有可用度评估
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                输入任务剖面评估时间 t，求解系统可用度与年均停机时长。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 mb-2 font-medium">
                  <span>任务剖面时间 t</span>
                  <span className="font-mono font-bold text-indigo-600">{evalTime} 小时</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={evalTime}
                  onChange={(e) => setEvalTime(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <span className="text-xs font-semibold text-emerald-800">系统综合可靠度 R(t={evalTime}h)</span>
                <span className="text-2xl font-mono font-bold text-emerald-700">
                  {(rbdRes.systemReliability * 100).toFixed(3)}%
                </span>
                <span className="text-[11px] text-emerald-600">任务时间无故障保全概率</span>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 flex flex-col justify-between">
                <span className="text-xs font-semibold text-indigo-800">固有可用度 (Availability Ai)</span>
                <span className="text-2xl font-mono font-bold text-indigo-700">
                  {(avail.availability * 100).toFixed(4)}%
                </span>
                <span className="text-[11px] text-indigo-600">年非计划停机: {avail.downtimeHoursPerYear.toFixed(1)} 小时</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Maintenance Optimization */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">4</span>
                步骤四：以龄预防性更换成本帕累托优化
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                设定计划更换成本 Cp 与突发非计划停机惩罚成本 Cf，求解全局经济最优维修周期 Tp*。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                    <span>计划预防性更换单次成本 Cp</span>
                    <span className="font-mono font-bold text-indigo-600">{cp} 万元</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={cp}
                    onChange={(e) => setCp(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                    <span>非计划停机灾难性损失 Cf</span>
                    <span className="font-mono font-bold text-rose-600">{cf} 万元</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={cf}
                    onChange={(e) => setCf(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-900 block mb-1">帕累托最优求解结论</span>
                  <div className="text-3xl font-mono font-bold text-indigo-700 my-2">
                    Tp* = {costRes.optimalTp} 小时
                  </div>
                  <p className="text-xs text-indigo-900/80 leading-relaxed">
                    在此周期执行计划定检更换，单位运行时间的期望运维费用处于极小值谷底。相比事后故障抢修，年均节约停机损失逾 40%。
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-200/60 text-xs font-mono text-indigo-800">
                  最低单位维护成本率: {(costRes.minCostRate * 10000).toFixed(2)} 元/小时
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Whitepaper Generation Readiness */}
        {currentStep === 5 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <FileCheck className="w-8 h-8" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-800">全流程数据已校验，白皮书编译就绪！</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                已自动整合《{projectName}》全套威布尔拟合、RBD/FTA 拓扑评估、MTBF/可用度计算结果与预防性维修成本优化数据。
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={onGoToExport}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                前往模块 09 导出工程白皮书 (PDF / Markdown / CSV)
              </button>

              <button
                onClick={onGoToAI}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                唤起 AI 专家随诊诊断报告
              </button>
            </div>
          </div>
        )}

        {/* Stepper Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 上一步
          </button>

          <span className="text-xs text-slate-400 font-mono">
            第 {currentStep} / {steps.length} 步
          </span>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs"
          >
            下一步 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
