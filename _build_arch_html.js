import fs from 'fs';
const root = 'Z:/AI 202604/trae01/mercury-method-lab';
const arch = JSON.parse(fs.readFileSync(`${root}/architecture.json`, 'utf8'));

const p = arch.project_meta;
const cols = (arr, n=3) => {
  const rows = [];
  for(let i=0;i<arr.length;i+=n) rows.push(arr.slice(i,i+n));
  return rows;
};

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${p.name} — Architecture Map v${p.version}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI','PingFang SC',sans-serif;background:#0d1117;color:#c9d1d9;min-height:100vh;line-height:1.6}
a{color:#58a6ff;text-decoration:none}
a:hover{text-decoration:underline}
header{background:#161b22;border-bottom:1px solid #30363d;padding:24px 40px}
header h1{color:#f0f6fc;font-size:1.5rem;margin-bottom:4px}
header p{color:#8b949e;font-size:0.9rem}
.badge{display:inline-block;background:#1f6feb;padding:2px 10px;border-radius:12px;font-size:0.8rem;margin-right:8px}
.tag{display:inline-block;background:#21262d;border:1px solid #30363d;padding:1px 8px;border-radius:8px;font-size:0.75rem;margin:2px}
nav{background:#161b22;border-bottom:1px solid #30363d;padding:12px 40px;position:sticky;top:0;z-index:10;overflow-x:auto;white-space:nowrap}
nav a{margin-right:20px;color:#8b949e;font-size:0.9rem}
nav a:hover,.nav-active{color:#58a6ff!important}
main{max-width:1200px;margin:0 auto;padding:32px 40px}
section{margin-bottom:48px}
h2{color:#f0f6fc;border-bottom:1px solid #30363d;padding-bottom:8px;margin-bottom:20px;font-size:1.2rem}
h3{color:#58a6ff;margin:16px 0 10px;font-size:1rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px}
.card:hover{border-color:#58a6ff}
.card h4{color:#f0f6fc;font-size:0.95rem;margin-bottom:6px}
.card p{color:#8b949e;font-size:0.85rem}
.card .size{color:#484f58;font-size:0.75rem;margin-top:4px}
.files-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.file-item{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:12px 14px}
.file-item .name{color:#7ee787;font-size:0.88rem;margin-bottom:4px}
.file-item .desc{color:#8b949e;font-size:0.82rem}
.file-item .size{color:#484f58;font-size:0.75rem;margin-top:4px}
.scripts-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:10px}
.script-item{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:10px 14px;display:flex;gap:12px;align-items:baseline}
.script-item code{flex:0 0 auto;color:#79c0ff;font-size:0.85rem}
.script-item span{flex:1;color:#8b949e;font-size:0.82rem}
.toc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.toc-item{display:block;background:#161b22;border:1px solid #30363d;border-radius:6px;padding:14px 16px}
.toc-item .title{color:#58a6ff;font-size:0.92rem;margin-bottom:4px}
.toc-item .sub{color:#8b949e;font-size:0.8rem}
.install-box{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:20px 24px;font-size:0.9rem;line-height:2}
.install-box code{background:#21262d;padding:2px 8px;border-radius:4px;color:#f0883e;font-size:0.88rem}
.install-box .label{color:#f0f6fc;font-weight:bold;margin-bottom:8px}
.footer{text-align:center;color:#484f58;font-size:0.8rem;padding:32px;border-top:1px solid #30363d;margin-top:48px}
.highlight-box{background:#0d4429;border:1px solid #238636;border-radius:8px;padding:16px 20px;margin:16px 0}
.highlight-box h3{color:#3fb950;margin-top:0}
pre{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:14px;font-size:0.85rem;overflow-x:auto;line-height:1.5;margin:12px 0}
pre code{color:#c9d1d9}
table{width:100%;border-collapse:collapse;background:#161b22;border-radius:8px;overflow:hidden}
th{background:#1c2128;color:#8b949e;text-align:left;padding:10px 14px;font-weight:normal;font-size:0.85rem;border-bottom:1px solid #30363d}
td{padding:10px 14px;border-bottom:1px solid #21262d;font-size:0.88rem}
tr:last-child td{border-bottom:none}
tr:hover td{background:#1c2128}
.kbd{background:#21262d;border:1px solid #30363d;border-radius:4px;padding:1px 6px;font-size:0.8rem}
</style>
</head>
<body>

<header>
  <h1>${p.name}</h1>
  <p>${p.description}</p>
</header>

<nav>
  <a href="#overview">概览</a>
  <a href="#install">安装</a>
  <a href="#core">核心模块</a>
  <a href="#scripts">工具链</a>
  <a href="#config">配置</a>
  <a href="#skills">技能</a>
  <a href="#cases">案例</a>
  <a href="#scripts-index">NPM 脚本</a>
</nav>

<main>

<section id="overview">
<h2>📋 项目概览</h2>
<div class="grid">
  <div class="card">
    <h4>Package</h4>
    <p><code>${p.package_name}</code></p>
    <p class="size">Version ${p.version}</p>
  </div>
  <div class="card">
    <h4>GitHub</h4>
    <p><a href="${p.github.url}">${p.github.owner}/${p.github.name}</a></p>
  </div>
  <div class="card">
    <h4>Dashboard</h4>
    <p><a href="http://127.0.0.1:4788/lite.html">127.0.0.1:4788/lite.html</a></p>
    <p class="size">启动：<kbd class="kbd">npm run dashboard</kbd></p>
  </div>
  <div class="card">
    <h4>Node 要求</h4>
    <p><code>&gt;= 20</code></p>
  </div>
  <div class="card">
    <h4>状态</h4>
    <p>${p.status}</p>
  </div>
  <div class="card">
    <h4>上游</h4>
    <p><code>cosmicstack-labs/mercury-agent</code></p>
    <p class="size">不是 fork，不是 vendor copy</p>
  </div>
</div>
</section>

<section id="install">
<h2>🚀 快速安装</h2>
<div class="install-box">
  <div class="label">安装新包（已重命名）</div>
  <pre><code>npm uninstall mercury-method-lab
npm install @GlimpseGate/admission-lab</code></pre>
</div>
<div class="install-box">
  <div class="label">SDK 导入</div>
  <pre><code>import { fullAudit, buildAdmissionContract, auditMemoryWrite,
     buildEvidenceChain, verifyAuditStability, applyStabilityGate }
  from "@GlimpseGate/admission-lab";</code></pre>
</div>
<div class="install-box">
  <div class="label">快速开始</div>
  <pre><code>npm install
npm run demo:starter
npm run dashboard</code></pre>
</div>
</section>

<section id="core">
<h2>⚙️ 核心模块 <span style="font-weight:normal;color:#8b949e;font-size:0.9rem">src/mercury-audit/</span></h2>
<p style="color:#8b949e;margin-bottom:16px;font-size:0.9rem">F1–F5 忠实度与稳定性检测引擎，API 版本 0.6.0</p>
<div class="files-list">
  ${arch.core_modules.modules.map(m=>`<div class="file-item">
    <div class="name">${m.name}</div>
    <div class="desc">${m.description}</div>
    <div class="size">${(m.size/1024).toFixed(1)} KB</div>
  </div>`).join('\n')}
</div>
</section>

<section id="scripts">
<h2>🔧 工具链脚本 <span style="font-weight:normal;color:#8b949e;font-size:0.9rem">scripts/</span></h2>
<div class="scripts-list">
  ${arch.tooling_scripts.scripts.map(s=>`<div class="script-item">
    <code>${s.name}</code>
    <span>${s.description}</span>
  </div>`).join('\n')}
</div>
</section>

<section id="config">
<h2>⚡ 配置系统 <span style="font-weight:normal;color:#8b949e;font-size:0.9rem">config/</span></h2>
<div class="files-list">
  ${arch.configuration.files.map(f=>`<div class="file-item">
    <div class="name">${f.name}</div>
    <div class="desc">${f.description}</div>
    <div class="size">${f.size} B</div>
  </div>`).join('\n')}
</div>
</section>

<section id="skills">
<h2>🎯 技能系统 <span style="font-weight:normal;color:#8b949e;font-size:0.9rem">08_skills/</span></h2>
<div class="grid">
  ${arch.skill_system.skills.map(s=>`<div class="card">
    <h4>${s.name}</h4>
    <p>${s.description}</p>
  </div>`).join('\n')}
</div>
</section>

<section id="cases">
<h2>📁 案例库 <span style="font-weight:normal;color:#8b949e;font-size:0.9rem">cases/</span></h2>
<p style="color:#8b949e;margin-bottom:12px;font-size:0.9rem">验证 Mercury 方法的真实场景，2026-05 共 ${arch.cases_library.cases.length} 个案例</p>
<div class="grid">
  ${arch.cases_library.cases.map(c=>`<div class="card"><h4>${c}</h4></div>`).join('\n')}
</div>
</section>

<section id="scripts-index">
<h2>📜 NPM 脚本索引</h2>
<table>
  <thead><tr><th>命令</th><th>说明</th></tr></thead>
  <tbody>
    ${arch.npm_scripts.map(s=>`<tr><td><code>${s.command}</code></td><td>${s.description}</td></tr>`).join('\n')}
  </tbody>
</table>
</section>

<section>
<h2>📚 核心文档</h2>
<table>
  <thead><tr><th>文档</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td><a href="docs/START-HERE.md">START-HERE.md</a></td><td>角色入口文档</td></tr>
    <tr><td><a href="docs/SCOPE.md">SCOPE.md</a></td><td>项目边界定义</td></tr>
    <tr><td><a href="docs/SDK-API.md">SDK-API.md</a></td><td>SDK API 文档</td></tr>
    <tr><td><a href="docs/AUDIT-KERNEL.md">AUDIT-KERNEL.md</a></td><td>审计内核文档</td></tr>
    <tr><td><a href="docs/FAILURE-MODES.md">FAILURE-MODES.md</a></td><td>失败模式文档</td></tr>
    <tr><td><a href="docs/ROUTING-THEORY.md">ROUTING-THEORY.md</a></td><td>路由理论文档</td></tr>
    <tr><td><a href="docs/V2-AUDIT-FIDELITY-CAPABILITIES.md">V2-AUDIT-FIDELITY-CAPABILITIES.md</a></td><td>F1–F5 能力定义</td></tr>
    <tr><td><a href="docs/TYPE-MECE-ANALYSIS.md">TYPE-MECE-ANALYSIS.md</a></td><td>9 种准入对象类型 MECE 分析</td></tr>
    <tr><td><a href="docs/ITERATION-GUIDE-LATEST.md">ITERATION-GUIDE-LATEST.md</a></td><td>当前版本迭代指南</td></tr>
    <tr><td><a href="docs/ITERATION-GUIDE-2.1.0.md">ITERATION-GUIDE-2.1.0.md</a></td><td>v2.1.0 交接文档</td></tr>
    <tr><td><a href="docs/GOVERNANCE.md">GOVERNANCE.md</a></td><td>项目治理原则</td></tr>
    <tr><td><a href="docs/METHODOLOGY-INTEGRITY.md">METHODOLOGY-INTEGRITY.md</a></td><td>provenance 完整性规则</td></tr>
    <tr><td><a href="docs/AGENT-AUDIT-BLUEPRINT.md">AGENT-AUDIT-BLUEPRINT.md</a></td><td>Agent 审计蓝图</td></tr>
  </tbody>
</table>
</section>

<section>
<h2>🗂️ 项目目录结构</h2>
<pre><code>src/mercury-audit/    核心审计引擎（F1-F5）
scripts/              工具链（40+ 脚本）
config/               配置系统（13 个文件）
08_skills/            技能模块（10 个技能）
cases/                真实案例库
examples/             集成演示和示例
docs/                 方法论文档
schemas/               数据 schema
submissions/          提交队列
00_raw/               原始材料
01_segmented/         切分材料
02_cleaned/           清洗材料
07_audit_reports/     审计报告
dist/                 生成产物（不作为事实源）</code></pre>
</section>

</main>

<div class="footer">
  ${p.name} v${p.version} · <a href="${p.github.url}">${p.github.url}</a> ·
  架构文档由 AI 辅助生成 · provenance: <code>ai_assisted: true</code>
</div>

</body>
</html>`;

fs.writeFileSync(`${root}/architecture.html`, html, 'utf8');
console.log('HTML written, size:', fs.statSync(`${root}/architecture.html`).size);
