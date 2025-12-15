import * as vscode from 'vscode';

// API 提供者类型
export type APIProvider = 'openai' | 'claude' | 'azure' | 'custom';

// API 提供者配置接口
interface APIProviderConfig {
    provider: APIProvider;
    apiUrl: string;
    model: string;
    apiKey: string;
}

// 中文提示词 - 精简版
const PROMPT_ZH = `将 git diff 中的所有修改整合为**一条**符合 Conventional Commits 规范的提交信息。

要求:
- Header: <type>(<scope>): <中文描述，50字内，祈使语气，无句号>
- 若修改涉及多个范围/模块，选择影响最大的作为 scope，或使用通用 scope
- Body: 必须包含，用 - 列表说明修改原因和逻辑
- 所有文件的修改必须合并到一个 Body 中，按逻辑分类而非按文件分组
- 忽略纯格式化变动（除非是 style 类型）
- 仅输出提交信息，不要代码块或解释`;

// 英文提示词 - 精简版
const PROMPT_EN = `Consolidate ALL changes in the git diff into **a single** Conventional Commits message.

Requirements:
- Header: <type>(<scope>): <English, max 50 chars, imperative, no period>
- If changes span multiple scopes, choose the most significant one or use a generic scope
- Body: Required, use - bullets for "why" and "what changed"
- Merge all file changes into ONE body, grouped by logic rather than by file
- Ignore whitespace-only changes (unless style type)
- Output ONLY the commit message, no code blocks or explanation`;

// 获取 API 提供者配置
function getAPIProviderConfig(): APIProviderConfig {
    const config = vscode.workspace.getConfiguration('ai-commit-message');
    const provider = config.get<string>('apiProvider', 'openai') as APIProvider;
    const apiUrl = config.get<string>('apiUrl', getDefaultApiUrl(provider));
    const model = config.get<string>('model', getDefaultModel(provider));
    const apiKey = config.get<string>('apiKey', '');

    return { provider, apiUrl, model, apiKey };
}

// 获取默认 API URL
function getDefaultApiUrl(provider: APIProvider): string {
    const defaultUrls: Record<APIProvider, string> = {
        'openai': 'https://api.openai.com/v1/chat/completions',
        'claude': 'https://api.anthropic.com/v1/messages',
        'azure': 'https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions',
        'custom': ''
    };
    return defaultUrls[provider];
}

// 获取默认模型
function getDefaultModel(provider: APIProvider): string {
    const defaultModels: Record<APIProvider, string> = {
        'openai': 'gpt-3.5-turbo',
        'claude': 'claude-3-5-sonnet-20241022',
        'azure': 'gpt-3.5-turbo',
        'custom': ''
    };
    return defaultModels[provider];
}

// Claude API 请求体格式
interface ClaudeRequest {
    model: string;
    max_tokens: number;
    system: string;
    messages: Array<{ role: string; content: string }>;
}

// OpenAI/Azure API 请求体格式
interface OpenAIRequest {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
}

// Claude API 响应体格式
interface ClaudeResponse {
    content: Array<{ type: string; text: string }>;
}

// OpenAI/Azure API 响应体格式
interface OpenAIResponse {
    choices: Array<{ message: { content: string } }>;
}

// 调用 Claude API
async function callClaudeAPI(
    systemPrompt: string,
    userMessage: string,
    apiUrl: string,
    model: string,
    apiKey: string
): Promise<string> {
    const body: ClaudeRequest = {
        model: model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
            { role: 'user', content: userMessage }
        ]
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as ClaudeResponse;
    const content = data.content?.[0]?.text?.trim() || '';

    // 清理可能的代码块标记
    let cleanContent = content;
    if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
    }

    return cleanContent.trim();
}

// 调用 OpenAI/Azure API
async function callOpenAICompatibleAPI(
    systemPrompt: string,
    userMessage: string,
    apiUrl: string,
    model: string,
    apiKey: string,
    provider: APIProvider
): Promise<string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Azure 使用不同的认证方式
    if (provider === 'azure') {
        headers['api-key'] = apiKey;
    } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body: OpenAIRequest = {
        model: model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Git Diff:\n${userMessage}` }
        ],
        temperature: 0.7
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as OpenAIResponse;
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    // 清理可能的代码块标记
    let cleanContent = content;
    if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
    }

    return cleanContent.trim();
}

export async function generateCommitMessage(diff: string, locale: string, apiKey: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('ai-commit-message');
    const provider = config.get<string>('apiProvider', 'openai') as APIProvider;
    const apiUrl = config.get<string>('apiUrl', getDefaultApiUrl(provider));
    const model = config.get<string>('model', getDefaultModel(provider));

    if (!apiKey) {
        throw new Error(locale === 'zh'
            ? 'API Key 未提供。'
            : 'API Key is not provided.');
    }

    const systemPrompt = locale === 'zh' ? PROMPT_ZH : PROMPT_EN;
    const userMessage = `Git Diff:\n${diff}`;

    try {
        if (provider === 'claude') {
            return await callClaudeAPI(systemPrompt, userMessage, apiUrl, model, apiKey);
        } else {
            return await callOpenAICompatibleAPI(systemPrompt, userMessage, apiUrl, model, apiKey, provider);
        }
    } catch (error: any) {
        throw new Error(locale === 'zh'
            ? `生成提交消息失败: ${error.message}`
            : `Failed to generate commit message: ${error.message}`);
    }
}
