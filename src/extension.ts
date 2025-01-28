import * as vscode from 'vscode';
import { FightingSpirit } from './formatter';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.languages.registerDocumentFormattingEditProvider(
    'c',
    {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument
      ): vscode.TextEdit[] {
        const config = vscode.workspace.getConfiguration('fightingSpirit');
        const space = config.get<number>('space') || 84;
        const enable = config.get<boolean>('enable') ?? true;

        if (!enable) {
          return [];
        }

        const text = document.getText();
        const formatted = new FightingSpirit({ space }).format(text);

        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );

        return [vscode.TextEdit.replace(fullRange, formatted)];
      },
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
