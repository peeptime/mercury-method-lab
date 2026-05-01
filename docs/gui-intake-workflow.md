# GUI Intake Workflow

## 中文摘要

GUI 入库入口是“先存储，再判断”的材料投递箱。

用户不需要先写标题、分类、路由或需求说明。用户只需要粘贴整段文本、上传图片或上传文档；系统负责保存原始输入、生成队列信封、产出第一版干净陈述，并把结果直接展示给用户。

核心交互要求：

- 提交后必须立即看到结论区，不能让用户去内部列表里找结果
- 文本和可读文档应进入初步判断，二进制文件先稳定存储
- 标题、路由、下一步和系统追问由系统生成
- 本入口面向普通用户，也要能被 OpenClaw、Hermes 等智能体直接利用

## Product Rule

The GUI intake is a storage-first material dropbox.

Users should not be asked to classify material before storage. They can paste text, attach files, or do both. The system handles naming, storage, first routing, and the first clean response.

## Expected User Flow

1. User opens `http://127.0.0.1:4788/#submit`.
2. User pastes a full paragraph or attaches a document.
3. User clicks `Store and run intake`.
4. The system stores the material under `submissions/inbox/`.
5. The system creates an agent queue envelope under `submissions/agent-queue/`.
6. The system creates a raw artifact under `00_raw/`.
7. The GUI immediately shows:
   - clean statement
   - route
   - next step
   - raw artifact path
   - system questions

## Interaction Requirement

After submission, the user must see a visible result without hunting through internal tables.

Implementation rule:

- preserve the last intake result in UI state
- re-render it after overview refresh
- scroll the result panel into view
- show a top status message when the result is ready

## Current File Support

Text is extracted immediately from:

- `.md`
- `.txt`
- `.json`
- `.jsonl`
- `.csv`
- `.tsv`
- `.yaml`
- `.yml`
- `.xml`
- `.html`
- `.css`
- `.js`
- `.mjs`
- `.ts`
- `.tsx`

Images, PDF, Word, and other binary documents are stored first. Parsing, OCR, or conversion should happen in a later adapter.

## Test Case

Use `Z:/AI 202604/trae01/维度识别局限的表达.md` as a smoke test.

Expected result:

- title: `大模型维度突破与判别能力：长期储存版`
- route: `structural-judgment`
- result panel remains visible after refresh
- raw artifact is created under `00_raw/`
- agent envelope is created under `submissions/agent-queue/`
