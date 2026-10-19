import React from 'react';
import {
  Activity,
  Sliders,
  GitCommit,
  GitFork,
  Briefcase,
  Terminal,
  Bot,
  Workflow,
  FileText,
  Layers,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { INDUSTRIAL_CASES } from '../data/industrialCases';

export type ModuleKey =
  | 'algebra'
  | 'weibull'
  | 'rbd'
  | 'fta'
  | 'cases'
  | 'code'
  | 'ai'
  | 'workflow'
  | 'export'
  | 'slices';

interface NavbarProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  onToggleFloatingAI: () => void;
  isFloatingAIOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  selectedCaseId,
  onSelectCase,
  onToggleFloatingAI,
  isFloatingAIOpen,
}) => {
  const navItems = [
    { id: 'algebra' as ModuleKey, label: '1. 可靠代数', icon: Activity },
    { id: 'weibull' as ModuleKey, label: '2. 寿命分布', icon: Sliders },
    { id: 'rbd' as ModuleKey, label: '3. 结构框图', icon: GitCommit },
    { id: 'fta' as ModuleKey, label: '4. 故障树FTA', icon: GitFork },
    { id: 'cases' as ModuleKey, label: '5. 六大案例', icon: Briefcase },
    { id: 'code' as ModuleKey, label: '6. 代码引擎', icon: Terminal },
    { id: 'ai' as ModuleKey, label: '7. AI对话窗口', icon: Bot },
    { id: 'workflow' as ModuleKey, label: '8. 全流程导引', icon: Workflow },
    { id: 'export' as ModuleKey, label: '9. 报告导出', icon: FileText },
    { id: 'slices' as ModuleKey, label: '10. 可靠要素', icon: Layers },
  ];

  const currentCase = INDUSTRIAL_CASES.find((c) => c.id === selectedCaseId) || INDUSTRIAL_CASES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top Identity & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                系统可靠性实验室
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                “10大”核心模块专业版
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              故障分布 · 可靠性框图 (RBD) · 故障树 (FTA) · 帕累托维修优化
            </p>
          </div>
        </div>

        {/* Global Case Switcher & Floating AI Doctor Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">快速载入实战案例:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-transparent font-medium text-slate-800 cursor-pointer focus:outline-none"
            >
              {INDUSTRIAL_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onToggleFloatingAI}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              isFloatingAIOpen
                ? 'bg-indigo-700 text-white ring-2 ring-indigo-400'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFloatingAIOpen ? '收起 AI 随诊' : '唤起 AI 随诊'}</span>
          </button>
        </div>
      </div>

      {/* 10 Core Modules Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
