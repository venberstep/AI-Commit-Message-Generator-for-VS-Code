// The module 'vscode' contains the VSCode extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { provider } from './provider';
import { getGitDiff } from './git';
import { generateCommitMessage, type APIProvider } from './api';

// 语言判定: VSCode 的 UI 语言是否为中文 (zh*)
const isChinese = (): boolean => {
	const lang = (vscode.env.language || '').toLowerCase();
	return lang === 'zh' || lang.startsWith('zh-');
};

// 消息字典: 中文/英语（其他语言默认为英语）
const M = {
	outputChannel: () => (isChinese() ? 'commit message gene' : 'commit message gene'), // 固有名词通用
	status: {
		generating: () => (isChinese() ? '$(sync~spin) $(sparkle-filled)正在生成提交消息$(sparkle-filled)' : '$(sync~spin) Generating commit message...'),
		generatingTip: () => (isChinese() ? '正在生成 Commit Message' : 'Generating commit message'),
	},
	commitArea: {
		copiedGitApi: () => (isChinese() ? '[已转录到提交消息栏: git API]' : '[Committed message pasted: git API]'),
		copiedScm: () => (isChinese() ? '[已转录到提交消息栏: scm.inputBox]' : '[Committed message pasted: scm.inputBox]'),
		warnNoAccess: () => (isChinese() ? '[警告] 无法访问提交消息栏' : '[Warn] Could not access commit message box'),
		errorSet: (e: any) => (isChinese() ? `[错误] 设置提交消息失败: ${e?.message ?? e}` : `[Error] Failed to set commit message: ${e?.message ?? e}`),
		copiedDone: () => (isChinese() ? '\n[已将提交消息转录到输入栏]' : '\n[Commit message pasted into input]'),
		noDiff: () => (isChinese() ? '[信息] 未检测到暂存区更改。' : '[Info] No staged changes detected.'),
	},
	apiConfig: {
		selectProvider: () => (isChinese() ? '请选择 API 提供者' : 'Select API Provider'),
		selectProviderTip: () => (isChinese() ? '选择一个 AI API 提供者' : 'Choose an AI API provider'),
		configureSettings: () => (isChinese() ? '配置设置' : 'Configure Settings'),
		openSettings: () => (isChinese() ? '打开设置' : 'Open Settings'),
	},
};

// 当扩展被激活时调用此方法
export function activate(context: vscode.ExtensionContext) {
	// 状态栏
	let statusItem: vscode.StatusBarItem | undefined;

	// 安全设置提交消息到输入框的辅助函数
	async function setCommitMessage(message: string, output: vscode.OutputChannel) {
		try {
			// 激活 SCM 视图
			await vscode.commands.executeCommand('workbench.view.scm');
			// 获取 git 扩展的 API（如果存在）
			const gitExt = vscode.extensions.getExtension('vscode.git');
			if (gitExt) {
				const exportsAny = gitExt.isActive ? (gitExt.exports as any) : await gitExt.activate();
				// 如果是 GitExtension 格式则通过 getAPI(1) 获取，如果是 API 则直接使用
				const gitApi = typeof exportsAny?.getAPI === 'function' ? exportsAny.getAPI(1) : exportsAny;
				// 如果第一个仓库有 inputBox，则设置到那里
				const repos = (gitApi?.repositories ?? []) as any[];
				if (repos.length > 0 && repos[0]?.inputBox) {
					repos[0].inputBox.value = message;
					output.appendLine(M.commitArea.copiedGitApi());
					return;
				}
			}
			// 回退: scm.inputBox
			const scmAny = vscode.scm as any;
			if (scmAny && scmAny.inputBox) {
				scmAny.inputBox.value = message;
				output.appendLine(M.commitArea.copiedScm());
				return;
			}
			output.appendLine(M.commitArea.warnNoAccess());
		} catch (e: any) {
			output.appendLine(M.commitArea.errorSet(e));
		}
	}

	const SECRET_KEY = 'ai-commit-message.apiKey';

	// 获取或提示输入 API Key
	async function getApiKey(): Promise<string | undefined> {
		// 1. 尝试从安全存储获取
		let apiKey = await context.secrets.get(SECRET_KEY);
		if (apiKey) {
			return apiKey;
		}

		// 2. 如果没有，弹窗提示输入
		const input = await vscode.window.showInputBox({
			prompt: isChinese() ? '请输入您的 API Key（将安全存储）' : 'Enter your API Key (will be stored securely)',
			password: true,
			placeHolder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
			ignoreFocusOut: true
		});

		if (input) {
			await context.secrets.store(SECRET_KEY, input);
			vscode.window.showInformationMessage(isChinese() ? 'API Key 已安全保存！' : 'API Key saved securely!');
			return input;
		}

		return undefined;
	}

	// 检查或提示配置 API 设置
	async function ensureAPIConfigured(): Promise<boolean> {
		const config = vscode.workspace.getConfiguration('ai-commit-message');
		const provider = config.get<string>('apiProvider', 'openai');
		const apiUrl = config.get<string>('apiUrl');
		const model = config.get<string>('model');

		// 如果任何配置缺失，提示用户
		if (!apiUrl || !model) {
			const selection = await vscode.window.showWarningMessage(
				isChinese()
					? 'AI Commit Message 需要配置 API 提供者'
					: 'AI Commit Message needs API configuration',
				M.apiConfig.configureSettings()
			);

			if (selection === M.apiConfig.configureSettings()) {
				await vscode.commands.executeCommand('workbench.action.openSettings', 'ai-commit-message');
				return false;
			}
		}

		return true;
	}

	// 清除 API Key 命令
	const clearKeyCmd = vscode.commands.registerCommand('ai-commit-message.clearApiKey', async () => {
		await context.secrets.delete(SECRET_KEY);
		vscode.window.showInformationMessage(isChinese() ? 'API Key 已清除！' : 'API Key cleared!');
	});
	context.subscriptions.push(clearKeyCmd);

	const disposable = vscode.commands.registerCommand(provider.commandId, async () => {
		const output = vscode.window.createOutputChannel(M.outputChannel());
		output.show(true);

		const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspacePath) {
			output.appendLine(isChinese() ? '未找到工作区文件夹。' : 'No workspace folder found.');
			return;
		}

		// 检查 API 配置
		const configured = await ensureAPIConfigured();
		if (!configured) {
			return;
		}

		// 获取 API Key
		const apiKey = await getApiKey();
		if (!apiKey) {
			output.appendLine(isChinese() ? '未提供 API Key，操作已取消。' : 'No API Key provided, operation cancelled.');
			return;
		}

		if (!statusItem) {
			statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
		}
		statusItem.text = M.status.generating();
		statusItem.tooltip = M.status.generatingTip();
		statusItem.show();

		try {
			// 1. 获取 Git Diff
			const diff = await getGitDiff(workspacePath);
			if (!diff || !diff.trim()) {
				output.appendLine(M.commitArea.noDiff());
				statusItem.hide();
				return;
			}

			// 2. 调用 API 生成消息
			const locale = isChinese() ? 'zh' : 'en';
			const commitMsg = await generateCommitMessage(diff, locale, apiKey);

			// 3. 设置提交消息
			if (commitMsg) {
				output.appendLine(isChinese() ? '生成的消息:' : 'Generated Message:');
				output.appendLine(commitMsg);
				await setCommitMessage(commitMsg, output);
				output.appendLine(M.commitArea.copiedDone());
			} else {
				output.appendLine(isChinese() ? '未能从 API 响应中提取提交消息。' : 'Failed to extract commit message from API response.');
			}

		} catch (error: any) {
			output.appendLine(isChinese() ? `错误: ${error.message}` : `Error: ${error.message}`);
			// 如果API返回401，可能是Key无效，提示重新输入
			if (error.message.includes('401') || error.message.includes('Unauthorized')) {
				const retryBtn = isChinese() ? '重新输入 API Key' : 'Re-enter API Key';
				const selection = await vscode.window.showErrorMessage(
					isChinese() ? 'API Key 无效或已过期' : 'API Key is invalid or expired',
					retryBtn
				);
				if (selection === retryBtn) {
					await context.secrets.delete(SECRET_KEY);
					vscode.commands.executeCommand(provider.commandId);
				}
			} else {
				vscode.window.showErrorMessage(error.message);
			}
		} finally {
			statusItem.hide();
		}
	});

	context.subscriptions.push(disposable);
}

// 当扩展被停用时调用此方法
export function deactivate() { }
