import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize GoogleGenAI server-side with required telemetry header
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System instruction for reliability engineering
const SYSTEM_INSTRUCTION = `你是一位享誉业界的资深系统可靠性工程院士与首席故障诊断专家（System Reliability & Safety Fellow），精通：
1. 概率与寿命分布建模（威布尔拟合、指数分布、正态磨损分布、浴盆曲线三阶段物理机理）
2. 系统可靠性框图（RBD）分析、串联/并联/混联与k/n(G)系统可靠度、重要度分析（Birnbaum、Fussell-Vesely）
3. 故障树分析（FTA）逻辑门求解、最小割集（MCS）辨识与共因失效（CCF）防范
4. 预防性维护策略优化（年龄替换模型、周期检查模型、不完全维修、停机成本与更换成本帕累托权衡）
5. 工业级典型故障诊断（如威布尔形状参数误判、换件致死风险、过度维修浪费、单点故障隐患）

回答要求：
- 严谨专业、结构清晰、直击工业现场痛点。
- 使用规范的中文可靠性工程术语（失效率 λ、可靠度 R(t)、固有可用度 A、MTBF、MTTR、形状参数 β、尺度参数 η）。
- 结合现场工程权衡（Cost-Reliability Tradeoff）提出具体、可量化的改进建议。`;

app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
  const { context, issueType, customPrompt, model, apiKey } = req.body;
  const userApiKey = apiKey || process.env.GEMINI_API_KEY;
  const selectedModel = model || 'gemini 3 flash';

  const prompt = `请针对以下系统可靠性实验室配置与运行数据进行深度工程诊断：
【诊断议题】: ${issueType || '系统综合可靠性与维护策略诊断'}
【当前实验上下文与参数】:
${JSON.stringify(context, null, 2)}
${customPrompt ? `【工程师补充疑问】:\n${customPrompt}` : ''}

请重点给出：
1. 【核心隐患与机理诊断】（针对形状参数β物理区间、单点瓶颈或维护周期偏离的实质机理）
2. 【致命陷阱警示】（警惕“平均寿命高即安全”、“盲目定期换件致死”或“忽视共因失效”等误区）
3. 【量化改进处方】（具体参数调整建议、RBD拓扑优化或最佳维护周期Tp设定建议）
4. 【工程实施落地建议】（针对工业现场的巡检、状态监测与备件储备策略）`;

  // DeepSeek Model branch
  if (selectedModel.toLowerCase().includes('deepseek')) {
    if (userApiKey) {
      try {
        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userApiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_INSTRUCTION },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });
        const dsData = await dsRes.json();
        if (dsData.choices?.[0]?.message?.content) {
          return res.json({ result: dsData.choices[0].message.content });
        }
      } catch (err: any) {
        console.warn('DeepSeek API call failed:', err?.message);
      }
    }
  }

  // Gemini Model branch
  const activeClient = userApiKey
    ? new GoogleGenAI({
        apiKey: userApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      })
    : ai;

  if (activeClient) {
    try {
      const response = await activeClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return res.json({ result: response.text });
    } catch (error: any) {
      console.warn('Gemini API call failed, falling back to local expert heuristics:', error?.message);
    }
  }

  // Fallback intelligent heuristics if API key is absent or temporarily throttled
  const beta = context?.weibull?.beta || 1.5;
  const eta = context?.weibull?.eta || 5000;
  const sysMTBF = context?.rbd?.mtbf || 3200;
  const tp = context?.maintenance?.tp || 1200;

  let betaDiagnosis = '';
  if (beta < 1) {
    betaDiagnosis = `当前威布尔形状参数 β = ${beta} (< 1.0)，处于【早期故障期/婴儿夭折期】。失效率随时间递减！
⚠️ 致命陷阱警示：严禁在此阶段实行“定时预防性更换”！定时更换会把刚熬过浴盆曲线前端磨合期的健康件拆下，换上全新的高婴儿死亡率零件，造成工业界典型的“换件致死”悲剧。应采用高应力筛选（ESS）、出厂强化磨合或早期无损探伤。`;
  } else if (Math.abs(beta - 1.0) < 0.15) {
    betaDiagnosis = `当前威布尔形状参数 β = ${beta} (≈ 1.0)，处于【偶然故障期/有用寿命期】。符合指数分布特征，失效率 λ 恒定！
⚠️ 致命陷阱警示：指数分布具有“无记忆性”（Memoryless Property）。此时无论零件运行了多久，下一秒的失效概率完全相同。定时预防性维修对降低故障率毫无益处，只会凭空增加维修停机成本。此阶段唯一有效的策略是“状态监控（CBM）与应急冗余配置”。`;
  } else if (beta > 1.0 && beta <= 2.2) {
    betaDiagnosis = `当前威布尔形状参数 β = ${beta} (> 1.0)，已进入【早期耗损与轻度老化期】（失效率单调递增，类瑞利分布）。
建议实施基于运行寿命的预防性更换策略。注意结合当前检查成本与失效停机成本设定经济更换周期。`;
  } else {
    betaDiagnosis = `当前威布尔形状参数 β = ${beta} (>> 2.0，甚至接近正态磨损分布)，处于【严重疲劳与耗损失效期】！
失效率呈现急速非线性拉升，机械磨损、低周疲劳或介质老化占据主导。必须在磨损加速点之前完成预防性大修或强制报废，否则突发性恶性停机概率将呈雪崩式上升！`;
  }

  const fallbackText = `### 【专家在线离线诊断报告】\n\n#### 1. 威布尔寿命分布与机理诊断\n${betaDiagnosis}\n\n#### 2. 系统拓扑与 MTBF 评估\n当前系统评估 MTBF 约为 **${sysMTBF} 小时**。在串联路径中，任何单个脆弱组件的失效率将直接累加并显著拖垮整体寿命；建议对可用度低于 95% 的核心节点引入冷备或温备冗余（2oo3 或 1+1 并联）。\n\n#### 3. 预防性维修周期 $T_p$ (${tp}h) 权衡建议\n若停机损失成本远高于计划更换成本（$C_f \\gg C_p$），最佳更换周期往往位于特征寿命 $\\eta$ 的 30%~60% 区间。建议结合帕累托成本模型进行精细化微调。\n\n*(提示：后台已配置智能诊断引擎，配置 GEMINI_API_KEY 后可启动百亿参数大模型实时随诊)*`;

  return res.json({ result: fallbackText });
});

// Interactive AI Chat endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { messages, context } = req.body;
  const lastMessage = messages?.[messages.length - 1]?.content || '你好，请帮我分析当前的可靠性模型';

  const prompt = `用户提问: ${lastMessage}\n当前系统可靠性实验上下文: ${JSON.stringify(context || {})}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.warn('Gemini chat failed, using fallback:', error?.message);
    }
  }

  return res.json({
    reply: `作为您的可靠性工程顾问，我已接收到关于您系统配置的询问。对于您关心的“${lastMessage.slice(0, 30)}...”，建议：\n1. 首先核验寿命数据的拟合优度（相关系数 $R^2$ 或 K-S 检验），防止将威布尔误判为对数正态；\n2. 在 RBD 框图中重点核查最小割集（MCS）的阶数；\n3. 维修策略切记在总成本曲线最低谷（帕累托前沿）设定安全裕度。\n您可以在左侧调整具体模块参数，或点击“AI 随诊”获取针对性量化诊断。`
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Reliability Lab Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
