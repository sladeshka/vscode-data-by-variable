declare var module: any;
declare var exports: any;
declare var require: any;

const vscode = require("vscode");

function activate(context: any) {
  function pretty(json: string) {
      return json.replace(/(,\s*)/g, ",\r\n").replace(/({ )/g, "{\r\n").replace(/(#)/g, "\t").replace(/(\s*})/g, "\r\n}");
  }
  async function fetchData(fileName: any, variable: any): Promise<any> {
    try {
      return await fetch(
        `http://localhost:8080/api/v1/variable?file_name=${encodeURIComponent(
          fileName
        )}&variable_name=${encodeURIComponent(variable)}`
      ).then((response) => response.json());
    } catch (error) {
      return error;
    }
  }
  let disposable = vscode.languages.registerHoverProvider("*", {
    async provideHover(
      document: {
        getText: (arg0: any) => any;
        getWordRangeAtPosition: (arg0: any) => any;
        fileName: any;
      },
      position: any,
      token: any
    ) {
      let fileName = document.fileName;
      let variable = document.getText(
        document.getWordRangeAtPosition(position)
      );
      if (!variable) {
        vscode.window.showErrorMessage("No code selected");
        return;
      }
      return await new vscode.Hover(
        (await variable) +
          " = " +
          await pretty(await JSON.stringify((await JSON.parse(await (await fetchData(fileName, variable)).data)), null, "#"))
      );
    },
  });

  context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
