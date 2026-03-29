---
title: 效果演示文档
author: huxiaofs
date: 2026-03-29
---

# 效果演示文档

本文档用于展示 **md-to-latex-pdf** 的排版效果，涵盖数学公式、中英文混排、代码块、表格等常见学术写作场景。

## 数学公式

### 行内公式

设随机变量 $X \sim \mathcal{N}(\mu, \sigma^2)$，其概率密度函数为 $f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$。

当 $n \to \infty$ 时，由中心极限定理知 $\frac{\bar{X} - \mu}{\sigma / \sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1)$。

### 展示公式

傅里叶变换与逆变换互为对偶：

$$
\hat{f}(\xi) = \int_{-\infty}^{+\infty} f(x)\, e^{-2\pi i x \xi}\, \mathrm{d}x, \qquad
f(x) = \int_{-\infty}^{+\infty} \hat{f}(\xi)\, e^{2\pi i x \xi}\, \mathrm{d}\xi
$$

梯度下降的参数更新规则（$\eta$ 为学习率）：

$$
\theta_{t+1} = \theta_t - \eta \nabla_{\theta} \mathcal{L}(\theta_t)
$$

注意力机制（Transformer 核心）：

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V
$$

矩阵的奇异值分解（SVD）：

$$
\mathbf{A} = \mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^\top, \quad
\boldsymbol{\Sigma} = \mathrm{diag}(\sigma_1, \sigma_2, \ldots, \sigma_r), \quad \sigma_1 \geq \sigma_2 \geq \cdots \geq \sigma_r > 0
$$

## 中英文混排

深度学习（*Deep Learning*）的兴起使大规模语言模型（Large Language Model，LLM）成为自然语言处理领域的主流范式。以 Transformer 架构为基础，GPT、BERT 等模型通过在海量语料上进行预训练，习得了丰富的语言知识与推理能力。

> 我们所面临的最重要问题，无法在产生这些问题的思维层次上得到解决。
>
> — Albert Einstein

## 表格

**表 1　主流大语言模型参数规模对比**

| 模型 | 机构 | 参数量 | 开源 |
|------|------|--------|------|
| GPT-4 | OpenAI | 未公开 | ✗ |
| Claude 3 Opus | Anthropic | 未公开 | ✗ |
| Llama 3 70B | Meta | 70B | ✓ |
| Qwen2.5 72B | 阿里巴巴 | 72B | ✓ |
| DeepSeek-V3 | DeepSeek | 671B (MoE) | ✓ |

## 代码块

以下是一个用 Python 实现 softmax 函数的示例：

```python
import numpy as np

def softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    """数值稳定的 softmax 实现。"""
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / e_x.sum(axis=axis, keepdims=True)

# 示例
logits = np.array([2.0, 1.0, 0.1])
probs = softmax(logits)
print(f"概率分布: {probs}")   # [0.659, 0.242, 0.099]
```

## 列表

主要的模型压缩技术包括：

1. **量化（Quantization）**：将浮点权重压缩为低比特整数（INT8 / INT4）
   - 训练后量化（PTQ）：直接对已训练模型施加量化
   - 量化感知训练（QAT）：在训练过程中模拟量化误差
2. **剪枝（Pruning）**：移除冗余权重或结构单元
   - 非结构化剪枝：逐元素稀疏化
   - 结构化剪枝：移除整个注意力头或 FFN 层
3. **知识蒸馏（Knowledge Distillation）**：以大模型为教师指导小模型学习

## 引用与脚注

Vaswani 等人于 2017 年提出的 Transformer 架构[^1]彻底改变了序列建模范式，此后涌现出的 BERT[^2]、GPT 系列等模型均以此为基础。

[^1]: Vaswani, A., et al. (2017). Attention is all you need. *NeurIPS*.
[^2]: Devlin, J., et al. (2019). BERT: Pre-training of deep bidirectional transformers. *NAACL*.
