# md-to-latex-pdf

一个 [Claude Code](https://claude.ai/code) Skill，将本地 Markdown 文件渲染为 **LaTeX 风格的高质量 PDF**。

- 排版样式来自 [typora-latex-theme](https://github.com/Keldos-Li/typora-latex-theme)（仿 LaTeX 论文排版）
- 数学公式由 **MathJax v3 server-side SVG** 渲染，效果与 `pdflatex` 默认字体完全一致
- 使用 Puppeteer（Chromium）生成 PDF，无需安装 LaTeX 发行版

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| LaTeX 风格排版 | Latin Modern Roman 字体、A4 页面、自动章节编号（1 / 1.1 / 1.1.1） |
| 数学公式 | MathJax v3 SVG 渲染，支持 `$...$`、`$$...$$`，支持 `amsmath`、`physics` 等完整宏包 |
| 中文支持 | macOS 下自动使用 PingFang SC / Songti SC |
| GFM 完整支持 | 表格、代码块、删除线、脚注 |
| YAML front matter | 自动解析 `title` / `author` / `date` 并渲染为标题块 |
| 亮色 / 暗色主题 | `--dark` 切换暗色主题 |
| 章节编号控制 | `--no-numbers` 关闭自动编号 |
| 强制分页 | `--page-break-h2` 每个 H2 前分页 |

---

## 🔧 环境要求

- macOS（主题 CSS 针对 macOS 字体编译；其他系统可修改 `setup.mjs` 中的 `$os`）
- Node.js ≥ 18
- Git

> 首次运行会自动安装 Puppeteer（含 Chromium，约 170 MB，一次性下载）和其他依赖。

---

## 📦 安装

### 1. 克隆到 Claude Code Skill 目录

```bash
git clone https://github.com/jiangchaoyong/md-to-latex-pdf \
  ~/.claude/skills/md-to-latex-pdf
```

### 2. 运行初始化脚本（首次运行）

```bash
node ~/.claude/skills/md-to-latex-pdf/scripts/setup.mjs
```

初始化过程：
1. 从 GitHub 拉取 [typora-latex-theme](https://github.com/Keldos-Li/typora-latex-theme) 源码
2. 用 `sass` 编译主题 CSS（亮色 + 暗色）
3. 安装 Node.js 依赖（`marked`、`mathjax-full`、`puppeteer`）

---

## 🚀 使用方式

在 Claude Code 中直接调用：

```
/md-to-latex-pdf ~/research/paper.md
/md-to-latex-pdf report.md --output ~/Desktop/report.pdf
/md-to-latex-pdf thesis.md --dark
/md-to-latex-pdf notes.md --page-break-h2 --no-numbers
```

也可以直接运行脚本：

```bash
node ~/.claude/skills/md-to-latex-pdf/scripts/convert.mjs \
  path/to/input.md \
  [--output path/to/output.pdf] \
  [--dark] \
  [--no-numbers] \
  [--page-break-h2]
```

### 选项说明

| 选项 | 说明 |
|------|------|
| `--output <path>` | 指定输出 PDF 路径（默认：与输入文件同目录，同名 `.pdf`） |
| `--dark` | 使用暗色主题 |
| `--no-numbers` | 关闭标题自动编号（默认开启） |
| `--page-break-h2` | 每个 H2 前强制分页 |

---

## 📄 Markdown 示例

```markdown
---
title: 示例文档
author: 张三
date: 2026-03-29
---

# 示例文档

## 引言

行内公式：$e^{i\pi} + 1 = 0$

## 推导

展示公式：

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\, dx
$$
```

---

## 🏗️ 项目结构

```
md-to-latex-pdf/
├── SKILL.md          # Claude Code skill 定义
├── scripts/
│   ├── package.json  # Node.js 依赖声明
│   ├── setup.mjs     # 初始化脚本（首次运行）
│   └── convert.mjs   # Markdown → PDF 转换主脚本
├── cache/            # 编译好的主题 CSS（由 setup.mjs 生成，已 .gitignore）
└── theme/            # typora-latex-theme 源码（由 setup.mjs 拉取，已 .gitignore）
```

---

## 🙏 致谢

本项目的 PDF 排版样式完全来自以下优秀开源项目：

### [typora-latex-theme](https://github.com/Keldos-Li/typora-latex-theme)

> A latex-style theme for Typora Markdown editor.

由 [@Keldos-Li](https://github.com/Keldos-Li) 创作，提供了精美的仿 LaTeX 论文排版 CSS 主题，是本项目视觉效果的核心基础。如果你觉得本项目的排版好看，请务必给原项目一个 ⭐。

### [MathJax](https://github.com/mathjax/MathJax)

> Beautiful and accessible math in all browsers.

提供高质量的数学公式服务端 SVG 渲染，输出效果与 `pdflatex` + Computer Modern 字体完全一致。

### [Puppeteer](https://github.com/puppeteer/puppeteer)

提供基于 Chromium 的 HTML → PDF 渲染能力。

---

## 📜 License

MIT
