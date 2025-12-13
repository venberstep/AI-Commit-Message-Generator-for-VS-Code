import * as vscode from 'vscode';

// 中文提示词 - 精简版
const PROMPT_ZH = `根据 git diff 生成 Conventional Commits 规范的提交信息。

要求:
- Header: <type>(<scope>): <中文描述，50字内，祈使语气，无句号>
- Body: 必须包含，用 - 列表说明修改原因和逻辑
- 忽略纯格式化变动（除非是 style 类型）
- 识别 Breaking Change 并标注
- 仅输出提交信息，不要代码块或解释`;

// 英文提示词 - 精简版
const PROMPT_EN = `Generate a Conventional Commits message from the git diff.

Requirements:
- Header: <type>(<scope>): <English, max 50 chars, imperative, no period>
- Body: Required, use - bullets for "why" and "what changed"
- Ignore whitespace-only changes (unless style type)
- Mark Breaking Changes per spec
- Output ONLY the commit message, no code blocks or explanation`;

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
