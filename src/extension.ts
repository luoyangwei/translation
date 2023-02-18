// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';
import { PlatformAccessInfo, translation } from './invoke/remote';
import { setEngine } from 'crypto';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// 选择的内容
	let selectText: string = "";

	// 选中的范围
	let range: vscode.Range;

	// 可改变的编辑器
	let editor = vscode.window.activeTextEditor;

	let disposable = vscode.commands.registerCommand('translation.selected', () => {
		let invoke = {

			// 获取认证信息
			getPlatformAccessInfo: () => new PlatformAccessInfo(),

			// 替换文本
			replaceText: (newText: string) => {
				if (range) {
					editor?.edit((editBuilder) => {
						editBuilder.replace(range, newText);
					});
					vscode.window.showInformationMessage('翻译文本 ' + selectText + ' => ' + newText);
				}
			},
		};

		// 翻译内容
		translation(selectText, invoke);
	});

	// 选中实时事件
	let selectionChangeEvent = vscode.window.onDidChangeTextEditorSelection((selected: vscode.TextEditorSelectionChangeEvent) => {

		// 获取选中的范围
		range = selected.selections[0];

		// 获取选中的内容
		selectText = selected.textEditor.document.getText(range);

	});

	context.subscriptions.push(disposable, selectionChangeEvent);
}

export function deactivate() { }
