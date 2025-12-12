export interface ProviderConfig {
  commandId: string;
  messages: {
    runError: (msg: string, locale: 'zh' | 'en') => string;
    closed: (code: number | null, locale: 'zh' | 'en') => string;
  };
}

// AI Commit Message Generator 配置
// 基于 https://github.com/komiyamma/vscode_extension_commit_message_gene_by_gemini_cli 二次开发
export const provider: ProviderConfig = {
  commandId: 'ai-commit-message.generate',
  messages: {
    runError: (msg, locale) =>
      locale === 'zh'
        ? `[API 执行错误]: ${msg}`
        : `[API run error]: ${msg}`,
    closed: (code, locale) =>
      locale === 'zh'
        ? `\n[已完成: code ${code}]`
        : `\n[Finished: code ${code}]`,
  },
};

