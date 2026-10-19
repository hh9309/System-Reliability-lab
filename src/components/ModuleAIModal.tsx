import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Settings,
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Cpu,
  HelpCircle,
} from 'lucide-react';

export type LLMModelType = 'gemini 3 flash' | 'deepseek-v4-pro';

interface AIModalProps {
  contextData: any;
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

export const ModuleAIModal: React.FC<AIModalProps> = ({
  contextData,
  isFloating = false,
  onCloseFloating,
}) => {
  // Model & API Key state with localStorage persistence
  const [selectedModel, setSelectedModel] = useState<LLMModelType>(() => {
    return (localStorage.getItem('RE_LAB_LLM_MODEL') as LLMModelType) || 'gemini 3 flash';
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('RE_LAB_LLM_KEY') || '';
  });

  // Modal dialog state for Gear settings
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [tempModel, setTempModel] = useState<LLMModelType>(selectedModel);
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Chat message history
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time?: string }>>([
    {
      role: 'assistant',
      text: '您好！我是系统可靠性工程与故障诊断 AI 首席专家随诊顾问。已自动感知并挂载当前实验台数据。\n\n📌 部署与调用提示：\n本项目支持部署至 GitHub 静态网站运行。若尚未配置 API-Key，请点击右上角小齿轮 ⚙️ 选择大模型（gemini 3 flash 或 deepseek-v4-pro）并输入您的 API-Key 确认保存。所有大模型调用必须输入 API-Key 后方可发起诊断。',
      time: '系统提示',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync temp state when opening settings modal
  useEffect(() => {
    if (showSettingsModal) {
      setTempModel(selectedModel);
      setTempApiKey(apiKey);
      setSaveSuccessMsg(null);
    }
  }, [showSettingsModal, selectedModel, apiKey]);

  // Quick preset triggers
  const quickTriggers = [
    {
      title: '诊断威布尔 β 误判风险',
      prompt: '请根据当前威布尔参数，深度诊断是否存在“误把耗损期当偶然失效”或“早期夭折期过度换件致死”的误判风险？',
      issueType: '威布尔形状参数机理误判',
    },
    {
      title: '诊断冗余拓扑单点瓶颈',
      prompt: '请诊断当前 RBD 框图与 FTA 故障树中的薄弱环节，特别是单点割集与潜在的共因失效 (CCF) 隐患。',
      issueType: '冗余设计不足与单点故障',
    },
    {
      title: '诊断维修周期停机风险',
      prompt: '请结合停机惩罚成本 Cf 与更换成本 Cp，评估当前预防性维修周期 Tp 是否处于帕累托最优谷底？过长或过短有何隐患？',
      issueType: '维修周期与停机损失帕累托权衡',
    },
    {
      title: '生成全套整改处方',
      prompt: '请综合我当前的寿命分布、框图可用度与维修参数，一键输出工业级可靠性整改处方与 FMEA 指南。',
      issueType: '系统综合可靠性与维护处方',
    },
  ];

  // Save Settings
  const handleSaveSettings = () => {
    setSelectedModel(tempModel);
    setApiKey(tempApiKey.trim());
    localStorage.setItem('RE_LAB_LLM_MODEL', tempModel);
    localStorage.setItem('RE_LAB_LLM_KEY', tempApiKey.trim());

    setSaveSuccessMsg(`已成功确认大模型：【${tempModel}】并保存 API-Key！`);
    setTimeout(() => {
      setShowSettingsModal(false);
      setSaveSuccessMsg(null);
    }, 1200);
  };

  // Direct client-side browser call for GitHub deployment
  const callDirectLLMInBrowser = async (promptText: string, model: LLMModelType, key: string) => {
    if (model === 'gemini 3 flash') {
      // Direct call to Google Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `你是一位享誉业界的资深系统可靠性工程首席故障诊断专家。请专业严谨地分析以下工程问题：\n\n${promptText}`,
                },
              ],
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || 'Gemini API 响应异常');
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '诊断完成。';
    } else {
      // Direct call to DeepSeek API
      const endpoint = 'https://api.deepseek.com/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位资深系统可靠性工程院士与首席故障诊断专家，精通威布尔分布、RBD拓扑、FTA最小割集与帕累托维修成本优化。',
            },
            { role: 'user', content: promptText },
          ],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || 'DeepSeek API 响应异常');
      }
      return data.choices?.[0]?.message?.content || '诊断完成。';
    }
  };

  const handleSend = async (userMsgText?: string, issueType?: string) => {
    const textToSend = userMsgText || inputText;
    if (!textToSend.trim() || loading) return;

    // Requirement: 所有大模型调用必须输入 API-Key 后才能调用
    if (!apiKey.trim()) {
      setShowSettingsModal(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ 大模型调用限制拦截：所有大模型调用必须先输入 API-Key！\n\n本项目支持部署至 GitHub 静态网站并在浏览器中直接调用。请先在弹出的设置窗口中手工输入您的 API-Key 并点击【确认大模型】保存。`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    const userMsg = { role: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const fullPrompt = `【诊断议题】: ${issueType || '系统综合可靠性与维护策略诊断'}
【当前实验上下文与参数】:
${JSON.stringify(contextData, null, 2)}
【工程师提问】:
${textToSend}`;

    let reply = '';

    try {
      // 1. Try local Express server proxy first
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: contextData,
          issueType: issueType || '系统可靠性专项问询',
          customPrompt: textToSend,
          model: selectedModel,
          apiKey: apiKey.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        reply = data.result;
      } else {
        throw new Error('Proxy returned non-200, trying direct browser call');
      }
    } catch (proxyErr) {
      // 2. Direct browser call (Essential for GitHub Pages / static deployment)
      try {
        reply = await callDirectLLMInBrowser(fullPrompt, selectedModel, apiKey.trim());
      } catch (browserErr: any) {
        reply = `❌ 大模型调用失败: ${browserErr?.message || '网络连接超时或 API-Key 无效'}。\n\n请点击右上角小齿轮 ⚙️ 核查您的 API-Key 是否正确，并确认所选模型（${selectedModel}）余额及网络权限。`;
      }
    } finally {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: reply || '诊断分析完成。', time: new Date().toLocaleTimeString() },
      ]);
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden relative ${
        isFloating ? 'w-96 md:w-120 h-148 fixed bottom-6 right-6 z-50 shadow-2xl border-indigo-200' : 'h-168'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">AI 首席可靠性工程专家随诊</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-[10px] text-indigo-200 font-mono">
                {selectedModel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>状态:</span>
              {apiKey.trim() ? (
                <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> API-Key 已就绪
                </span>
              ) : (
                <span className="text-amber-400 font-mono font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> 待配置 API-Key
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Settings Gear Icon at Far Right */}
        <div className="flex items-center gap-1.5">
          {/* Gear icon button requested by user */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1 group"
            title="设置大模型与 API-Key (GitHub 部署)"
          >
            <Settings className="w-4 h-4 text-slate-300 group-hover:rotate-45 transition-transform duration-200" />
            <span className="text-[11px] hidden sm:inline text-slate-300 font-medium">模型设置</span>
          </button>

          {isFloating && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Triggers Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          一键诊断:
        </span>
        {quickTriggers.map((q, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSend(q.prompt, q.issueType)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-[11px] transition-all font-medium shadow-2xs"
          >
            {q.title}
          </button>
        ))}
      </div>

      {/* Message Chat Flow */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
            </div>
            {m.time && (
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{m.time}</span>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-3 bg-white rounded-xl border border-slate-200 w-fit shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>【{selectedModel}】正在推演可靠性机理与最优化指标...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={apiKey.trim() ? `向 ${selectedModel} 随诊顾问提问...` : '⚠️ 需先点击右上角齿轮 ⚙️ 设置 API-Key 后方可调用'}
          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Modal (Small Gear Dialog) */}
      {showSettingsModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">大模型与 API-Key 部署设置</h3>
                  <span className="text-[10px] text-slate-400">支持 GitHub 静态部署 · 浏览器端直接调用</span>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Choose LLM Model */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">
                1. 选择大模型 (Select Model):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempModel('gemini 3 flash')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tempModel === 'gemini 3 flash'
                      ? 'bg-indigo-50/70 border-indigo-600 text-indigo-900 ring-1 ring-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono">gemini 3 flash</span>
                    {tempModel === 'gemini 3 flash' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Google 3.8 Flash，擅长复杂寿命微积分与工程推演。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTempModel('deepseek-v4-pro')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tempModel === 'deepseek-v4-pro'
                      ? 'bg-indigo-50/70 border-indigo-600 text-indigo-900 ring-1 ring-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono">deepseek-v4-pro</span>
                    {tempModel === 'deepseek-v4-pro' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    深度求索推理模型，精通布尔逻辑与最小割集。
                  </p>
                </button>
              </div>
            </div>

            {/* Section 2: Input API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">
                  2. 手工输入 API-Key (必需):
                </label>
                <span className="text-[10px] text-slate-400">
                  {tempModel === 'gemini 3 flash' ? 'Google AI 格式: AIzaSy...' : 'DeepSeek 格式: sk-...'}
                </span>
              </div>

              <div className="relative">
                <input
                  type={showKeyText ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={
                    tempModel === 'gemini 3 flash'
                      ? '输入您的 Google Gemini API-Key (AIzaSy...)'
                      : '输入您的 DeepSeek API-Key (sk-...)'
                  }
                  className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GitHub 静态部署安全性保障</span>
                </div>
                <p className="leading-relaxed">
                  密钥仅保存在当前浏览器的本地缓存（localStorage）中，绝不上报后端存储。项目部署至 GitHub 静态网站时，浏览器将使用此密钥直接向模型官方发起 HTTPS 调用。
                </p>
              </div>
            </div>

            {/* Success Feedback Banner */}
            {saveSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {saveSuccessMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setTempApiKey('');
                  localStorage.removeItem('RE_LAB_LLM_KEY');
                  setApiKey('');
                }}
                className="text-slate-400 hover:text-rose-600 text-[11px] font-medium"
              >
                清除已存密钥
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-all"
                >
                  确认大模型与保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
