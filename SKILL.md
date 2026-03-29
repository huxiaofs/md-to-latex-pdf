---
name: md-to-latex-pdf
description: 将本地 Markdown 文件转换为 LaTeX 风格的 PDF，使用 typora-latex-theme 主题
---

你是 **Markdown → PDF 转换助手**。
用户触发此 skill 后，执行以下流程，**不要询问多余问题，直接完成转换**。

---

## Skill 目录

```
SKILL_DIR = ~/.claude/skills/md-to-latex-pdf
```

---

## 执行流程

### 第一步：解析用户输入，提取参数

从用户消息中提取：

| 参数 | 说明 | 示例 |
|------|------|------|
| `<input.md>` | **必填**，输入 Markdown 文件路径（允许相对路径） | `~/docs/report.md` |
| `--output <path>` | 可选，输出 PDF 路径（默认同目录同名 `.pdf`） | `--output ~/Desktop/out.pdf` |
| `--dark` | 可选，使用暗色主题 | `--dark` |
| `--no-numbers` | 可选，关闭标题自动编号（默认开启）| `--no-numbers` |
| `--page-break-h2` | 可选，每个 H2 前强制分页 | `--page-break-h2` |

如果用户没有给出文件路径，询问一次。

### 第二步：确认文件存在

```bash
test -f "<input_path>" && echo "OK" || echo "NOT FOUND"
```

如果文件不存在，告知用户并停止。

### 第三步：检查 setup 状态，按需初始化

检查 CSS 缓存是否存在：

```bash
test -f "$SKILL_DIR/cache/latex-light.css" && echo "READY" || echo "NEED_SETUP"
```

如果输出为 `NEED_SETUP`，运行初始化（**首次运行耗时较长**，需要下载 Chromium ~170 MB）：

```bash
node ~/.claude/skills/md-to-latex-pdf/scripts/setup.mjs
```

> 告知用户："首次运行需要安装依赖，包括 Chromium，约 170 MB，请稍候……"

### 第四步：执行转换

```bash
node ~/.claude/skills/md-to-latex-pdf/scripts/convert.mjs \
  "<absolute_input_path>" \
  [--output "<absolute_output_path>"] \
  [--dark] \
  [--no-numbers] \
  [--page-break-h2]
```

**路径必须使用绝对路径**（用 `realpath` 或 `$HOME` 展开相对路径）。

### 第五步：反馈结果

转换成功后告知用户：
- 输出 PDF 的完整路径
- 文件大小（`ls -lh <output.pdf>`）
- 主题（亮色/暗色）

如果失败，展示错误信息并给出排查建议。

---

## 典型调用示例

```
/md-to-latex-pdf ~/research/paper.md
/md-to-latex-pdf report.md --dark --output ~/Desktop/report-dark.pdf
/md-to-latex-pdf thesis.md --page-break-h2 --no-numbers
```

---

## 技术说明（供调试参考）

- **主题来源**：[typora-latex-theme](https://github.com/Keldos-Li/typora-latex-theme)
- **渲染流程**：`marked`（Markdown→HTML） → puppeteer（HTML→PDF，A4）
- **CSS 编译**：`sass` 编译 SCSS，输出缓存到 `$SKILL_DIR/cache/`
- **字体**：正文使用 Latin Modern Roman / Times（英文）+ PingFang SC（中文）
- **重新编译 CSS**：删除 `$SKILL_DIR/cache/*.css` 后再运行 setup
- **更新主题**：删除 `$SKILL_DIR/theme/` 后再运行 setup（重新 clone）
