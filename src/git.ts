import { spawn } from 'child_process';
import * as path from 'path';

export async function getGitDiff(folderPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // First try to get staged changes
        const staged = spawn('git', ['diff', '--cached'], { cwd: folderPath });
        let stdout = '';
        let stderr = '';

        staged.stdout.on('data', (data) => stdout += data);
        staged.stderr.on('data', (data) => stderr += data);

        staged.on('close', (code) => {
            if (code === 0 && stdout.trim().length > 0) {
                resolve(stdout);
            } else {
                // If no staged changes, try to get all changes (optional, based on requirement "next intended commit")
                // For now, let's stick to staged changes or if empty, maybe warn? 
                // The original requirement says: "targeting exclusively the staged changes when any files are staged, 
                // or otherwise targeting what would be included in the next intended commit"
                // So if staged is empty, we check unstaged.

                const unstaged = spawn('git', ['diff'], { cwd: folderPath });
                let uStdout = '';
                let uStderr = '';

                unstaged.stdout.on('data', (data) => uStdout += data);
                unstaged.stderr.on('data', (data) => uStderr += data);

                unstaged.on('close', (uCode) => {
                    if (uCode === 0 && uStdout.trim().length > 0) {
                        resolve(uStdout);
                    } else {
                        resolve(''); // No changes found
                    }
                });
            }
        });

        staged.on('error', (err) => {
            reject(err);
        });
    });
}
