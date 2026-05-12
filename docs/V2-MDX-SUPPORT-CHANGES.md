# V2.0 · MDX 支持：需要修改的文件清单

> 日期：2026-05-11  
> Provenance：`[HUMAN_ONLY]` · 待迭代实现

---

## 涉及文件清单

| 文件 | 改动类型 | 优先级 |
|------|---------|--------|
| `scripts/capture_ai_conversation.mjs` | 读取支持 | P0 |
| `scripts/dashboard_server.mjs` | 读取 + 导出 + Content-Type | P0 |
| `scripts/validate_artifacts.mjs` | 验证规则 | P0 |
| `scripts/validate_incremental.mjs` | 验证规则 | P0 |
| `scripts/import_viewpoint.mjs` | 导入支持 | P1 |
| `scripts/ingest_document.mjs` | 摄取支持 | P1 |
| `scripts/rebuild_index.mjs` | 索引支持 | P1 |
| `schemas/` | 新增 MDX schema | P1 |
| `examples/` | MDX 格式样例 | P2 |
| `docs/` | MDX 格式规范 | P2 |

---

## P0 改动详情

### 1. `scripts/capture_ai_conversation.mjs`

**改动位置：**
```
第 1 处：readdir filter
  原来：.filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
  改为：.filter((f) => f.endsWith(".md") || f.endsWith(".mdx") || f.endsWith(".txt"))

第 2 处：console.log 说明
  原来："No .md/.txt captures found"
  改为："No .md/.mdx/.txt captures found"

第 3 处（watch 模式说明）：
  原来："Watching ${dir} for .md/.txt AI conversation captures..."
  改为："Watching ${dir} for .md/.mdx/.txt AI conversation captures..."
```

---

### 2. `scripts/dashboard_server.mjs`

**改动位置：**

```
第 1 处：contentType 映射（已有 .html 映射，添加 .mdx）
  原来：
    ".html": "text/html; charset=utf-8",
  改为：
    ".html": "text/html; charset=utf-8",
    ".mdx": "text/markdown; charset=utf-8",

第 2 处：entries filter（读取 Markdown 列表时）
  原来：.filter((f) => f.endsWith(".md"))
  改为：.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))

第 3 处：title 生成逻辑
  原来：.replace(/\.md$/i, "")
  改为：.replace(/\.(md|mdx)$/i, "")

第 4 处：slugify 逻辑（与 title 保持一致）
  如果 basename 函数不处理 .mdx，需要在 slugify 之前先 strip extension

第 5 处：default_export_format
  原来：default_export_format: "md"
  改为：default_export_format: "mdx"  // 或保持 "md" 让用户选择

第 6 处：text_path 生成（intake 保存时）
  原来：text_path: text ? `${intakeRel}/input.md` : ""
  建议：保持 input.md 不变，intake 文件永远是 .md
  但如果原始输入是 .mdx，应该记录原始扩展名

第 7 处：submission 路径验证
  原来：normalized.endsWith(".md")
  改为：normalized.endsWith(".md") || normalized.endsWith(".mdx")
```

---

### 3. `scripts/validate_artifacts.mjs`

**改动位置：**

```
第 1 处：readdir filter
  原来：.filter((f) => f.endsWith(".md"))
  改为：.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))

第 2 处：startsWithMarkdownHeading 检查
  MDX 文件同样以 Markdown 标题开头，不需要额外改动
  但如果要区分 MDX 和 MD，可以添加：
    const isMDX = fileRel.endsWith(".mdx");
    if (isMDX) { /* 额外检查 JSX 语法 */ }
```

---

### 4. `scripts/validate_incremental.mjs`

**改动位置：**

```
第 1 处：readdir filter
  原来：.filter((f) => f.endsWith(".md") && !f.endsWith("README.md"))
  改为：.filter((f) => (f.endsWith(".md") || f.endsWith(".mdx")) && !f.endsWith("README.md"))
```

---

## P1 改动详情

### 5. `scripts/import_viewpoint.mjs`

```
第 1 处：sourcePath 扩展名检查
  原来：if (!sourcePath.endsWith(".md"))
  改为：if (!sourcePath.endsWith(".md") && !sourcePath.endsWith(".mdx"))

第 2 处：slugify 前 strip 扩展名
  const bare = basename(sourcePath).replace(/\.(md|mdx)$/i, "");
  const slug = slugify(frontmatter.title || bare) || ...
```

### 6. `scripts/ingest_document.mjs`

```
第 1 处：outputPath 扩展名
  原来：const outputPath = join(rawDir, `${outputBase}.md`);
  改为：支持 --format mdx 参数
    const ext = options.format === "mdx" ? ".mdx" : ".md";
    const outputPath = join(rawDir, `${outputBase}${ext}`);
```

### 7. `scripts/rebuild_index.mjs`

```
第 1 处：readdir filter
  原来：.filter((f) => f.endsWith(".md"))
  改为：.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
```

---

## P2 改动详情

### 8. 新增 `schemas/audit-packet-mdx.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Mercury Audit Packet (MDX Format)",
  "description": "Audit packet with MDX support for embedding JSX components in audit results",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "type": { "const": "memory_candidate" },
    "claim": { "type": "string" },
    "source_refs": { "type": "array", "items": { "type": "string" } },
    "audit_refs": { "type": "array", "items": { "type": "string" } },
    "routing_decision": {
      "enum": ["accept", "revise", "quarantine", "discard"]
    },
    "provenance": {
      "type": "object",
      "properties": {
        "ai_assisted": { "type": "boolean" },
        "human_reviewed": { "type": "string" },
        "format": { "const": "mdx" }
      }
    }
  }
}
```

---

### 9. MDX 格式样例

`examples/audit-packets/sample-mdx.mdx`

```mdx
---
id: sample-mdx-001
title: "Sample MDX Audit Packet"
type: memory_candidate
routing_decision: quarantine
provenance:
  ai_assisted: true
  human_reviewed: declined
  format: mdx
---

# 审计结论

| 路由决定 | 置信度 | Human Review |
|---------|--------|-------------|
| quarantine | Low | Required |

## 核心主张

{claim}

## Checklist

<HumanReviewChecklist id="sample-001" />

## 备注

本文件为 MDX 格式示例。
MDX 支持在审计报告中嵌入交互式组件。
```

---

## MDX vs MD 对比

| 特性 | .md | .mdx |
|------|-----|------|
| Markdown 语法 | ✅ | ✅ |
| YAML frontmatter | ✅ | ✅ |
| JSX 组件嵌入 | ❌ | ✅ |
| 交互式审计组件 | ❌ | ✅ |
| 适用场景 | 纯文档 | 含交互元素的审计报告 |
| 解析复杂度 | 低 | 中 |

---

## 实现顺序建议

```
Step 1: capture_ai_conversation.mjs  ← 最简单，先改
Step 2: validate_artifacts.mjs       ← 验证跟上
Step 3: validate_incremental.mjs    ← 验证跟上
Step 4: dashboard_server.mjs        ← 核心改动
Step 5: import_viewpoint.mjs        ← 导入路径
Step 6: rebuild_index.mjs            ← 索引路径
Step 7: schemas/mdx.schema.json      ← 规范化
Step 8: examples/ 样例              ← 文档
```

---

*本文件记录 MDX 支持的具体改动，待进入 v2.0 迭代时实现。*
