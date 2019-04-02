"use strict";
import * as vscode from "vscode";
import open from "open";

function firstUpperCase(str: string) {
  return str.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
    return $1.toUpperCase() + $2.toLowerCase();
  });
}

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("open.inEditorMenu", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const uri = editor.document.uri;
      await open(uri.fsPath);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "open.inDefaultBrowser",
      async (uri: vscode.Uri) => {
        await open(uri.fsPath);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "open.inSpecifyBrowser",
      async (uri: vscode.Uri) => {
        const launcher = require("browser-launcher");

        const browsers: any[] = await new Promise((resolve, reject) => {
          launcher((err: any, launch: any) => {
            if (err) {
              return reject(err);
            }
            resolve(launch.browsers.local);
          });
        });

        const browser = await vscode.window.showQuickPick(
          browsers.map(v => {
            return {
              label: firstUpperCase(v.name) + " " + (v.version || ""),
              description: "",
              detail: v.command,
              name: v.name,
              command: v.command,
              type: v.type,
              version: v.version
            };
          })
        );

        if (!browser) {
          return;
        }

        await open(uri.fsPath, { wait: true, app: browser.name });
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
  for (const subscription of context.subscriptions) {
    subscription.dispose();
  }
}
