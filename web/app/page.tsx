"use client";
import { useEffect, useMemo, useState } from "react";
import { detectIntent, intentActions, intentMessages, type IntentProfile } from "./intents";
import { ENGINE_VERSION, RULESET, branchIndex, castThree, fiveElementRelation as relation, relationScore } from "./engine.js";
type Spirit = {
    n: string;
    m: string;
    e: string;
    d: string;
    f: string;
    c: string;
    k: string;
    dir: string;
    gua: string;
    st: string;
    br: string;
    num: string;
    pal: string;
    body: string;
    person: string;
    place: string;
    timing: string;
    verse: string;
};
const spirits: Spirit[] = [
    { n: "大安", m: "安", e: "木", d: "青龙", f: "大吉 · 宜静", c: "#377d4f", k: "安稳 · 守成 · 事业 · 东方", dir: "东方", gua: "震", st: "甲、藏丁", br: "寅卯", num: "1、4、5", pal: "事业宫／命宫", body: "左腿、肝胆；整体偏安，多主平缓无大碍", person: "长辈、上级、稳重可靠之人、自己", place: "东方、家中、熟悉且固定的场所", timing: "平缓渐进，宜按周观察，不急于下结论", verse: "身不动" },
    { n: "留连", m: "留", e: "土", d: "腾蛇", f: "小凶 · 有变", c: "#8a6148", k: "拖延 · 反复 · 牵绊 · 田宅", dir: "四隅", gua: "巽坤乾艮", st: "己、丁", br: "丑辰未戌", num: "2、7、8", pal: "田宅宫／奴仆宫", body: "左臂、心肾胃；慢性或反复发作", person: "旧识、中间人、彼此牵绊之人", place: "四隅、角落、转折处、被遮挡处", timing: "易拖延反复，宜设明确期限，否则迟迟不定", verse: "事难成" },
    { n: "速喜", m: "喜", e: "火", d: "朱雀", f: "中吉 · 宜速", c: "#b82e28", k: "迅速 · 喜讯 · 感情 · 南方", dir: "南方", gua: "离", st: "丙、藏辛", br: "巳午", num: "3、6、9", pal: "感情宫／夫妻宫", body: "头脑、血液、心脑；急性表现", person: "消息灵通之人、年轻人、带来喜讯者", place: "南方、明亮处、热源旁、路上", timing: "来得快，宜趁热把握，短时可见效", verse: "人便至" },
    { n: "赤口", m: "口", e: "金", d: "白虎", f: "中凶 · 慎言", c: "#46433f", k: "口舌 · 冲突 · 损伤 · 西方", dir: "西方", gua: "兑", st: "庚、藏癸", br: "申酉", num: "4、1、2", pal: "疾厄宫／兄弟宫", body: "右臂、肺肠胃；外伤或疼痛", person: "口舌之人、执法者、争竞对手", place: "西方、门口、金属器具旁", timing: "冲突来得快且急，宜即刻止损或避险", verse: "官事凶" },
    { n: "小吉", m: "吉", e: "水", d: "玄武", f: "小吉 · 宜动", c: "#2e6092", k: "流动 · 合作 · 财源 · 北方", dir: "北方", gua: "坎", st: "壬、甲", br: "亥子", num: "5、3、8", pal: "驿马宫／子女宫", body: "右腿、肾水肝肠；恢复平顺", person: "合作者、流动之人、可带来转机的贵客", place: "北方、水边、途中、包袋内", timing: "流动顺遂，宜主动推进、走动协调", verse: "人来喜" },
    { n: "空亡", m: "空", e: "土", d: "勾陈", f: "大凶 · 主空", c: "#77716a", k: "落空 · 未知 · 虚耗 · 中央", dir: "中央", gua: "中宫", st: "戊、藏乙", br: "借丑寅", num: "6、5、10", pal: "福德宫／父母宫", body: "膀胱、生殖、脾脑；虚症，以检查为准", person: "阴人、暗中之人、无实质往来者", place: "中央、空旷处、原处已失或去向不明", timing: "易落空或需重新核实，不宜给出确定日期", verse: "事不长" }
];

// 六宫类象库（来源：邵一尘《小六壬六宫类象》，按宫整理，供断卦与联网解读引证）
const LIUGONG_ASPECTS: Record<string, Record<string, string>> = {
  "大安": {
    事业: "国家、机关、机构、集团、厂房、工地、景区、重点单位、同事、同龄人、部队、高级军官、办公室、检察官、质检员、保护区、草地、山地、医院、老板、出口、国外、乘车长、警察、开发商",
    婚姻: "长时间、家庭、孕妇、备孕、人流、意外怀孕、婴儿、家庭主男、家庭主妇、婆媳关系、保姆、夫妻、房产、雅事、冷战、性生活",
    财运: "长时间、正财、财富、大额财富、资源、流失、破财、进账",
    性格: "安逸、慈祥、安分、守己、本分、高傲、高冷、高贵、高大上、涵养、稳重、城府深、笨头呆脑、倔牛劲、孤傲、野心、健身",
    物品: "木属性、木床、木桌、木梳、木板凳、木梯子、佛珠、木扫把、塑料棍、长的、木框、木门、铅笔、纸张、塑料、青色、木衣柜、汽车、火车、飞机、花草、软件",
    房屋: "房顶长方形、高档住宅、家属楼、教学楼、阴阳宅",
    学业: "博士、研究生、大学、高中、初中、小学、同窗、同校、学习好、拔尖、要强、三好学生、体委、学生会长、班长、组长、物理、语文、数学、体育、化学、技校、辅导班",
    官司: "胜诉、一审判决、二审判决、强制执行",
    方向: "东、东南、东北、东偏西南、东偏西北",
    天气: "晴（高热量、干旱、干燥）、阴（乌云密布、厚云）、雨（特大暴雨、大雨、暴雨、小雨）",
    风力: "大风 6-7 级、小风 2-3 级",
    数应: "1、4、5、2、3、6、8、9、10"
  },
  "留连": {
    事业: "暗藏、关系、国家、私人单位、电影院、部队、奸细、贪污、受贿、调查科、私人侦探、保镖、沙场、古董、古玩、烈士、墓地、情报部门、法事",
    婚姻: "短时间、暗藏、复杂、拖延、夫妻双方、婆媳关系、三角关系、保姆、暧昧、琐事、回忆、同性恋、房事、孕妇、孕产期、代孕、意外流产、婴儿、干儿、干女儿、怨恨、怨毒、暖男、暖女、挑拨离间、倒插门生活",
    财运: "大手大脚、松动、留不住、资源、偏财、进账、流水线、不明财产",
    性格: "大手大脚、时好时坏、自私自利、油嘴滑舌、笨手笨脚、懒散懒惰、社会底层、自大妄为、有心无胆、封闭自闭、忧郁",
    物品: "短、弯曲、暗色、短小物品、稀有物品、珍藏物品",
    房屋: "弯曲、凌乱、阴暗、不见光、朝阴、潮湿",
    学业: "留学、留级、转学、转校、偏门、玄学、历史、英语、手语、暗语、艺术、作诗、学习差、辅导班、学习下滑、复习、留守人员、成绩倒数",
    官司: "维持原判、证据不足、等待上诉",
    方向: "四角、角落、暗藏、不起眼的地方",
    天气: "晴（阴晴、多云）、阴（闷、阴暗）、雨（小雨、毛毛雨、雾霾）",
    风力: "大风 5-6 级、小风 2-3 级",
    数应: "1、2、3、5、6、7、8、9、10"
  },
  "速喜": {
    事业: "快速、国家、领导、中层干部、游乐场所、商场、部队、教官、快速反应、急救、重点、主刀医生、医院、交通、重要领导、计划生育",
    婚姻: "短时间、和睦、夫妻双方、准爸准妈、孕妇、顺产、喜事、自乱、争吵、争斗、婆媳关系、混乱不堪、性生活、三角关系、矛盾升级、火药味、突发事件",
    财运: "进账、流动资金、出账",
    性格: "应变能力、活跃、自来熟、利索、出大力、头脑、体力、好运动、闯劲、干劲十足、急躁、思考、洞察力",
    物品: "火光、灯光、照明、发热、手机、电脑、电源、电线、发亮的、手电筒、火机、电闸、电热宝",
    房屋: "上宽下窄、朝阳、地热、中心地带",
    学业: "化学、热门专业、艺术、体操、三好学生、班长、组长、学习委员、学生会、辅导老师、成绩上升或下滑",
    官司: "一审判决、强制执行",
    方向: "南、西南、西北、东北",
    天气: "晴（热量、干热、湿热）、阴（闷热）、雨（阵雨、雷阵雨）",
    风力: "大风 6 级、小风 3 级",
    数应: "3、6、9、12、18"
  },
  "赤口": {
    事业: "国家、贸易、外交部、部队、中校、洞察、保镖、打手、退役、老板、商业、人事部、门脸、山洞、医生、手术室、黑社会、歌舞厅、烟酒行、销售、导游、股票、金融",
    婚姻: "沟通、孕妇、备孕、剖腹产、夫妻双方、婆媳关系、保姆、争吵、保护、争夺、互相伤害",
    财运: "正财、偏财、财口、进账、出账",
    性格: "重情义、争强好斗、杀伐果断、斗智斗勇、有无担当、傲气冲天、能说会道、鲁莽直撞、守口如瓶",
    物品: "芯片、手机、电脑机箱、锤子、铁链、打火机、有口的、钉子、金属、金属器材、金属性、广播",
    房屋: "突出、直立、气魄、有尖",
    学业: "地理、玄学、研究生、成绩一般、学生会、武术",
    官司: "审判结果、听天由命",
    方向: "西、西南、西北、西偏东北",
    天气: "",
    风力: "大风 3-6 级、小风 1-2 级",
    数应: "1、2、3、4、5、6、7"
  },
  "小吉": {
    事业: "国家、统计局、文物局、文化局、环保局、海洋局、海警、海兵、风景区、保护区、部队、文职、秘书、文员、会计、文书、党委、社区、物业、绿化、白手起家、公司、代购、保险、基金",
    婚姻: "守家、顾家、专一、孕妇、备孕、孕产、顺产、消耗、矛盾深、水坑、婆媳关系、夫妻、外遇、前任",
    财运: "正财、偏财、耗财、损财、漏财",
    性格: "踏实、稳重、上进心、忠义、贴心、小男女、精神、思考、细心、执行力、兴趣、欲望、斯文、修养",
    物品: "水、饮料、水坑、沼泽、水桶、墨汁、液体、酒精、氧气、水银、消耗品、艺术品、装饰品、化妆品",
    房屋: "波浪形、起伏、长短波浪、圆形",
    学业: "美术、语文、写作、绘画、舞蹈、表演、历史、统计",
    官司: "终审判决",
    方向: "北、西北、北偏西南、北偏东南",
    天气: "",
    风力: "大风 8-11 级、小风 3-5 级",
    数应: "5、3、8、11、14"
  },
  "空亡": {
    事业: "国家、航空局、飞机场、工程局、土地局、建筑、开发商、富二代、老板、部队、邮政、古董商、股票商",
    婚姻: "异地恋、家庭、异地、夫妻双方、分手、离婚、婆媳关系、场合认识、关系僵硬、外遇、场合求婚",
    财运: "无财、破财、破产、转贷、基金、保险",
    性格: "忠义、忠厚、老实、实在、幻想、幻境、好色、宅男、宅女、空谈、无所事事、孝顺、朴实、雄厚",
    物品: "空杯、空荡、空房、空间、场地、古玩、古董、管道、石碑、玉石、陶瓷、石像、墙壁、空瓶",
    房屋: "形状方厚、稳重",
    学业: "研究生、出国留学、异地学校、异地老师、封闭学校、学生会",
    官司: "官司无望、听天由命",
    方向: "中央、空旷",
    天气: "",
    风力: "大风 6-11 级、小风 5-6 级",
    数应: "6、5、10、11"
  }
};

const categories = ["事业", "感情", "财运", "出行", "寻物", "学业", "健康", "其他"];
const categoryMessages: Record<string, string[]> = {
    事业: ["局面稳定，适合守正推进。", "进度反复，先处理牵绊。", "消息来得快，抓住窗口。", "防争议与沟通失误。", "利合作、流动与新渠道。", "方案可能落空，宜重查目标。"],
    感情: ["关系趋稳，重在承诺。", "暧昧牵绊，迟迟难定。", "互动升温，宜及时表达。", "口舌对立，避免激化。", "有相合之机，但仍需经营。", "期待与现实有落差。"],
    财运: ["以稳健积累为佳。", "回款或进账延迟。", "短期机会明显，忌贪快。", "防损耗、纠纷与冲动。", "财源在流动、合作或远方。", "账面虚浮，先核验信息。"],
    出行: ["可行但不宜频繁变更。", "易延误滞留，留出余量。", "利快速启程。", "防争执、磕碰与违章。", "利出行与异地往来。", "行程易取消或迷失重点。"],
    寻物: ["多在固定、整洁处。", "多被遮挡、压住或遗忘。", "留意明亮、热源旁。", "留意金属、门口或西侧。", "多在水边、袋中或移动路径。", "线索弱，可能已离开原处。"],
    学业: ["基础稳，宜按计划积累。", "注意拖延和反复修改。", "临场反应佳，宜趁热推进。", "压力易化为急躁。", "理解力活，适合交流学习。", "方向不清，先补框架。"],
    健康: ["宜规律休息并观察。", "不适可能缠绵，及时就医。", "留意急性表现。", "有疼痛损伤信号，尽快就医。", "宜适当活动，但仍应诊断。", "信息不足，勿以卦代医。"],
    其他: ["宜静守与稳步落实。", "事情有拖延和反复。", "进展迅速，时机稍纵即逝。", "冲突风险较高。", "可通过合作与行动改善。", "结果未定，先排除虚假前提。"]
};
const branches = [
    { n: "子", e: "水", yang: true, h: "23:00–00:59" }, { n: "丑", e: "土", yang: false, h: "01:00–02:59" }, { n: "寅", e: "木", yang: true, h: "03:00–04:59" }, { n: "卯", e: "木", yang: false, h: "05:00–06:59" },
    { n: "辰", e: "土", yang: true, h: "07:00–08:59" }, { n: "巳", e: "火", yang: false, h: "09:00–10:59" }, { n: "午", e: "火", yang: true, h: "11:00–12:59" }, { n: "未", e: "土", yang: false, h: "13:00–14:59" },
    { n: "申", e: "金", yang: true, h: "15:00–16:59" }, { n: "酉", e: "金", yang: false, h: "17:00–18:59" }, { n: "戌", e: "土", yang: true, h: "19:00–20:59" }, { n: "亥", e: "水", yang: false, h: "21:00–22:59" }
];
type CastRecord = {
    id: number;
    q: string;
    context?: string;
    cat: string;
    nums: number[];
    cast: number[];
    method?: string;
    time?: string;
    branch?: number;
    lunar?: string;
    engineVersion?: string;
    deepSnapshot?: any;
    aiEnhancement?: any;
    feedback?: { status: "符合" | "部分符合" | "不符合"; note?: string; date: string };
};
function localInput(date = new Date()) { const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return d.toISOString().slice(0, 19); }
function chineseNumber(text: string) { const special: Record<string, number> = { 正: 1, 冬: 11, 腊: 12 }; for (const k in special)
    if (text.includes(k))
        return special[k]; const digit: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }; const s = text.replace(/[闰年月日初]/g, ""); if (s === "十")
    return 10; if (s.startsWith("十"))
    return 10 + (digit[s[1]] || 0); if (s.includes("十")) {
    const [a, b] = s.split("十");
    return (digit[a] || 0) * 10 + (digit[b] || 0);
} return digit[s] || Number(s) || 1; }
function lunarParts(date: Date) { try {
    const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { month: "long", day: "numeric" }).formatToParts(date), m = parts.find(x => x.type === "month")?.value || "正月", d = parts.find(x => x.type === "day")?.value || "初一";
    return { month: chineseNumber(m), day: chineseNumber(d), label: `${m}${d}` };
}
catch {
    return { month: date.getMonth() + 1, day: date.getDate(), label: "设备不支持农历，暂按公历" };
} }
function timeUse(spirit: Spirit, branch: number) { const b = branches[branch], same = spirit.e === b.e; if (same)
    return { title: b.yang ? "比肩／比助" : "比劫", text: b.yang ? "用与体同气，外部时势给予同类助力。" : "同类之气并见，既可能协力，也可能形成竞争与分夺。" }; const r = relation(b.e, spirit.e)[0]; if (r === "生")
    return { title: "用生体", text: "时辰之气生扶人宫，后续条件对主体较有帮助。" }; if (r === "克")
    return { title: "用克体", text: "时辰之气克制人宫，外部条件形成压力或阻碍。" }; const rr = relation(spirit.e, b.e)[0]; if (rr === "生")
    return { title: "体生用", text: "主体之气生出给时势，主付出、消耗或主动推动。" }; return { title: "体克用", text: "主体制约外部条件，能主动掌控，也伴随克耗。" }; }
const stageWords = [
    "基础较稳，原有条件、规则或长期积累是事情的起点",
    "起点带有牵绊、犹豫或未处理完的旧条件",
    "事情由突发消息、快速行动或一时机缘引动",
    "起因中存在分歧、压力、口舌或规则冲突",
    "起因来自流动、合作、远方、资源交换或主动接触",
    "起点信息不完整、目标虚浮，或原设想本身需要重新确认"
];
const processWords = [
    "过程中趋向稳定，进度不快但可按既定路径落实",
    "过程中容易等待、反复、绕路，关键在解除牵绊",
    "过程推进较快，消息与机会出现后不宜拖延",
    "过程有争执、损耗或强硬阻力，沟通方式决定损害大小",
    "过程需要行动、协作、走动或更换渠道，动中较有机会",
    "过程中有落空、暂停或方向不清，必须先补齐事实"
];
const categoryActions: Record<string, string[]> = {
    事业: ["保持现有节奏，明确责任和里程碑后稳步推进。", "先解决审批、人员或资源卡点，再谈扩张。", "尽快回复消息、提交方案或抓住短期窗口。", "所有重要沟通留痕，避免正面争执与口头承诺。", "主动联系合作方、异地渠道或可流动的机会。", "重新核验岗位、合同、预算和真实需求，准备替代方案。"],
    感情: ["以稳定沟通和实际承诺确认关系。", "先厘清暧昧、旧关系或迟迟未决的问题。", "及时表达，但不要把短期热度误当长期承诺。", "暂停争辩，先确认边界、事实和双方真实意愿。", "增加真实相处与共同活动，观察行动是否一致。", "降低想象，直接确认对方态度；若长期无回应要及时止损。"],
    财运: ["以守成为主，做好现金流和长期积累。", "催款与核账要设期限，避免资金长期占用。", "短线机会可以把握，但设置止损且不追高。", "谨防纠纷、罚款、破损和冲动交易，合同必须复核。", "财源偏向合作、流通、异地和多渠道，但须算清成本。", "暂停大额投入，先核验账户、对方资质和回款依据。"],
    出行: ["按原计划执行，同时保留充足时间。", "预留延误时间并准备改签、绕行方案。", "适合尽快启程，重要节点提前确认。", "检查交通安全、证件与规则，避免疲劳和争执。", "出行本身有利，主动移动比停留更能解决问题。", "先确认行程是否仍成立，避免无目的奔波。"],
    寻物: ["从固定、整洁、原来常放的位置开始找。", "检查遮挡处、夹层、转角、柜下和被其他物品压住之处。", "查明亮处、电器或热源附近，并尽快寻找。", "查门口、金属器具、西侧及可能发生碰撞或争执的位置。", "沿移动路线、包袋、车内、水边或经手人处查找。", "先确认物品是否真的带出、是否被丢弃或已离开原地点。"],
    学业: ["按计划复习基础，不频繁更换方法。", "处理拖延与反复修改，给每项任务设置截止时间。", "趁状态好集中完成考试、答辩或提交。", "控制急躁，避免因争辩和粗心失分。", "通过交流、实践、移动学习和请教他人提升。", "先重建知识框架，确认目标和考核要求。"],
    健康: ["保持规律作息并观察变化；不适持续仍应就医。", "慢性或反复不适应尽快做正规检查，避免拖延。", "急性、发热或炎症表现应及时就医。", "疼痛、损伤、出血或剧烈症状应立即寻求医疗帮助。", "适度活动可能有帮助，但必须服从专业诊断。", "症状信息不明或异常严重时不要自行判断，立即就医。"],
    其他: ["守住核心目标，按步骤落实。", "先处理拖延和未完成事项。", "抓住当前窗口，迅速完成关键动作。", "降低冲突，保留证据并设置边界。", "通过行动、合作和改变路径寻找突破。", "重新定义问题，核验前提，并准备停止或重启。"]
};
function decisiveVerdict(intent: IntentProfile, score: number, question: string) {
    const positive = score >= 1, negative = score < 0;
    if (intent.key === "lottery") return positive ? "本卦结论：偏向能回本或小盈，但不是大赚信号" : negative ? "本卦结论：偏向不能回本，亏损风险更高" : "本卦结论：回本信号不足，应按不能回本准备";
    if (intent.key === "investment") return positive ? "本卦结论：偏向有阶段性收益，但必须控制仓位" : negative ? "本卦结论：偏向亏损或回撤，暂不宜扩大投入" : "本卦结论：盈亏优势不明，不宜据此增加仓位";
    if (intent.key === "income") return positive ? "本卦结论：偏向能够到账，但仍以实际入账为准" : negative ? "本卦结论：偏向延迟或暂时不能到账" : "本卦结论：到账与否尚不明确，需要继续核实";
    if (["job", "promotion", "project", "exam", "application"].includes(intent.key)) return positive ? "本卦结论：偏向能成，但需要把关键条件落实" : negative ? "本卦结论：当前偏向不能成，应准备替代方案" : "本卦结论：成败未定，关键条件尚未形成";
    if (["reconcile", "marriage", "family"].includes(intent.key)) return positive ? "本卦结论：关系有改善机会，但要看双方持续行动" : negative ? "本卦结论：短期偏向难以改善，不宜强行推进" : "本卦结论：关系走向未定，应先观察真实回应";
    if (["travel", "relocation", "safety-event"].includes(intent.key)) return positive ? "本卦结论：偏向可以进行，但必须服从现实安全条件" : negative ? "本卦结论：当前不宜勉强进行，先排除阻碍和风险" : "本卦结论：能否进行尚不明确，先等待正式条件";
    if (intent.key === "lost") return positive ? "本卦结论：仍有找回机会，应立即沿现实路径排查" : negative ? "本卦结论：找回难度较大，应同步挂失或止损" : "本卦结论：线索不足，暂时无法判断能否找回";
    if (["health", "pet-health", "fitness"].includes(intent.key)) return positive ? "本卦结论：走势偏向改善，但不能替代检查和治疗" : negative ? "本卦结论：改善信号不足，应尽快采取正规处理" : "本卦结论：变化不明确，应以客观指标和专业检查为准";
    if (/要不要|该不该|是否值得/.test(question)) return positive ? "本卦结论：偏向可以做，但要按条件推进" : negative ? "本卦结论：当前偏向不要做" : "本卦结论：暂不适合立即决定";
    if (/能不能|能否|会不会|是否会|可以吗|成不成/.test(question)) return positive ? "本卦结论：偏向能成，但不是无条件确定" : negative ? "本卦结论：偏向不能成或不会发生" : "本卦结论：目前不能明确判断能否成事";
    return positive ? `本卦结论：${intent.label}偏向能成，但需要现实行动落实` : negative ? `本卦结论：${intent.label}当前偏向不能成或明显受阻` : `本卦结论：${intent.label}暂时没有明确成事优势`;
}
function deepReading(q: string, cat: string, intent: IntentProfile, h: Spirit, e: Spirit, p: Spirit, r1: string[], r2: string[], use: {
    title: string;
    text: string;
}) {
    const pIndex = spirits.indexOf(p), hIndex = spirits.indexOf(h), eIndex = spirits.indexOf(e);
    const base = [2, -1, 1, -2, 1, -2][pIndex];
    const useScore = use.title.startsWith("用生") || use.title.startsWith("比肩") ? 1 : use.title === "用克体" || use.title === "体生用" || use.title === "比劫" ? -1 : 0;
    const processScore = relationScore(r2[0]);
    const backgroundScore = relationScore(r1[0]);
    const score = base + processScore + useScore;
    const verdict = decisiveVerdict(intent, score, q);
    const tendency = score >= 3 ? "整体偏吉，条件与结果互相支持" : score >= 1 ? "谨慎偏吉，有成事条件但需要主动落实" : score === 0 ? "吉凶交界，结果取决于现实行动与后续变化" : score >= -2 ? "偏向受阻，宜先处理风险再推进" : "当前明显不利，不宜勉强，应先止损或重设目标";
    const messages = intentMessages(intent, categoryMessages[cat]);
    const actions = intentActions(intent, categoryActions[cat]);
    const impact = (n: number) => n > 0 ? "有利" : n < 0 ? "不利" : "中性";
    const factors = [
        { ruleId:"R1", priority:1, weight:base, level: "核心", source: "人宫落宫", data: `${p.n}（${p.e}·${p.f}）`, inference: messages[pIndex], impact: impact(base), reference:"2013.01.21卦例解析：落宫为主、三宫为前因经过结果" },
        { ruleId:"R2", priority:2, weight:processScore, level: "次要", source: "地宫→人宫", data: `${e.n}${r2[0]}${p.n}`, inference: r2[1], impact: impact(processScore), reference:"三宫相承关系：地宫为经过、人宫为结果" },
        { ruleId:"R3", priority:3, weight:useScore, level: "修正", source: "时辰体用", data: use.title, inference: use.text, impact: impact(useScore), reference:"2013.11.10答疑：时辰多用于体用关系" },
        { ruleId:"R4", priority:4, weight:0, level: "背景", source: "天宫→地宫", data: `${h.n}${r1[0]}${e.n}`, inference: r1[1], impact: impact(backgroundScore), reference:"天宫解释前因；背景项不单独推翻人宫结果" }
    ];
    const advice: { basis: string; conclusion: string; action: string }[] = [];
    advice.push({ basis: `人宫为${p.n}，它是本卦结果的第一依据`, conclusion: messages[pIndex], action: actions[pIndex] });
    if (processScore < 0)
        advice.push({ basis: `地宫${e.n}${r2[0]}人宫${p.n}，过程与结果相冲`, conclusion: `当前最需要处理的是${intent.label}的中间条件和执行环节`, action: actions[eIndex] });
    else if (processScore > 0)
        advice.push({ basis: `地宫${e.n}${r2[0]}人宫${p.n}，过程能够承接结果`, conclusion: `现有${intent.label}路径具有助力，不宜无故换方向`, action: `保持当前有效路径，同时落实：${actions[pIndex]}` });
    if (backgroundScore < 0)
        advice.push({ basis: `天宫${h.n}${r1[0]}地宫${e.n}，起因进入过程时发生克耗`, conclusion: `${intent.label}的前置条件若不修正，后续会反复受阻`, action: `先核验和处理起因层的问题：${actions[hIndex]}` });
    if (useScore < 0) {
        const useAction = intent.key === "lottery" ? "把时辰不利视为收缩信号：降低或停止本次投注，绝不追损。" : use.title === "用克体" ? `降低${intent.label}面临的外部压力，避开强行推进。` : use.title === "体生用" ? "限制时间、金钱和情绪投入，先设止损线再行动。" : "明确权益和边界，防止竞争、分夺或重复投入。";
        advice.push({ basis: `时辰体用为${use.title}`, conclusion: "后续趋势会增加压力或消耗，不能只看表面吉象", action: useAction });
    }
    else if (useScore > 0)
        advice.push({ basis: `时辰体用为${use.title}`, conclusion: "后续时势有助力，可以利用但不应夸大", action: intent.key === "lottery" ? "即使出现小利也按预设金额停止，不因时势有利而加注。" : `把助力落实为${intent.label}中可验证的下一步动作。` });
    const logic = `判断顺序为：人宫结果优先；地宫到人宫决定过程能否承接；时辰体用只修正后续趋势；天宫到地宫仅解释背景，不参与总分，不能推翻核心结果。因此得到“${tendency}”。`;
    return { verdict, tendency, score, scoreBreakdown:[{name:"人宫核心",value:base},{name:"过程承接",value:processScore},{name:"时辰修正",value:useScore},{name:"背景说明",value:0}], direct: `${verdict}。人宫落${p.n}，${messages[pIndex]}；过程${r2[0]}（${r2[1]}），时辰${use.title}（${use.text}）。整体是“${tendency}”。`, logic, factors, advice, verify: intent.verify, guard: intent.guard, intentLabel: intent.label, ruleset:RULESET, engineVersion:ENGINE_VERSION, steps: [`天宫${h.n}：${stageWords[hIndex]}。`, `地宫${e.n}：${processWords[eIndex]}。`, `人宫${p.n}：${messages[pIndex]}`, `三宫关系：${h.n}${r1[0]}${e.n}；${e.n}${r2[0]}${p.n}。`, `时辰修正：${use.title}，${use.text}`] };
}
function calculateRecord(record: CastRecord) {
    const [h, e, p] = record.cast.map(i => spirits[i]), bi = record.branch ?? branchIndex(new Date(record.time || Date.now())), a = relation(h.e, e.e), c = relation(e.e, p.e), use = timeUse(p, bi), intent = detectIntent(record.q, record.cat);
    return { h, e, p, bi, b: branches[bi], a, c, use, intent, deep: deepReading(record.q, record.cat, intent, h, e, p, a, c, use) };
}
function withoutRepeatedVerdict(text: string, verdict: string) { return text.startsWith(verdict) ? text.slice(verdict.length).replace(/^[。；：:，,\s]+/, "") : text; }
function inspectQuestion(question: string) {
    const q = question.trim(), issues: string[] = [];
    if (q.length < 5) issues.push("问题过短，建议写清对象和想知道的结果");
    if (/(和|以及|同时|又).*(能否|如何|会不会|是否)/.test(q)) issues.push("可能同时问了两件事，建议拆成一事一卦");
    if (/(还是|或者|A|B|哪个更|二选一)/i.test(q)) issues.push("这是比较选择题，当前版本只适合单一对象；请分别说明选项或分开起卦");
    if (/以后|未来|何时|多久|什么时候/.test(q) && !/(天|周|月|年|之前|以内|截止)/.test(q)) issues.push("涉及未来但没有时间范围，建议补充期限");
    if (/他|她|对方/.test(q) && q.length < 9) issues.push("人物关系不够明确，建议说明对方与你的关系");
    return { issues, level: !q ? "缺少问题" : issues.length ? "建议补充" : "问题清晰" };
}
export default function Home() {
    const [tab, setTab] = useState("cast"), [q, setQ] = useState(""), [context, setContext] = useState(""), [cat, setCat] = useState("事业"), [mode, setMode] = useState("number"), [nums, setNums] = useState([1, 1, 1]), [time, setTime] = useState(localInput()), [lunarManual, setLunarManual] = useState([1, 1, 1]), [result, setResult] = useState<CastRecord | null>(null), [history, setHistory] = useState<CastRecord[]>([]);
    const [apiKey, setApiKey] = useState(""), [aiConsent, setAiConsent] = useState(false), [showKey, setShowKey] = useState(false), [aiPatch, setAiPatch] = useState<any>(null), [aiError, setAiError] = useState(""), [aiLoading, setAiLoading] = useState(false), [aiFor, setAiFor] = useState(0), [feedbackNote, setFeedbackNote] = useState("");
    useEffect(() => { try {
        setHistory(JSON.parse(localStorage.getItem("xlr-records") || "[]"));
        setApiKey(localStorage.getItem("deepseek-key") || "");
        setAiConsent(localStorage.getItem("deepseek-consent") === "yes");
    }
    catch { } }, []);
    const questionCheck = useMemo(() => inspectQuestion(q), [q]);
    const calculated = useMemo(() => { if (!result) return null; const current = calculateRecord(result); const snapshotIsCurrent = result.engineVersion === ENGINE_VERSION && result.deepSnapshot?.verdict; return { ...current, deep: snapshotIsCurrent ? result.deepSnapshot : current.deep }; }, [result]);
    const shownDeep = useMemo(() => {
        if (!calculated) return null;
        const d = calculated.deep;
        if (!aiPatch || !result || aiFor !== result.id) return d;
        if (!aiPatch.direct || aiPatch.coreTendency !== d.tendency || aiPatch.coreVerdict !== d.verdict) return d;
        return { ...d, direct: aiPatch.direct, factors: d.factors.map((f, i) => ({ ...f, inference: aiPatch.factorRewrites?.[i] || f.inference })), advice: d.advice.map((a, i) => ({ ...a, conclusion: aiPatch.adviceRewrites?.[i]?.conclusion || a.conclusion, action: aiPatch.adviceRewrites?.[i]?.action || a.action })), verify: aiPatch.verify || d.verify, contextUsed: aiPatch.contextUsed };
    }, [calculated, aiPatch, aiFor, result?.id]);
    async function askDeepSeek() {
        if (!result || !calculated || !apiKey || aiLoading) return;
        if (!aiConsent) { setShowKey(true); return; }
        setAiLoading(true); setAiError(""); setAiPatch(null);
        try {
            const response = await fetch("/api/deepseek", { method: "POST", headers: { "Content-Type": "application/json", "X-DeepSeek-Key": apiKey }, body: JSON.stringify({ question: result.q, optionalContext: result.context || "", category: result.cat, recognizedIntent: calculated.intent, castContext: { method: result.method, numbers: result.nums, palaces: [calculated.h.n, calculated.e.n, calculated.p.n], palaceDetails: [calculated.h, calculated.e, calculated.p].map((s) => ({ name: s.n, elem: s.e, animal: s.d, nature: s.f, meaning: s.k, dir: s.dir, body: s.body, person: s.person, place: s.place, timing: s.timing, verse: s.verse, aspects: LIUGONG_ASPECTS[s.n] })), relations: [`${calculated.h.n}${calculated.a[0]}${calculated.e.n}`, `${calculated.e.n}${calculated.c[0]}${calculated.p.n}`], timeBranch: `${calculated.b.n}时`, timeUse: calculated.use.title }, offlineAnalysis: calculated.deep }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "联网解读失败");
            setAiPatch(data.enhancement); setAiFor(result.id); updateRecord(result.id, { aiEnhancement: data.enhancement });
        } catch (error) { setAiError(error instanceof Error ? error.message : "联网解读失败"); }
        finally { setAiLoading(false); }
    }
    useEffect(() => { if (result && calculated && apiKey && aiFor !== result.id && !aiLoading) askDeepSeek(); }, [result?.id]);
    function updateRecord(id: number, patch: Partial<CastRecord>) { setHistory(previous => { const next = previous.map(x => x.id === id ? { ...x, ...patch } : x); localStorage.setItem("xlr-records", JSON.stringify(next)); return next; }); }
    function saveFeedback(status: "符合" | "部分符合" | "不符合") { if (!result) return; const feedback = { status, note: feedbackNote.trim(), date: new Date().toISOString() }; updateRecord(result.id, { feedback }); setResult({ ...result, feedback }); }
    async function shareResult() { if (!result || !shownDeep) return; const text = `问题：${result.q}\n结论：${shownDeep.tendency}\n${shownDeep.direct}\n建议：\n${shownDeep.advice.map((a:any,i:number)=>`${i+1}. ${a.action}`).join("\n")}\n验证：${shownDeep.verify}\n规则版本：${shownDeep.engineVersion || ENGINE_VERSION}`; if (navigator.share) { try { await navigator.share({ title:"小六壬解读", text }); return; } catch {} } await navigator.clipboard.writeText(text); alert("结果已复制"); }
    function submit() { const date = new Date(time), bi = branchIndex(date), lunar = lunarParts(date); let values: number[], label: string; if (mode === "number") {
        values = nums;
        label = "报三数";
    }
    else if (mode === "clock") {
        values = [date.getHours(), date.getMinutes(), date.getSeconds()];
        label = "时分秒";
    }
    else if (mode === "lunar") {
        values = [lunar.month, lunar.day, bi + 1];
        label = "农历月日时";
    }
    else {
        values = lunarManual;
        label = "手动月日时";
    } const x = castThree(values), r: CastRecord = { id: Date.now(), q: q.trim() || "未记名问事", context: context.trim(), cat, nums: x.v, cast: x.cast, method: label, time: date.toISOString(), branch: bi, lunar: mode === "manual" ? `农历${values[0]}月${values[1]}日` : lunar.label, engineVersion: ENGINE_VERSION }; r.deepSnapshot = calculateRecord(r).deep; const next = [r, ...history].slice(0, 100); setAiPatch(null); setFeedbackNote(""); setResult(r); setHistory(next); localStorage.setItem("xlr-records", JSON.stringify(next)); setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 80); }
    return <main className="shell"><header><div className="seal">壬</div><div><h1>小六壬数研</h1><p>天地人三宫 · 时辰体用推演</p></div><button className="ai-setting" onClick={() => setShowKey(!showKey)}>{apiKey && aiConsent ? "联网已启用" : "启用联网"}</button></header><section className="content">
    {showKey && <div className="card key-card"><span className="eyebrow">DeepSeek 问题化表达</span><p>排盘、吉凶方向与判断优先级由离线引擎锁定。DeepSeek 按训练资料理解问题和现实背景，重写成贴合当前问事的系统答案，不会另放一份 AI 答案，也不能改动核心结果。密钥只保存在本机浏览器，共用设备不建议保存。</p><input type="password" value={apiKey} placeholder="粘贴 DeepSeek API Key" autoComplete="off" onChange={e => setApiKey(e.target.value.trim())}/><label className="consent"><input type="checkbox" checked={aiConsent} onChange={e=>setAiConsent(e.target.checked)}/>我了解问题、可选背景和离线分析会发送给 DeepSeek，并同意本次联网处理</label><div><button disabled={!apiKey || !aiConsent} onClick={() => { localStorage.setItem("deepseek-key", apiKey); localStorage.setItem("deepseek-consent", "yes"); setShowKey(false); if (result) setTimeout(askDeepSeek, 0); }}>保存并启用</button><button onClick={() => { localStorage.removeItem("deepseek-key"); localStorage.removeItem("deepseek-consent"); setApiKey(""); setAiConsent(false); setShowKey(false); }}>清除</button></div></div>}
    {tab === "cast" && <><div className="card intro"><span className="eyebrow">所问之事</span><textarea aria-label="所问之事" value={q} onChange={e => setQ(e.target.value)} placeholder="一次只问一件具体的事，例如：本次彩票净盈亏如何？"/><div className={`question-check ${questionCheck.issues.length ? "warn" : "ok"}`}><b>{questionCheck.level}</b>{questionCheck.issues.map((x,i)=><span key={i}>{x}</span>)}</div><details className="context-input"><summary>补充现实背景（可选，但能让联网解读更准确）</summary><textarea aria-label="现实背景" value={context} onChange={e=>setContext(e.target.value)} placeholder="只写与问题有关的已知事实，例如预算、期限、双方现状、已经发生的进展；不要写 API 密钥。" maxLength={1200}/><small>{context.length}/1200 · 离线卦象不因背景改变，DeepSeek 只用它缩小类象范围</small></details><div className="chips">{categories.map(x => <button key={x} className={cat === x ? "chip on" : "chip"} onClick={() => setCat(x)}>{x}</button>)}</div><div className="rule"><b>选择起卦方式</b><small>每种方式都保留时辰</small></div><div className="mode-grid">{[["number", "报三数"], ["clock", "时分秒"], ["lunar", "农历时间"], ["manual", "手动月日时"]].map(x => <button key={x[0]} className={mode === x[0] ? "mode on" : "mode"} onClick={() => setMode(x[0])}>{x[1]}</button>)}</div>
      {mode === "number" && <><p className="help">静心后不思考，随口取三个 1–9 的数；若自然出现 0 或两位数，不重取，照数入卦，0 按 10。</p><div className="numbers">{nums.map((n, i) => <label key={i}><span>{["天数", "地数", "人数"][i]}</span><input inputMode="numeric" value={n} onChange={e => { const v = [...nums]; v[i] = +e.target.value; setNums(v); }}/></label>)}</div></>}
      {mode === "clock" && <p className="help">直接取所选时刻的“时、分、秒”三个数。资料示例：9时35分14秒排得速喜、大安、留连。</p>}
      {mode === "lunar" && <p className="help">按所选时刻转换为农历月、农历日、时辰序数，采用“大安起月、月上起日、日上起时”。</p>}
      {mode === "manual" && <><p className="help">用于已知事件时间或设备农历转换不一致时，手动输入农历月、日及子至亥的时辰序数。</p><div className="numbers">{lunarManual.map((n, i) => <label key={i}><span>{["农历月", "农历日", "时辰序"][i]}</span><input inputMode="numeric" value={n} onChange={e => { const v = [...lunarManual]; v[i] = +e.target.value; setLunarManual(v); }}/></label>)}</div></>}
      <label className="time-field"><span>{mode === "number" ? "实际起卦时刻（用于体用）" : "取用的时间"}</span><input type="datetime-local" step="1" value={time} onChange={e => setTime(e.target.value)}/><small>{branches[branchIndex(new Date(time))].n}时 · {branches[branchIndex(new Date(time))].h}</small></label>
      <button className="now" onClick={() => setTime(localInput())}>设为此刻</button><button className="primary" onClick={submit}>静心起卦</button></div>
      {calculated && result && <div id="result">
        <div className="cast-meta"><span>{result.method}</span><b>{result.nums.join(" · ")}</b><span>{result.lunar} · {calculated.b.n}时</span></div>
        <div className="palaces">{[["天宫", calculated.h], ["地宫", calculated.e], ["人宫", calculated.p]].map(([label, x]) => { const s = x as Spirit; return <div className="palace" key={String(label)}><small>{String(label)}</small><b style={{ color: s.c }}>{s.m}</b><strong>{s.n}</strong><span>{s.e} · {s.d}</span></div>; })}</div>
        <div className="card reading">
          <div className="reading-top"><span className="eyebrow">综合解读</span><button onClick={shareResult}>分享／复制</button></div><h2>{calculated.p.n}落人宫</h2><em>{calculated.p.f}</em><span className="intent-chip">问题识别：{calculated.intent.label}</span>
          <div className="direct-answer"><small>针对“{result.q}”的直接回答</small><strong>{shownDeep!.verdict || shownDeep!.tendency}</strong><p>{withoutRepeatedVerdict(shownDeep!.direct, shownDeep!.verdict || "")}</p></div>
          <div className="ai-inline-status" aria-live="polite">{aiLoading ? "正在按问题和现实背景重写系统词条…" : aiPatch && aiFor === result.id && aiPatch.direct && aiPatch.coreVerdict === calculated.deep.verdict ? <>已完成问题化表达 · 核心卦理未改变{aiPatch.contextUsed && <small>{aiPatch.contextUsed}</small>}</> : apiKey ? <button onClick={askDeepSeek}>用 DeepSeek 优化系统解读</button> : <button onClick={() => setShowKey(true)}>启用问题适配</button>}{aiError && <span>{aiError}<button onClick={askDeepSeek}>重试</button></span>}</div>
          <h3>逐步解答过程</h3><div className="steps">{shownDeep!.steps.map((step, i) => <div key={i}><b>{i + 1}</b><p>{step}</p></div>)}</div>
          <h3>三宫结构</h3><p className="flow">{calculated.h.n}（{calculated.h.e}） → {calculated.e.n}（{calculated.e.e}） → {calculated.p.n}（{calculated.p.e}）</p>
          <div className="relation"><b>天宫 → 地宫</b><span>{calculated.h.n}{calculated.a[0]}{calculated.e.n}，{calculated.a[1]}。</span></div><div className="relation"><b>地宫 → 人宫</b><span>{calculated.e.n}{calculated.c[0]}{calculated.p.n}，{calculated.c[1]}。</span></div>
          <h3>时辰体用</h3><div className="use-box"><b>体：{calculated.p.n}·{calculated.p.e}</b><span>用：{calculated.b.n}时·{calculated.b.e}（{calculated.b.yang ? "阳" : "阴"}）</span><strong>{calculated.use.title}</strong><p>{calculated.use.text}</p></div>
          <h3>判断逻辑</h3><p className="logic-box">{shownDeep!.logic}</p>
          {shownDeep!.scoreBreakdown && <div className="score-card"><div><b>综合指标 {shownDeep!.score > 0 ? `+${shownDeep!.score}` : shownDeep!.score}</b><small>仅用于保持判断优先级，不代表概率</small></div>{shownDeep!.scoreBreakdown.map((x:any)=><span key={x.name}>{x.name}<b>{x.value>0?`+${x.value}`:x.value}</b></span>)}</div>}
          <h3>数据 → 推论 → 影响</h3><div className="factor-table">{shownDeep!.factors.map((f:any, i:number) => <div className={`factor ${f.impact}`} key={i}><div><small>{f.level}</small><b>{f.source}</b></div><span>{f.data}</span><p>{f.inference}</p>{f.reference && <small className="rule-ref">{f.ruleId} · 优先级{f.priority} · 权重{f.weight}｜{f.reference}</small>}<em>{f.impact}</em></div>)}</div>
          <h3>由本卦数据推导的建议</h3><div className="derived-advice">{shownDeep!.advice.map((a, i) => <div key={i}><span>建议 {i + 1}</span><p><b>依据：</b>{a.basis}</p><p><b>所以：</b>{a.conclusion}</p><strong>{a.action}</strong></div>)}</div>
          <div className="verify-box"><b>如何用现实验证</b><p>{shownDeep!.verify}。若现实反馈与此相反，应以现实为准并停止套用本结论。</p></div>
          <div className="guard-box"><b>行动边界</b><p>{shownDeep!.guard}</p></div>
          <div className="feedback-box"><b>事后验证这次判断</b><p>真实结果发生后回来记录，帮助你复盘哪些规则有效。</p><textarea aria-label="实际结果备注" value={feedbackNote} onChange={e=>setFeedbackNote(e.target.value)} placeholder="可选：实际发生了什么"/><div>{(["符合","部分符合","不符合"] as const).map(x=><button className={result.feedback?.status===x?"on":""} key={x} onClick={()=>saveFeedback(x)}>{x}</button>)}</div>{result.feedback && <small>已于 {new Date(result.feedback.date).toLocaleDateString("zh-CN")} 记录：{result.feedback.status}</small>}</div>
          <h3>落宫细目</h3><div className="details"><span>方位<b>{calculated.p.dir}</b></span><span>卦位<b>{calculated.p.gua}</b></span><span>藏干<b>{calculated.p.st}</b></span><span>地支<b>{calculated.p.br}</b></span><span>取数<b>{calculated.p.num}</b></span><span>宫义<b>{calculated.p.pal}</b></span></div>
          <p className="note">规则集：{shownDeep!.ruleset || RULESET} · 引擎 {shownDeep!.engineVersion || result.engineVersion || "旧版"}。尚未参与核心判断：月令旺衰、六亲转太极、应期；这些内容待规则逐条校验后再启用。请用现实信息复核，同一件事在条件未变化前不要重复起卦。</p>
        </div>
      </div>}</>}
    {tab === "history" && <div className="stack"><div className="title"><div><span className="eyebrow">本机保存</span><h2>卦录</h2></div>{history.length > 0 && <button onClick={() => { if (confirm("确定清空全部卦录吗？")) {
        setHistory([]);
        localStorage.removeItem("xlr-records");
    } }}>清空</button>}</div>{history.length>0 && <div className="feedback-stats"><b>验证进度</b><span>{history.filter(x=>x.feedback).length} / {history.length} 已反馈</span><span>符合 {history.filter(x=>x.feedback?.status==="符合").length}</span><span>部分 {history.filter(x=>x.feedback?.status==="部分符合").length}</span><span>不符 {history.filter(x=>x.feedback?.status==="不符合").length}</span></div>}{history.length === 0 ? <div className="empty">尚无卦录<br /><small>完成一次起卦后会保存在这台手机上</small></div> : history.map(r => <button className="record" key={r.id} onClick={() => { setResult(r); setQ(r.q); setContext(r.context || ""); setCat(r.cat); setFeedbackNote(r.feedback?.note || ""); setAiPatch(r.aiEnhancement || null); setAiFor(r.aiEnhancement ? r.id : 0); setTab("cast"); }}><div><b>{r.q}</b><span>{r.method || "报三数"} · {r.cast.map(i => spirits[i].n).join(" · ")}</span><span>{r.branch === undefined ? "旧卦未记录时辰" : branches[r.branch].n + "时"} · 引擎 {r.engineVersion || "旧版"}{r.feedback ? ` · 已验证${r.feedback.status}` : ""}</span></div><time>{new Date(r.id).toLocaleDateString("zh-CN")}</time></button>)}</div>}
  </section><nav>{[["✦", "起卦", "cast"], ["◷", "卦录", "history"]].map(x => <button key={x[2]} className={tab === x[2] ? "on" : ""} onClick={() => setTab(x[2])}><span>{x[0]}</span>{x[1]}</button>)}</nav></main>;
}
