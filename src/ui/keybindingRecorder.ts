import * as vscode from 'vscode';
import { checkKeybindingConflict } from '../services/keybindingWriter';

export interface RecordedKeybinding {
	keybinding: string;
	cancelled: boolean;
	mode?: 'replace' | 'add';
}

export async function showKeybindingRecorder(): Promise<RecordedKeybinding | undefined> {
	return new Promise((resolve) => {
		let isResolved = false;
		
		const panel = vscode.window.createWebviewPanel(
			'keybindingRecorder',
			'录制快捷键',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: false,
			}
		);

		// Set the webview's initial html content
		panel.webview.html = getWebviewContent();

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.type) {
					case 'confirm':
						if (!isResolved) {
							isResolved = true;
							console.log('[Shortcut Settings] Confirm clicked, keybinding:', message.keybinding, 'mode:', message.mode);
							const result = { 
								keybinding: message.keybinding, 
								cancelled: false,
								mode: message.mode || 'replace'
							};
							panel.dispose();
							resolve(result);
						}
						break;
					case 'cancel':
						if (!isResolved) {
							isResolved = true;
							console.log('[Shortcut Settings] Cancel clicked');
							const result = { keybinding: '', cancelled: true };
							panel.dispose();
							resolve(result);
						}
						break;
					case 'checkConflict':
						// Check for conflicts and send result back to webview
						const conflict = await checkKeybindingConflict(message.keybinding);
						panel.webview.postMessage({
							type: 'conflictResult',
							conflict: conflict,
						});
						break;
				}
			},
			undefined,
			[]
		);

		// Handle panel disposal
		panel.onDidDispose(() => {
			if (!isResolved) {
				isResolved = true;
				console.log('[Shortcut Settings] Panel disposed without confirmation');
				resolve(undefined);
			}
		});
	});
}

function getWebviewContent(): string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>录制快捷键</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
        }
        
        .recorder {
            text-align: center;
            padding: 40px;
            border: 2px solid var(--vscode-focusBorder);
            border-radius: 8px;
            background: var(--vscode-editor-background);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            min-width: 500px;
        }
        
        h2 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 24px;
            color: var(--vscode-foreground);
        }
        
        .key-display {
            font-size: 32px;
            font-weight: 600;
            font-family: var(--vscode-editor-font-family, monospace);
            margin: 20px 0;
            padding: 30px 20px;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--vscode-input-foreground);
            letter-spacing: 1px;
        }
        
        .key-display.waiting {
            font-size: 16px;
            color: var(--vscode-descriptionForeground);
            font-weight: normal;
        }
        
        .key-display.recorded {
            color: var(--vscode-textLink-foreground);
            animation: pulse 0.3s ease-in-out;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .conflict-warning {
            margin-top: 12px;
            padding: 12px 16px;
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            border-radius: 4px;
            color: var(--vscode-inputValidation-warningForeground);
            font-size: 13px;
            display: none;
            text-align: left;
        }
        
        .conflict-warning.show {
            display: block;
        }
        
        .conflict-warning strong {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
        }
        
        .conflict-detail {
            font-size: 12px;
            opacity: 0.9;
            margin-top: 4px;
        }
        
        .hint {
            color: var(--vscode-descriptionForeground);
            margin-top: 16px;
            font-size: 13px;
        }
        
        .buttons {
            margin-top: 32px;
            display: flex;
            gap: 12px;
            justify-content: center;
            align-items: center;
        }
        
        .button-group {
            position: relative;
            display: inline-flex;
        }
        
        button {
            padding: 10px 24px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        button:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
            transform: translateY(-1px);
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        button.secondary:hover:not(:disabled) {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        
        button.danger {
            background: #d73a49;
            color: white;
        }
        
        button.danger:hover:not(:disabled) {
            background: #cb2431;
        }
        
        .split-button-main {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            padding-right: 20px;
        }
        
        .split-button-dropdown {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            padding: 10px 8px;
            border-left: 1px solid rgba(255, 255, 255, 0.2);
            min-width: auto;
        }
        
        .dropdown-menu {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            background: var(--vscode-dropdown-background);
            border: 1px solid var(--vscode-dropdown-border);
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            min-width: 180px;
            z-index: 1000;
            display: none;
        }
        
        .dropdown-menu.show {
            display: block;
        }
        
        .dropdown-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            color: var(--vscode-dropdown-foreground);
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background 0.15s;
        }
        
        .dropdown-item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        
        .dropdown-item.selected {
            background: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }
        
        .dropdown-item .checkmark {
            margin-left: 8px;
            visibility: hidden;
        }
        
        .dropdown-item.selected .checkmark {
            visibility: visible;
        }
        
        .instructions {
            margin-top: 24px;
            padding: 16px;
            background: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            border-radius: 4px;
            text-align: left;
        }
        
        .instructions h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .instructions ul {
            list-style: none;
            padding-left: 0;
        }
        
        .instructions li {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin: 4px 0;
            padding-left: 16px;
            position: relative;
        }
        
        .instructions li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: var(--vscode-textLink-foreground);
        }
    </style>
</head>
<body>
    <div class="recorder">
        <h2>🎹 录制快捷键</h2>
        <div class="key-display waiting" id="keyDisplay">
            请按下任意组合键...
        </div>
        
        <div class="conflict-warning" id="conflictWarning">
            <strong>⚠️ 该快捷键组合已存在</strong>
            <div class="conflict-detail" id="conflictDetail"></div>
        </div>
        
        <div class="hint">按 <strong>ESC</strong> 可取消</div>
        
        <div class="buttons">
            <div class="button-group">
                <button id="confirmBtn" class="split-button-main" disabled>✓ 确认</button>
                <button id="dropdownBtn" class="split-button-dropdown" disabled>▼</button>
                <div id="dropdownMenu" class="dropdown-menu">
                    <div class="dropdown-item selected" data-mode="replace">
                        <span>覆盖原快捷键</span>
                        <span class="checkmark">✓</span>
                    </div>
                    <div class="dropdown-item" data-mode="add">
                        <span>添加新快捷键</span>
                        <span class="checkmark">✓</span>
                    </div>
                </div>
            </div>
            <button id="resetBtn" class="secondary">↻ 重置</button>
            <button id="cancelBtn" class="danger">✕ 取消</button>
        </div>
        
        <div class="instructions">
            <h3>使用提示：</h3>
            <ul>
                <li>支持 Ctrl、Shift、Alt、Cmd 等修饰键组合</li>
                <li>录制完成后点击"确认"按钮保存</li>
                <li>避免使用已被占用的快捷键</li>
            </ul>
        </div>
    </div>

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const keyDisplay = document.getElementById('keyDisplay');
            const confirmBtn = document.getElementById('confirmBtn');
            const dropdownBtn = document.getElementById('dropdownBtn');
            const dropdownMenu = document.getElementById('dropdownMenu');
            const resetBtn = document.getElementById('resetBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            const conflictWarning = document.getElementById('conflictWarning');
            const conflictDetail = document.getElementById('conflictDetail');
            
            let currentKeybinding = '';
            let isRecording = true;
            let selectedMode = 'replace'; // 'replace' or 'add'

            // Listen for messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.type === 'conflictResult') {
                    const conflict = message.conflict;
                    if (conflict.hasConflict) {
                        let detailText = conflict.command || '未知命令';
                        if (conflict.when) {
                            detailText += ' (条件: ' + conflict.when + ')';
                        }
                        if (conflict.source === 'user') {
                            detailText += ' - 来源: 用户自定义 (keybindings.json)';
                        } else if (conflict.source === 'default') {
                            detailText += ' - 来源: 系统默认';
                        }
                        conflictDetail.textContent = detailText;
                        conflictWarning.classList.add('show');
                    } else {
                        conflictWarning.classList.remove('show');
                    }
                }
            });

            // Reset function
            function reset() {
                currentKeybinding = '';
                keyDisplay.textContent = '请按下任意组合键...';
                keyDisplay.className = 'key-display waiting';
                confirmBtn.disabled = true;
                dropdownBtn.disabled = true;
                conflictWarning.classList.remove('show');
            }
            
            // Toggle dropdown menu
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
                    dropdownMenu.classList.remove('show');
                }
            });
            
            // Handle dropdown item selection
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    // Remove selected class from all items
                    document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                    // Add selected class to clicked item
                    item.classList.add('selected');
                    // Update selected mode
                    selectedMode = item.getAttribute('data-mode');
                    // Close dropdown
                    dropdownMenu.classList.remove('show');
                });
            });

            // Confirm button
            confirmBtn.addEventListener('click', () => {
                if (currentKeybinding) {
                    vscode.postMessage({ 
                        type: 'confirm', 
                        keybinding: currentKeybinding,
                        mode: selectedMode
                    });
                    isRecording = false;
                }
            });

            // Reset button
            resetBtn.addEventListener('click', () => {
                reset();
            });

            // Cancel button
            cancelBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'cancel' });
                isRecording = false;
            });

            document.addEventListener('keydown', (e) => {
                if (!isRecording) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                // ESC to cancel
                if (e.key === 'Escape') {
                    vscode.postMessage({ type: 'cancel' });
                    isRecording = false;
                    return;
                }

                // Build key combination
                const parts = [];
                
                // Add modifiers in order
                if (e.ctrlKey) parts.push('ctrl');
                if (e.shiftKey) parts.push('shift');
                if (e.altKey) parts.push('alt');
                if (e.metaKey) parts.push('cmd'); // Mac Command key
                
                // Get the actual key (excluding modifiers)
                let key = e.key.toLowerCase();
                
                // Normalize special keys
                const keyMap = {
                    ' ': 'space',
                    'arrowup': 'up',
                    'arrowdown': 'down',
                    'arrowleft': 'left',
                    'arrowright': 'right',
                    'delete': 'delete',
                    'backspace': 'backspace',
                    'tab': 'tab',
                    'enter': 'enter',
                    'home': 'home',
                    'end': 'end',
                    'pageup': 'pageup',
                    'pagedown': 'pagedown',
                };
                
                key = keyMap[key] || key;
                
                // Skip if only modifier keys are pressed
                const modifierKeys = ['control', 'shift', 'alt', 'meta'];
                if (modifierKeys.includes(key)) {
                    keyDisplay.textContent = parts.join('+') + '+...';
                    keyDisplay.className = 'key-display waiting';
                    return;
                }
                
                // Add the actual key
                parts.push(key);

                const keybinding = parts.join('+');
                
                if (keybinding) {
                    currentKeybinding = keybinding;
                    keyDisplay.textContent = keybinding;
                    keyDisplay.className = 'key-display recorded';
                    confirmBtn.disabled = false;
                    dropdownBtn.disabled = false;
                    
                    // Request conflict check from extension
                    vscode.postMessage({
                        type: 'checkConflict',
                        keybinding: keybinding
                    });
                }
            });

            // Prevent context menu
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        })();
    </script>
</body>
</html>`;
}
