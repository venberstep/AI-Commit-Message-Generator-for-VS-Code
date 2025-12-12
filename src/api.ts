import * as vscode from 'vscode';

// 中文提示词 - 结构化 Conventional Commits 规范
const PROMPT_ZH = `# Role
你是一位资深的 Code Reviewer。你的任务是阅读 git diff，撰写符合 Conventional Commits 规范的 Git 提交信息。

# Task
分析代码变更的**业务意图**（不仅是语法变更），生成一段标准的提交信息文本。

# Constraints & Guidelines

1. **格式结构** (严格遵守):
   <type>(<scope>): <subject>

   <body>

   <footer> (可选，如 Closes #123)

2. **Header 要求**:
   - Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
   - Scope: (可选) 变更的模块/文件名
   - Subject: 中文，50字以内，祈使语气，结尾不要加句号

3. **Body 要求**:
   - 必须包含
   - 在 Header 下方空一行
   - 使用列表符 - 分条描述"为什么修改"及"修改了什么逻辑"

4. **内容原则**:
   - 忽略纯格式化（Whitespace）变动，除非是 style 类型
   - 识别 Breaking Change 并按规范标注

5. **输出要求**:
   - 仅输出提交信息文本本身
   - 不要包含 git commit 命令、引号、代码块符号或其他任何解释性文字`;

// 英文提示词
const PROMPT_EN = `# Role
You are a senior Code Reviewer. Your task is to read the git diff and write a Git commit message that conforms to the Conventional Commits specification.

# Task
Analyze the **business intent** of the code changes (not just syntax changes) and generate a standard commit message.

# Constraints & Guidelines

1. **Format Structure** (strictly follow):
   <type>(<scope>): <subject>

   <body>

   <footer> (optional, e.g., Closes #123)

2. **Header Requirements**:
   - Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
   - Scope: (optional) module/filename being changed
   - Subject: English, max 50 chars, imperative mood, no period at end

3. **Body Requirements**:
   - Must be included
   - Blank line after Header
   - Use - bullet points to describe "why" and "what logic changed"

4. **Content Principles**:
   - Ignore pure formatting (whitespace) changes unless it's a style type
   - Identify Breaking Changes and mark according to spec

5. **Output Requirements**:
   - Output ONLY the commit message text itself
   - Do NOT include git commit command, quotes, code block markers, or any explanatory text`;

export async function generateCommitMessage(diff: string, locale: string, apiKey: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('ai-commit-message');
    const apiUrl = config.get<string>('apiUrl', 'https://api.openai.com/v1/chat/completions');
    const model = config.get<string>('model', 'gpt-3.5-turbo');

    if (!apiKey) {
        throw new Error(locale === 'zh'
            ? 'API Key 未提供。'
            : 'API Key is not provided.');
    }

    const systemPrompt = locale === 'zh' ? PROMPT_ZH : PROMPT_EN;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Git Diff:\n${diff}` }
    ];

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content?.trim() || '';

        // 清理可能的代码块标记
        let cleanContent = content;
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
        }

        return cleanContent.trim();
    } catch (error: any) {
        throw new Error(locale === 'zh'
            ? `生成提交消息失败: ${error.message}`
            : `Failed to generate commit message: ${error.message}`);
    }
}
