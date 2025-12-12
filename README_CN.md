[English README](README.md) | [日本語版 README](README.ja.md)

[![Version](https://img.shields.io/badge/version-v1.0.0-4094ff.svg)](https://marketplace.visualstudio.com/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
![Platform](https://img.shields.io/badge/Platform-Windows_%7C_macOS_%7C_Linux-6479ff.svg)


# AI Commit Message Generator for VS Code

一个 VS Code 扩展，可以根据仓库的更改自动生成 Conventional Commits 风格的提交消息，并将其插入到源代码管理的输入框中。
它使用兼容 OpenAI 标准的 API（OpenAI, Azure, 本地 LLM 等）来生成消息。

> **注意**: 本项目基于 [vscode_extension_commit_message_gene_by_gemini_cli](https://github.com/komiyamma/vscode_extension_commit_message_gene_by_gemini_cli)（作者：komiyamma）二次开发。

## 配置

### API Key（安全存储）

首次使用时，扩展会弹窗提示您输入 API Key。密钥将安全存储在 VS Code 的密钥存储中。

- 清除已保存的 API Key：运行命令 `AI: Clear API Key`

### 其他设置

打开 VS Code 设置 (`Ctrl+,`) 并搜索 `ai-commit-message`：

- **Api Url**: 基础 URL (默认: `https://api.openai.com/v1/chat/completions`)
- **Model**: 模型名称 (默认: `gpt-3.5-turbo`)

## 如何使用

1. 在 Git 中暂存您的更改
2. 点击源代码管理标题栏中的魔杖图标 ($(wand))，或运行命令 `AI: Generate Commit Message`
3. 如果是首次使用，在提示时输入您的 API Key
4. 生成的提交消息将自动插入

## 命令

| 命令 | 描述 |
|------|------|
| `AI: Generate Commit Message` | 根据暂存的更改生成提交消息 |
| `AI: Clear API Key` | 清除已保存的 API Key |

## 要求

- 启用了内置的 VS Code Git 扩展
- 可访问配置的 API 的网络连接

## 许可证

MIT License
