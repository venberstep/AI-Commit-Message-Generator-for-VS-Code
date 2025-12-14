[中文版 README](README_CN.md)

[![Version](https://img.shields.io/badge/version-v1.0.0-4094ff.svg)](https://marketplace.visualstudio.com/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
![Platform](https://img.shields.io/badge/Platform-Windows_%7C_macOS_%7C_Linux-6479ff.svg)


# AI Commit Message Generator for VS Code

A VS Code extension that automatically generates Conventional Commits-style commit messages from repository changes and inserts them into the Source Control input box.
It supports multiple AI API providers including OpenAI, Claude, Azure OpenAI, and custom OpenAI-compatible endpoints.

> **Note**: This project is a fork of [vscode_extension_commit_message_gene_by_gemini_cli](https://github.com/komiyamma/vscode_extension_commit_message_gene_by_gemini_cli) by komiyamma.

## Features

- ✨ Generate commit messages using AI
- 🔄 Support multiple API providers: OpenAI, Claude, Azure OpenAI, custom endpoints
- 🌐 Multilingual support (Chinese & English)
- 🔐 Secure API Key storage using VS Code's secret storage
- 📋 Conventional Commits format compliance
- 🎯 Smart context awareness from git diff

## Configuration

### API Provider Selection

Open VS Code Settings (`Ctrl+,`) and search for `ai-commit-message`:

#### 1. **API Provider** (Default: `openai`)
   Choose your AI provider:
   - `openai` - OpenAI API (GPT models)
   - `claude` - Anthropic Claude API
   - `azure` - Azure OpenAI
   - `custom` - Custom OpenAI-compatible endpoint

#### 2. **API URL**
   The endpoint URL for your chosen provider:

   - **OpenAI**: `https://api.openai.com/v1/chat/completions`
   - **Claude**: `https://api.anthropic.com/v1/messages`
   - **Azure OpenAI**: `https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions`
   - **Custom**: Your custom endpoint URL

#### 3. **Model**
   Specify the model name:

   - **OpenAI**: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo-preview`, etc.
   - **Claude**: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307`, etc.
   - **Azure OpenAI**: Your deployed model name (e.g., `gpt-3.5-turbo`)

#### 4. **API Key** (Secure Storage)
   On first use, the extension will prompt you to enter your API Key. The key is stored securely in VS Code's secret storage.

   - To clear the saved API Key: Run command `AI: Clear API Key`

### Example Configurations

#### Using OpenAI GPT-4
```json
{
  "ai-commit-message.apiProvider": "openai",
  "ai-commit-message.apiUrl": "https://api.openai.com/v1/chat/completions",
  "ai-commit-message.model": "gpt-4"
}
```

#### Using Claude
```json
{
  "ai-commit-message.apiProvider": "claude",
  "ai-commit-message.apiUrl": "https://api.anthropic.com/v1/messages",
  "ai-commit-message.model": "claude-3-5-sonnet-20241022"
}
```

#### Using Azure OpenAI
```json
{
  "ai-commit-message.apiProvider": "azure",
  "ai-commit-message.apiUrl": "https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions",
  "ai-commit-message.model": "gpt-3.5-turbo"
}
```

## How to Use

1. Stage your changes in Git
2. Click the wand icon ($(wand)) in the Source Control title bar, or run command `AI: Generate Commit Message`
3. If this is your first time, enter your API Key when prompted
4. The generated commit message will be automatically inserted

## Commands

| Command | Description |
|---------|-------------|
| `AI: Generate Commit Message` | Generate a commit message from staged changes |
| `AI: Clear API Key` | Clear the saved API Key |

## Requirements

- Built-in VS Code Git extension is enabled
- Internet connection to access the configured API
- Valid API Key for your chosen provider

## API Key Requirements

- **OpenAI**: Get your API key from https://platform.openai.com/account/api-keys
- **Claude**: Get your API key from https://console.anthropic.com/
- **Azure OpenAI**: Get your API key from your Azure OpenAI resource
- **Custom Endpoint**: Follow your provider's authentication documentation

## License

MIT License
