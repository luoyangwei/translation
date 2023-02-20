// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { loadConfiguration, Configuration } from "./configuration";
import { PlatformAccessInfo, translation } from "./invoke/remote";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 选择的内容
	let selectText: string = "";

	// 选中的范围
	let range: vscode.Range;

	// 当前的编辑器
	// activeTextEditor 编辑器会有BUG,如果长时间打开vscode但是没有进行操作或者改变内容
	// vscode会把textEditor断开,会提示如下错误:
	// rejected promise not handled within 1 second: error: texteditor#edit not possible on closed editors
	let activeTextEditor = vscode.window.activeTextEditor;
	vscode.window.onDidChangeActiveTextEditor((textEditor) => {
		if (textEditor) {
			activeTextEditor = textEditor;
		}
	});

	// 翻译选中的内容
	// 注册命令到vscode,在命令窗口可以看到,注册了也是为了可以通过快捷键调用这个命令.
	vscode.commands.registerCommand("esay.translation.selected", () => {
		translation(selectText, {
			getPlatformAccessInfo: () => platformAccessInfo(),
			replaceText: (newText: string) =>
				replaceText(selectText, newText, range, activeTextEditor),
		});
	});

	// 选中实时事件
	// 获取选中的内容,这样翻译的时候就可以知道要翻译的内容,这个事件监听很重要.
	vscode.window.onDidChangeTextEditorSelection(
		(selected: vscode.TextEditorSelectionChangeEvent) => {
			range = selected.selections[0];
			selectText = selected.textEditor.document.getText(range);
		}
	);
}

/**
 * 获取平台信息
 * @returns PlatformAccessInfo
 */
function platformAccessInfo(): PlatformAccessInfo {
	let configuration: Configuration = loadConfiguration();
	return new PlatformAccessInfo(
		configuration.channel,
		configuration.appid,
		configuration.secretKey
	);
}

/**
 * 替换文本
 * @param selectText 		选择的内容
 * @param newText 			要替换的内容
 * @param range 			选择范围
 * @param activeTextEditor  当前编辑器
 */
function replaceText(
	selectText: string,
	newText: string,
	range: vscode.Range,
	activeTextEditor?: vscode.TextEditor
) {
	if (range) {
		if (activeTextEditor) {
			activeTextEditor.edit((editBuilder) => {
				editBuilder.replace(range, newText);
			});
			vscode.window.setStatusBarMessage(
				"翻译文本 " + selectText + " => " + newText,
				2500
			);
		} else {
			vscode.window.showWarningMessage("TextEditor过期,建议你重启vscode试试!");
		}
	} else {
		vscode.window.showInformationMessage("未选中内容");
	}
}

export function deactivate() { }
