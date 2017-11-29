/*
 * @Author: liumeng6 
 * @Date: 2017-11-27 19:38:38 
 * @Last Modified by: liumeng6
 * @Last Modified time: 2017-11-29 19:50:11
 */

const vscode = require('vscode')
const indentString = require('indent-string')

/** 
 * @Author: liumeng6 
 * @Date: 2017-11-29 19:49:22 
 * @Desc: 格式化时间 
 */
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
        }
    }
    return format
}

/** 
 * @Author: liumeng6 
 * @Date: 2017-11-29 19:49:38 
 * @Desc: es6模版字符串引擎 
 */
function stp(strTmpl, data) {
    if (data !== null && data !== undefined) {
      return stp(strTmpl)(data)
    }
    strTmpl = strTmpl.replace(/\\/g, '\\\\')
    strTmpl = strTmpl.replace(/`/g, '\\`')
    return new Function("$", "with($){return `" + strTmpl + '`;}')
}

/** 
 * @Author: liumeng6 
 * @Date: 2017-11-29 19:49:54 
 * @Desc: activate函数
 */
function activate(context) {

    const config = vscode.workspace.getConfiguration('docBlocker')
    
    console.log('Congratulations, your extension "docblocker" is now active!')

    let disposable = vscode.commands.registerCommand('extension.docblocker', function () {
        const editor = vscode.editor || vscode.window.activeTextEditor
        const startLine = editor.selection.active.line
        // const character = editor.selection.active.character
        
        const time = new Date().format("yyyy-MM-dd hh:mm:ss")
        const tpl = config.tpl
        const data = {
            author: config.Author,
            createTime: time,
        }
        try {
            let textToInsert = stp(tpl, data)

            let pos = new vscode.Position(startLine, 0)

            const line = vscode.window.activeTextEditor.document.lineAt(editor.selection.start.line).text
            const firstNonWhiteSpace = vscode.window.activeTextEditor.document.lineAt(editor.selection.start.line).firstNonWhitespaceCharacterIndex
            
            let stringToIndent = ''

            for (let i = 0; i < firstNonWhiteSpace; i++) {
                if (line.charAt(i) == '\t') {
                    stringToIndent = stringToIndent + '\t';
                }
                else if (line.charAt(i) == ' ') {
                    stringToIndent = stringToIndent + ' ';
                }
            }

            textToInsert = indentString(textToInsert, 1, {indent: stringToIndent})

            editor.insertSnippet(new vscode.SnippetString(textToInsert), pos)
            
        } catch (error) {
            console.error(error)
        }
        
    })

    context.subscriptions.push(disposable)
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate