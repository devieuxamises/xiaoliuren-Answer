# 小六壬数研 · 网页版

小六壬「问卦 → 解卦」网页工具。道家传承六宫体系：三宫（天/地/人）排盘 + 时辰体用 + DeepSeek 联网解卦。

> 仅供传统文化学习与娱乐参考，不构成医疗、法律、财务等专业建议。

## 功能

- **四种起卦**：报三数 / 时分秒 / 农历月日时 / 手动月日时
- **三宫排盘**：天宫起因 → 地宫过程 → 人宫结果，先给直接结论，再展开五行生克与时辰体用
- **DeepSeek 联网解卦**：可选，密钥存本机浏览器，不上传代码
- **卦录与反馈**：历史卦例保存在 localStorage，支持事后验证复盘

## 本地运行

需要 Node.js ≥ 22：

```bash
cd web
npm install
npm run dev
```

## 部署到 Cloudflare

本项目使用 vinext + wrangler：

```bash
cd web
npm run build
npx wrangler deploy
```

## 技术栈

Next.js 16 · React 19 · TypeScript · Tailwind · vinext（Cloudflare）

## 规则引擎

离线排盘与核心结论由本地引擎锁定。DeepSeek 只负责把系统词条改写成贴合所问的自然语言，不改变卦象与吉凶方向。
