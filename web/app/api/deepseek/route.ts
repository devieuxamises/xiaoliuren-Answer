import { NextRequest, NextResponse } from "next/server";
import { TRAINING_GUIDANCE, TRAINING_GUIDANCE_VERSION } from "../../training-guidance";

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-deepseek-key")?.trim();
  if (!key || key.length < 20) return NextResponse.json({ error: "请先配置有效的 DeepSeek API Key" }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 }); }
  const payload = JSON.stringify(input);
  if (payload.length > 32000) return NextResponse.json({ error: "本次卦象数据过长" }, { status: 413 });
  const system = `你是“小六壬数研”的语境解读器。离线引擎已经完成排盘并锁定核心方向，你负责把系统词条重写成一段真正回答用户问题、自然有温度又不失严谨的完整解读。你的文字会替换界面里的通用表述，因此不要写成一份单独的“AI 答案”，也不要出现“补充说明、AI 认为、根据模型、综上所述、整体而言”这类元话语。

${TRAINING_GUIDANCE}

输出任务（只返回一个 JSON 对象）：
1. coreTendency 必须逐字复制 offlineAnalysis.tendency；coreVerdict 必须逐字复制 offlineAnalysis.verdict。这两个字段只用于一致性校验，不要出现在正文里。
2. direct：用自然、第一人称的判断口吻直接回答用户的问题。第一句就给结论（能不能、会不会、偏盈偏亏、能不能成），不要再贴“本卦结论：”这样的标签。随后用 2~4 句话，结合 question 与 optionalContext，把“天宫起因 → 地宫过程 → 人宫结果 → 时辰趋势”这条因果链讲清楚，解释为什么是这个结论。120~280 字。必要时才点出宫名，不要为了显得专业而罗列。
3. factorRewrites：数量和顺序必须与 factors 一致。保留每项原数据与影响方向，把 inference 改写成落到“用户这件具体事”上的一句话；背景项就诚实说明它只作背景，不硬套成主因。
4. adviceRewrites：数量和顺序必须与 advice 一致。basis 不由你改；只重写 conclusion 与 action。每条 action 都要具体、可执行、可验证，直接针对用户的问题对象，删掉与本题无关的万能词（合同、渠道、合作、里程碑等，除非本题确实涉及）。
5. verify：给出适用于本问题的现实验证指标或观察窗口，用“如果……就说明……”的条件式表述；不得把应期写成必然日期。
6. contextUsed：用一句话说明你采用了哪些用户已提供的现实背景；未提供则写“未提供额外背景”。
只返回 JSON，不要 Markdown，不要代码块围栏。格式：{"coreTendency":"","coreVerdict":"","direct":"","factorRewrites":[""],"adviceRewrites":[{"conclusion":"","action":""}],"verify":"","contextUsed":""}`;
  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: "deepseek-chat", temperature: 0.55, max_tokens: 2200, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: `请按训练规范完成一体化语境改写。规则版本：${TRAINING_GUIDANCE_VERSION}\n${payload}` }] }) });
    const data: any = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return NextResponse.json({ error: data?.error?.message || `DeepSeek 接口错误（${upstream.status}）` }, { status: upstream.status });
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) return NextResponse.json({ error: "DeepSeek 未返回有效内容" }, { status: 502 });
    let enhancement: any;
    try { enhancement = JSON.parse(answer); } catch { return NextResponse.json({ error: "DeepSeek 返回格式无法合并" }, { status: 502 }); }
    const source: any = input;
    const factorCount = source?.offlineAnalysis?.factors?.length ?? 0;
    const adviceCount = source?.offlineAnalysis?.advice?.length ?? 0;
    if (enhancement?.coreTendency !== source?.offlineAnalysis?.tendency || enhancement?.coreVerdict !== source?.offlineAnalysis?.verdict || typeof enhancement?.direct !== "string" || !enhancement.direct.trim() || !Array.isArray(enhancement?.factorRewrites) || enhancement.factorRewrites.length !== factorCount || !Array.isArray(enhancement?.adviceRewrites) || enhancement.adviceRewrites.length !== adviceCount || typeof enhancement?.verify !== "string" || typeof enhancement?.contextUsed !== "string") return NextResponse.json({ error: "DeepSeek 没有直接回答或改变了离线核心，请重试" }, { status: 502 });
    const clean = (value: unknown, max = 260) => typeof value === "string" ? value.trim().slice(0, max) : "";
    const fallbackFactors = source?.offlineAnalysis?.factors || [];
    const fallbackAdvice = source?.offlineAnalysis?.advice || [];
    const safe = {
      coreTendency: source.offlineAnalysis.tendency,
      coreVerdict: source.offlineAnalysis.verdict,
      direct: clean(enhancement.direct, 440) || source.offlineAnalysis.direct,
      factorRewrites: enhancement.factorRewrites.map((x:unknown, i:number) => clean(x, 280) || fallbackFactors[i]?.inference || ""),
      adviceRewrites: enhancement.adviceRewrites.map((x:any, i:number) => ({ conclusion: clean(x?.conclusion, 260) || fallbackAdvice[i]?.conclusion || "", action: clean(x?.action, 300) || fallbackAdvice[i]?.action || "" })),
      verify: clean(enhancement.verify, 380) || source.offlineAnalysis.verify,
      contextUsed: clean(enhancement.contextUsed, 200)
    };
    return NextResponse.json({ enhancement: safe });
  } catch { return NextResponse.json({ error: "当前无法连接 DeepSeek，请稍后重试" }, { status: 502 }); }
}
