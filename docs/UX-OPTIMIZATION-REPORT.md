# Mercury Lab Dashboard UX 优化报告

> 生成时间：2026-05-01 21:51 GMT+8
> 分析者：QClaw / mercury-lab skill
> 状态：待处理

---

## 问题汇总

| 优先级 | 问题 | 改动量 | 状态 |
|--------|------|--------|------|
| 🔴 P0 | 加载状态不明确（"JavaScript is not started yet." 对用户无效） | 小 | 待处理 |
| 🔴 P0 | 提交结果后无下一步 CTA（用户看完结果不知道该做什么） | 小 | 待处理 |
| 🟡 P1 | System surfaces 默认折叠（入口不可见） | 小 | 待处理 |
| 🟡 P1 | 执行按钮无运行状态（点 Doctor 无反馈感） | 中 | 待处理 |
| 🟡 P1 | Artifact 工作台入口太深（新用户需要滚动到页面底部才能看到） | 小 | 待处理 |
| 🟢 P2 | Build badge 位置太隐蔽 | 小 | 待处理 |
| 🟢 P2 | 语言切换按钮不明显 | 小 | 待处理 |
| 🟢 P2 | 暗色 "What happens next" 卡片视觉跳跃大 | 小 | 待处理 |

---

## 详细问题说明

### 🔴 P0-1：加载状态不明确

**位置：** `#appStatus` 状态栏

**现状：**
```javascript
// app.js 中初始状态
// 显示 "JavaScript is not started yet."
```

**问题：** 用户看到这行字不知道是"正在加载"还是"出错了"，没有明确的预期。

**建议修改：**
- 初始显示 `"正在初始化..."`
- 成功后变绿显示 `"已就绪"`（class: `ok`）
- 出错时显示具体错误信息（class: `error`）

---

### 🔴 P0-2：提交结果后无下一步 CTA

**位置：** `#intakeResult` 区域

**现状：**
```
用户提交 → 显示结果卡片 → 无明确操作入口 → 用户困惑
```

**问题：** 用户提交材料后，看到"干净陈述"、"建议路由"、"系统问题"，然后就停了。没有下一步操作指引。

**建议修改：**
在 `#intakeResult` 底部加一个确认按钮组：

```html
<div class="result-actions">
  <button class="primary-action" data-action="continue">
    继续处理
  </button>
  <button class="secondary-action" data-action="reset">
    再次提交
  </button>
</div>
```

对应的 CSS：
```css
.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  justify-content: flex-end;
}
```

---

### 🟡 P1-1：System surfaces 默认折叠

**位置：** `aside.rail` → `details.system-capabilities`

**现状：** capabilities 列表藏在折叠菜单里，用户首次进来不知道 Mercury Lab 能做什么。

**问题：** 折叠是隐私保护设计，但对于一个工具型应用，第一眼应该让用户看到"我可以用它做什么"。

**建议修改：**
方案 A：在 topbar 下方加一行"能力概览"（不需要展开就能看到）
方案 B：首次加载时自动展开，之后记住用户状态（用 localStorage）

---

### 🟡 P1-2：执行按钮无运行状态

**位置：** `.commands` 区域（Doctor / Index / Validate / Sync Skills / Test LLM）

**现状：** 点击按钮 → 直接执行 → 结果显示。但如果执行时间长，用户不知道是否在运行中。

**问题：** 按钮没有禁用状态，也没有 loading 反馈。

**建议修改：**
```javascript
button.addEventListener('click', async () => {
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = "Running...";
  btn.disabled = true;
  
  try {
    // 执行命令
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});
```

---

### 🟡 P1-3：Artifact 工作台入口太深

**位置：** `#artifacts` section

**现状：** 新用户进来第一眼看到的是"提交材料"表单，而 Artifact 工作台在页面下方，需要滚动才能看到。

**问题：** 对于已经提交过材料的用户，他们更需要的是"查看我提交的东西"，但这个入口藏得很深。

**建议修改：**
在 `submit-card` 下方加一个轻量的快捷入口：
```html
<a href="#artifacts" class="quick-link">
  查看历史 artifacts →
</a>
```

---

### 🟢 P2-1：Build badge 位置

**位置：** `p.build-badge`

**现状：** 字号 12px，放在页面标题下方。

**问题：** 用户反馈 bug 时无法快速定位版本。

**建议修改：** 移到 topbar 右侧，或改成 `v2026.05.01-a` 格式（更简洁）。

---

### 🟢 P2-2：语言切换不明显

**位置：** `.rail-language`

**现状：** 语言选择放在左侧 rail 里，视觉权重低。

**建议修改：** 在 topbar 加一个明显的语言切换下拉菜单（如果多语言是核心功能）。

---

### 🟢 P2-3：暗色流程卡片视觉跳跃

**位置：** `.flow-card`

**现状：** 深色渐变背景 + 浅色文字，与整体浅色温暖风格形成强烈对比。

**问题：** 容易让用户误以为是"弹窗"或"警告"。

**建议修改：** 加一个微妙的图标（如 `→`）或边框，表明这是正常说明卡片。或者降低对比度。

---

## 文件位置参考

| 文件 | 用途 |
|------|------|
| `dashboard/index.html` | 结构 + 内容 |
| `dashboard/styles.css` | 样式 |
| `dashboard/app.js` | 交互逻辑（837行） |
| `dashboard_server.mjs` | 后端服务（端口 4788） |

---

## 优先级建议

| 优先级 | 建议立即修改 |
|--------|-------------|
| 🔴 P0 | 加载状态 + 提交结果 CTA |
| 🟡 P1 | System surfaces 展开 + 执行按钮 loading 状态 |
| 🟢 P2 | 排期优化 |

---

*本文档由 QClaw 生成，用于 Mercury Lab 迭代参考。*
*下次迭代前请确认这些问题的有效性，部分问题可能已在最新版本中修复。*