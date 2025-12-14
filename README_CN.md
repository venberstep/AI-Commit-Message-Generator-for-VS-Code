[English README](README.md)

[![Version](https://img.shields.io/badge/version-v1.0.0-4094ff.svg)](https://marketplace.visualstudio.com/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
![Platform](https://img.shields.io/badge/Platform-Windows_%7C_macOS_%7C_Linux-6479ff.svg)


# AI Commit Message Generator for VS Code

一个 VS Code 扩展，可以根据仓库的更改自动生成 Conventional Commits 风格的提交消息，并将其插入到源代码管理的输入框中。
它支持多个 AI API 提供者，包括 OpenAI、Claude、Azure OpenAI 和自定义兼容 OpenAI 的端点。

> **注意**: 本项目基于 [vscode_extension_commit_message_gene_by_gemini_cli](https://github.com/komiyamma/vscode_extension_commit_message_gene_by_gemini_cli)（作者：komiyamma）二次开发。

## 功能特性

- ✨ 使用 AI 生成提交消息
- 🔄 支持多个 API 提供者：OpenAI、Claude、Azure OpenAI、自定义端点
- 🌐 多语言支持（中文和英文）
- 🔐 使用 VS Code 密钥存储安全存储 API Key
- 📋 符合 Conventional Commits 规范
- 🎯 从 git diff 进行智能上下文识别

## 配置

### API 提供者选择

打开 VS Code 设置 (`Ctrl+,`) 并搜索 `ai-commit-message`：

#### 1. **API 提供者** (默认值: `openai`)
   选择您的 AI 提供者：
   - `openai` - OpenAI API（GPT 系列模型）
   - `claude` - Anthropic Claude API
   - `azure` - Azure OpenAI
   - `custom` - 自定义 OpenAI 兼容端点

#### 2. **API URL**
   您所选提供者的端点 URL：

   - **OpenAI**: `https://api.openai.com/v1/chat/completions`
   - **Claude**: `https://api.anthropic.com/v1/messages`
   - **Azure OpenAI**: `https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions`
   - **自定义**: 您的自定义端点 URL

#### 3. **模型**
   指定模型名称：

   - **OpenAI**: `gpt-3.5-turbo`、`gpt-4`、`gpt-4-turbo-preview` 等
   - **Claude**: `claude-3-5-sonnet-20241022`、`claude-3-opus-20240229`、`claude-3-haiku-20240307` 等
   - **Azure OpenAI**: 您部署的模型名称（例如：`gpt-3.5-turbo`）

#### 4. **API Key**（安全存储）
   首次使用时，扩展会弹窗提示您输入 API Key。密钥将安全存储在 VS Code 的密钥存储中。

   - 清除已保存的 API Key：运行命令 `AI: Clear API Key`

### 配置示例

#### 使用 OpenAI GPT-4
```json
{
  "ai-commit-message.apiProvider": "openai",
  "ai-commit-message.apiUrl": "https://api.openai.com/v1/chat/completions",
  "ai-commit-message.model": "gpt-4"
}
```

#### 使用 Claude
```json
{
  "ai-commit-message.apiProvider": "claude",
  "ai-commit-message.apiUrl": "https://api.anthropic.com/v1/messages",
  "ai-commit-message.model": "claude-3-5-sonnet-20241022"
}
```

#### 使用 Azure OpenAI
```json
{
  "ai-commit-message.apiProvider": "azure",
  "ai-commit-message.apiUrl": "https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions",
  "ai-commit-message.model": "gpt-3.5-turbo"
}
```

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
- 您选择的提供者的有效 API Key

## API Key 获取方式

- **OpenAI**: 从 https://platform.openai.com/account/api-keys 获取 API key
- **Claude**: 从 https://console.anthropic.com/ 获取 API key
- **Azure OpenAI**: 从您的 Azure OpenAI 资源获取 API key
- **自定义端点**: 按照您的提供者的身份验证文档操作

## 许可证

MIT License
