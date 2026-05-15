# RELEASE-SYNC-PROTOCOL.md

> 版本发布时的文档同步规范
> Provenance: `[HUMAN_ONLY]`
> Date: 2026-05-12
> 适用范围：所有 x.y.z 版本发布

---

## 原则

每次版本发布，必须同步更新以下文件。未同步 = 发布不完整。

| 优先级 | 文件 | 原因 |
|---|---|---|
| P0 | `README.md` + `README.en.md` | 用户第一眼 |
| P0 | `docs/ITERATION-GUIDE-{version}.md` | 版本专属交接文档 |
| P0 | `docs/ITERATION-GUIDE-LATEST.md` | 指向当前版本 |
| P0 | `package.json`（version 字段） | npm 发布的依据 |
| P1 | `CHANGELOG.md` | 变更历史 |
| P1 | `config/project-meta.json`（如有） | 项目元数据 |
| P2 | GitHub Release notes | 外部 changelog |
| P2 | `config/methods.json`（如有） | 能力描述 |
| P2 | `config/mercury-capabilities.json`（如有） | 能力清单 |

---

## 同步检查清单（每次发布必填）

### P0 — 必须同步

- [ ] `package.json` 中的 `version` 字段已更新
- [ ] `README.md` 顶部 `Version: {version}` 已更新
- [ ] `README.en.md` 顶部 `Version: {version}` 已更新
- [ ] `README.md` 中 `Latest release:` 链接已指向新 release URL
- [ ] `README.en.md` 中 `Latest release:` 链接已指向新 release URL
- [ ] `docs/ITERATION-GUIDE-{version}.md` 已创建（包含本次变更、债务、下一步）
- [ ] `docs/ITERATION-GUIDE-LATEST.md` 中 `Current Version` 已更新

### P1 — 应当同步

- [ ] `CHANGELOG.md` 顶部已追加 `{version}` 条目
- [ ] provenance 声明中的 `audit_ref` 指向新文档

### P2 — 建议同步

- [ ] GitHub Release 已创建（包含完整变更说明）
- [ ] GitHub Tag 已推送

---

## 版本号规则

遵循 [Semantic Versioning](https://semver.org/)：

| 变更类型 | 版本格式 | 示例 |
|---|---|---|
| Bug 修复，不影响 API | Patch | `2.1.0 → 2.1.1` |
| 新功能，API 向下兼容 | Minor | `2.1.0 → 2.2.0` |
| API 破坏性变更 | Major | `2.x.x → 3.0.0` |

---

## ITERATION-GUIDE-{version}.md 必须包含的内容

每次版本必须新建文档，包含以下五个章节：

```markdown
## 本版本背景
## 本版本完成的内容
## 本版本未完成的内容（已知债务）
## 接续开发检查清单
## Provenance
```

结构参考：`docs/ITERATION-GUIDE-2.1.0.md`

---

## 版本同步脚本（手动触发）

发布前，在本地执行：

```powershell
# 1. 确认所有改动已 commit
git status

# 2. 运行完整验证（必须全绿）
npm run test
npm run validate:incr
npm run release:gate

# 3. 创建版本 tag
git tag -a v{version} -m "Release v{version}"

# 4. 推送
git push origin main
git push origin v{version}

# 5. 确认 GitHub
gh release create v{version} --repo peeptime/GlimpseGate-admission-lab --title "v{version}"
```

---

## Provenance 声明规则

每次发布的 provenance 必须同步更新：

```yaml
provenance:
  authors: project_owner + AI_assistant（本次有 AI 参与则填）
  ai_assisted: true | false
  human_reviewed: declined | true
  reviewer: project_owner_pending（若 human_reviewed: true，填真实 reviewer 名）
  audit_ref: docs/ITERATION-GUIDE-{version}.md
```

> 如果 AI 参与了本次版本的任何代码或文档，必须在 provenance 中声明。
> 这是 Mercury 方法论的核心约束：不允许没声明的 AI 参与。

---

## 常见遗漏点

| 遗漏项 | 影响 |
|---|---|
| README 版本号忘记更新 | 用户看到的版本与实际不符 |
| GitHub Release 没创建 | GitHub 首页看不到最新版本 |
| ITERATION-GUIDE-LATEST.md 没更新 | 下次迭代的人找不到最新交接文档 |
| provenance 的 `audit_ref` 指向旧文档 | 审计链路断裂 |
| `package.json` version 没改 | npm 发布时版本号错误 |

---

## 关联文档

- `docs/GOVERNANCE.md` — 项目治理原则
- `docs/METHODOLOGY-INTEGRITY.md` — provenance 完整性规则
- `docs/ITERATION-GUIDE-LATEST.md` — 当前版本最新交接文档
