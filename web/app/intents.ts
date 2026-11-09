export type IntentProfile = {
  key: string;
  label: string;
  category: string;
  messages?: string[];
  actions?: string[];
  verify: string;
  guard: string;
};

const six = (values: string[]) => values;
const profiles: Array<IntentProfile & { re: RegExp }> = [
  { key:"lottery", label:"彩票盈亏", category:"财运", re:/彩票|乐透|双色球|大乐透|刮刮乐|足彩|中奖|号码投注|博彩|赌/, messages:six(["本卦不主突然暴利，结果更偏向守住本金或小额起伏。","盈亏容易反复，须防连续追加与追损。","短时可能出现小利或即时反馈，但不代表可持续获利。","损耗信号较强，冲动投注更容易扩大亏损。","有小利或回流之象，但小吉不等于大奖，宜见好即收。","落空概率偏高，不宜因期待而增加投入。"]), actions:six(["不扩大投注；预先写下本次总预算和停止条件。","停止追损与连续加注，等结算后只看净盈亏。","即使出现小额盈利也按原预算结束，不把短时好运当规律。","本次以不参与或极小额为宜，严禁借钱和情绪化加注。","只可使用完全可承受损失的小额资金，达到预设盈利即停止。","暂停投注，把未投入的钱视为保住的本金。"]), verify:"以全部投注额、实际中奖到账额和净盈亏（到账额减投注额）验证；不得用“差一点中奖”代替结果", guard:"彩票是随机事件，卦象不能提高中奖概率；不得借贷、追损或突破预算" },
  { key:"investment", label:"投资交易", category:"财运", re:/股票|基金|期货|加密|币圈|投资|交易|买入|卖出|涨跌|收益/, messages:six(["走势偏稳，重在仓位和持有纪律。","走势反复，进出节奏容易被拖累。","短线窗口较明显，但持续性仍需验证。","波动与损失风险上升，防情绪化交易。","流动性或阶段性收益有利，但不是无风险上涨。","预期可能落空，先验证基本面与风险暴露。"]), actions:six(["控制仓位，按既定策略而非卦象加仓。","减少频繁操作，先定义等待条件和退出点。","只执行事先计划的短线动作，并设置止盈止损。","降低仓位或暂缓交易，避免杠杆与追涨杀跌。","分批处理并锁定部分收益，不把浮盈当已实现收益。","暂停新增资金，重新核对信息来源和最大可承受损失。"]), verify:"以成交记录、持仓成本、已实现盈亏、最大回撤和风险限额验证", guard:"投资结论不得代替持牌专业意见，不能承诺收益" },
  { key:"income", label:"收入回款", category:"财运", re:/工资|奖金|收入|进账|回款|欠款|借款|还钱|收款/, verify:"以实际到账时间、到账金额、书面约定和未收余额验证", guard:"未到账前不把口头承诺计为收入" },
  { key:"business", label:"生意经营", category:"财运", re:/生意|店铺|销售|订单|客户|创业|营收|利润|开店/, verify:"以订单、实收收入、毛利、成本和复购数据验证", guard:"区分营收与利润，先计算真实成本" },
  { key:"job", label:"求职录用", category:"事业", re:/求职|面试|录用|入职|offer|工作能否|找工作|应聘/i, verify:"以正式通知、书面录用条件、薪酬和入职日期验证", guard:"口头好感不等于录用，以正式文件为准" },
  { key:"promotion", label:"升职调动", category:"事业", re:/升职|晋升|加薪|转岗|调动|竞聘/, verify:"以任命、薪酬调整、职责权限和生效日期验证", guard:"新增责任不等于真正晋升，需核对权限与待遇" },
  { key:"project", label:"项目成败", category:"事业", re:/项目|方案|合作能否|签约|审批|投标|竞标/, verify:"以关键里程碑、责任人、审批、预算和交付结果验证", guard:"把外部承诺转成可检查的节点和书面条件" },
  { key:"career-direction", label:"发展方向", category:"事业", re:/发展重心|发展方向|副业|转行|学编程|做什么类型|适合做什么|职业方向/, verify:"以可投入时间、已有技能、首个可交付成果、真实询价和连续四周反馈验证", guard:"先做低成本试验，不因卦象辞职、借贷或重仓投入" },
  { key:"stay-or-leave", label:"去留选择", category:"事业", re:/要不要继续.*老板|继续.*工作|要不要离职|该不该辞职|换工作|跳槽/, verify:"以实际报酬、职责边界、成长空间、管理结构和已获得的替代机会验证", guard:"未取得可靠替代方案前，保留收入与基本权益" },
  { key:"reconcile", label:"复合挽回", category:"感情", re:/复合|挽回|前任|重新在一起/, verify:"以对方持续回应、主动见面、问题修复和明确关系状态验证", guard:"一次回复或短暂情绪不等于关系恢复" },
  { key:"marriage", label:"婚恋发展", category:"感情", re:/结婚|婚姻|订婚|对象|恋爱结果|能否在一起/, verify:"以双方持续行动、现实安排、共同计划和明确承诺验证", guard:"言语热度不能代替长期行动与边界共识" },
  { key:"family", label:"家庭关系", category:"感情", re:/妈妈|母亲|爸爸|父亲|父母|家人|家庭关系|亲子关系/, verify:"以联系频率、双方回应、边界是否被尊重和相处后的真实感受验证", guard:"关系改善不等于必须恢复亲密；安全、边界和个人承受力优先" },
  { key:"exam", label:"考试结果", category:"学业", re:/考试|考研|考公|成绩|及格|上岸|录取|面试成绩/, verify:"以正式成绩、分数线、排名和录取通知验证", guard:"卦象不能代替复习与正式结果" },
  { key:"application", label:"申请审核", category:"学业", re:/申请|审核|学校|留学|签证|资格|材料通过/, verify:"以材料状态、补件通知、正式审核结果和截止时间验证", guard:"未收到正式结果前保留补件和替代方案" },
  { key:"travel", label:"行程出行", category:"出行", re:/出行|旅行|航班|机票|车票|行程|能否去|路上/, verify:"以票务状态、证件、天气、交通信息和实际到达验证", guard:"安全、官方通知和现实交通条件优先于卦象" },
  { key:"safety-event", label:"安全与演练", category:"出行", re:/消防|演习|警察|上门|抽查|检查|报警|安全事件/, verify:"以官方通知、证件核验、单位安排、现场负责人和实际执行情况验证", guard:"先服从安全规则并核验身份；不能用卦象判断执法真伪或拒绝应急安排" },
  { key:"relocation", label:"搬迁迁居", category:"出行", re:/搬家|搬迁|迁居|移民|换城市|远行定居/, verify:"以住房、工作、费用、证件和实际落地安排验证", guard:"先核对长期成本与可逆方案" },
  { key:"lost", label:"失物寻找", category:"寻物", re:/丢|遗失|不见|找不到|失物|在哪/, verify:"按最后确认时间、经手人、移动路线、定位与监控逐项排查", guard:"先排除盗窃或安全风险，必要时报警或挂失" },
  { key:"fitness", label:"体重与健身", category:"健康", re:/减肥|减重|体重|体脂|健身|塑形/, verify:"以同一条件下的体重周均值、腰围、体脂趋势、饮食和运动完成度验证", guard:"采用安全、可持续的方法；不极端节食，不以卦象代替医生或营养师建议" },
  { key:"pet-health", label:"宠物健康", category:"健康", re:/猫|狗|宠物|猫癣|打喷嚏|兽医/, verify:"以精神食欲、体温、呼吸、皮损变化和兽医检查验证", guard:"不能凭卦象诊断或保证康复；呼吸困难、持续拒食等情况立即就医" },
  { key:"health", label:"健康症状", category:"健康", re:/身体|健康|疾病|疼|痛|发烧|手术|康复|检查|症状/, verify:"以正规检查、医生诊断、客观指标和症状变化验证", guard:"不能以卦代医；急症或严重症状立即就医" }
];

const categoryVerify: Record<string,string> = {
  事业:"以书面确认、职责、资源和真实进度验证", 感情:"以持续行动、明确回应和实际承诺验证", 财运:"以实际到账、净现金流、成本和可核验记录验证", 出行:"以票务、证件、天气交通和实际行程验证", 寻物:"按最后位置、方位、经手人和移动路径逐项排查", 学业:"以完成度、反馈、正式成绩和审核要求验证", 健康:"以正规检查、医生诊断和症状变化验证", 其他:"先定义可观察结果、现实证据和截止时间验证"
};

export function detectIntent(question:string, category:string):IntentProfile {
  const q=question.trim();
  const found=profiles.find(x=>x.re.test(q) && x.category===category) || profiles.find(x=>x.re.test(q));
  if(found){ const {re,...profile}=found; return profile; }
  return { key:`generic-${category}`, label:`${category}事项`, category, verify:categoryVerify[category] || categoryVerify.其他, guard:"只依据现实中可观察、可核验的信息采取行动" };
}

export function intentMessages(intent:IntentProfile, fallback:string[]):string[]{
  if(intent.messages) return intent.messages;
  const subject=intent.label;
  return [
    `${subject}的基础较稳，宜按既定条件稳步落实。`,
    `${subject}容易延迟或反复，先解除中间卡点。`,
    `${subject}出现短时窗口，适合及时确认和行动。`,
    `${subject}的冲突、损耗或判断失误风险上升。`,
    `${subject}有流动、协作或转机，但仍需现实验证。`,
    `${subject}的信息或目标可能落空，应先核实前提。`
  ].map((x,i)=>intent.key.startsWith("generic-") ? fallback[i] : x);
}

export function intentActions(intent:IntentProfile, fallback:string[]):string[]{
  if(intent.actions) return intent.actions;
  if(intent.key.startsWith("generic-")) return fallback;
  return [
    `围绕${intent.label}保持现有有效路径，先确认关键条件再稳步推进。`,
    `为${intent.label}设定明确期限，先处理拖延、反复或未完成环节。`,
    `抓住已出现的短期窗口，尽快完成一个可验证的关键动作。`,
    `降低冲突和损耗，暂停高风险动作，先核对事实并保留证据。`,
    `主动利用可用资源与渠道，但每一步都以真实反馈为准。`,
    `停止追加投入，重新核验问题前提，并准备替代或退出方案。`
  ];
}
