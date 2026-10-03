# 互动站合集

把原先分散在四个 GitHub Pages 仓库的静态站合并成**一个 React 应用**，顶部导航可互相跳转。

| 路由 | 内容 | 来源仓库 |
|------|------|----------|
| `/` | 门户首页 | 新增 |
| `#/diagrams` | 西游图谱 — 56 章 mermaid 势力/流程图 | [xiyou-diagrams](https://github.com/wnma3mz/xiyou-diagrams) |
| `#/qa` | 西游·启示录 — 326 条问答 | [xiyou_qa](https://github.com/wnma3mz/xiyou_qa) |
| `#/dee` | 狄仁杰探案 — 38 起案件 | [detective_dee_game](https://github.com/wnma3mz/detective_dee_game) |
| `#/crossword` | 成语填词 — 交叉填字 | [crossword_puzzle](https://github.com/wnma3mz/crossword_puzzle) |

## 合并时做的三件事

**1. crossword 去后端化**
原项目的填字题由 FastAPI 后端（`backend/puzzle.py`）实时生成，GitHub Pages 托管不了。
已把 `puzzle.py` 完整移植为 `src/apps/crossword/generator.ts`，前端改为浏览器本地出题，
不再依赖任何 API。移植正确性由 `generator.test.ts` 覆盖（答案网格、空格答案、越界、成语逐字一致性）。

**2. 样式隔离**
四个 app 各自带一份全局 CSS（`body` / `:root` / `.header` / `.title` 等类名互相冲突）。
`ScopedStyle` 组件把 CSS 以字符串注入 `<style>`，随路由卸载一并移除，因此切换页面时样式不会串。

**3. 路由懒加载**
`React.lazy` 按路由分包，进入首页不会下载 mermaid（887 KB）和 326 条问答数据。

另外 `DeepApp.tsx` 里去掉了 `import './styles.css'`，改由 `ScopedStyle` 统一注入。

## 开发

```bash
npm install
npm run dev        # 本地开发
npm run check      # 测试 + 类型检查 + 构建（CI 用）
npm run preview    # 预览构建产物
```

## 目录

```
src/
  App.tsx              HashRouter + 路由表
  base.css             hub 外壳样式（导航条、首页卡片）
  components/
    HubNav.tsx         顶部导航 + app 元数据
    ScopedStyle.tsx    CSS 注入/卸载，实现样式隔离
  apps/
    home/              门户首页
    diagrams/          图谱（chapters.json + MermaidDiagram）
    qa/                问答（qa_data.json）
    dee/               探案（data/cases*.ts）
    crossword/         填词（generator.ts + idioms.json）
```

## 部署

`.github/workflows/deploy.yml` 在 push 到 `main` 时构建并发布到 GitHub Pages。
CI 会把 `VITE_BASE_PATH` 设成仓库名，所以仓库改名字也能正常部署。

新仓库设置：Settings → Pages → Source 选 **GitHub Actions**。

> 用的是 `HashRouter`（`/#/xxx`）而不是 `BrowserRouter`，因为 GitHub Pages 不做 SPA
> 回退，`/diagrams` 这种路径直接访问会 404，hash 路由没这个问题。