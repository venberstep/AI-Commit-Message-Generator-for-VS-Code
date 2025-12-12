[中文版 README](README_CN.md) | [日本語版 README](README.ja.md)

[![Version](https://img.shields.io/badge/version-v1.0.0-4094ff.svg)](https://marketplace.visualstudio.com/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
![Platform](https://img.shields.io/badge/Platform-Windows_%7C_macOS_%7C_Linux-6479ff.svg)


# AI Commit Message Generator for VS Code

A VS Code extension that automatically generates Conventional Commits-style commit messages from repository changes and inserts them into the Source Control input box.
It uses OpenAI-compatible APIs (OpenAI, Azure, local LLMs, etc.) to generate messages.

> **Note**: This project is a fork of [vscode_extension_commit_message_gene_by_gemini_cli](https://github.com/komiyamma/vscode_extension_commit_message_gene_by_gemini_cli) by komiyamma.

## Configuration

### API Key (Secure Storage)

On first use, the extension will prompt you to enter your API Key. The key is stored securely in VS Code's secret storage.

- To clear the saved API Key: Run command `AI: Clear API Key`

### Other Settings

Open VS Code Settings (`Ctrl+,`) and search for `ai-commit-message`:

- **Api Url**: Base URL (default: `https://api.openai.com/v1/chat/completions`)
- **Model**: Model name (default: `gpt-3.5-turbo`)

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

## License

MIT License
