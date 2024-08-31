// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerCommand('LineNumberCopy.LineNumberCopy', () => {

		convLineNumberCopy(false);
	});

	context.subscriptions.push(disposable);

	let disposable2 = vscode.commands.registerCommand('LineNumberCopy.LineNumberCopySpace', () => {

		convLineNumberCopy(true);
	});

	context.subscriptions.push(disposable2);
}

function convLineNumberCopy(isSpace: Boolean)
{
	const editor = vscode.window.activeTextEditor;
	if(!editor) {
		vscode.window.showInformationMessage('activeTextEditor Null');
		return;
	}

	const doc = editor?.document;
	const curSelection = editor?.selection;
	if(curSelection.isEmpty) {
		vscode.window.showInformationMessage('selection isEmpty');
		return;
	}

	// 選択された範囲の最後の行番号から桁数を取得
	const startLine = curSelection.start.line;
	let endLine = curSelection.end.line + 1;

	// 最後が行の開始の時は無視する
	if( 0 === curSelection.end.character ) {
		endLine = curSelection.end.line;
	}

	const allen = String(endLine).length;

	let textOut = "";
	for (let cnt1 = startLine; cnt1 < endLine; cnt1++) {
		let startPos = new vscode.Position(cnt1, 0);
		let endPos = new vscode.Position(cnt1, Number.MAX_VALUE);
		let range = new vscode.Range(startPos, endPos);

		// 数字を文字列に変換
		const number = cnt1 + 1;
		const textNumber = number.toString();

		// 空白で右揃え
		const rightAligned = textNumber.padStart(allen);

		let text = doc.getText(range);
		if( isSpace ) {
			text = convSpace(text);
		}

		const textLine = rightAligned + ": "+ text;

		// 最初の行は改行はなし(最後に改行を入れない)
		if( cnt1 === curSelection.start.line) {
			textOut = textLine;
		}else {
			textOut = textOut + "\r\n" + textLine;
		}
		
	}

	vscode.env.clipboard.writeText(textOut);
	vscode.window.showInformationMessage('LineNumberCopy OK');
}


function convSpace(str: string): string
{
	const configuration = vscode.workspace.getConfiguration();

	const isOrganize = configuration.get<boolean>('LineNumberCopyconf.resource.isOrganize');
	const tabSizeString = configuration.get<string>('LineNumberCopyconf.resource.TabSize');
	if( undefined === isOrganize || undefined === tabSizeString ) {
		return str;
	}

	const tabSize = Number(tabSizeString);

	let result = "";
	let spaceSize = 0;
	for (let cnt1 = 0; cnt1 < str.length; cnt1++) {
		if (str[cnt1] === '\t') {
			for (let j = 0; j < tabSize - spaceSize; j++) {
				result += ' ';
			}

			spaceSize = 0;
		}
		else if (( isOrganize ) && ( str[cnt1] === ' ')) {
			result += str[cnt1];
			spaceSize++;
			spaceSize = spaceSize % tabSize;
		}
		else {
			result += str[cnt1];
			spaceSize = 0;
		}
	}
	return result;
}


// This method is called when your extension is deactivated
export function deactivate() {}
