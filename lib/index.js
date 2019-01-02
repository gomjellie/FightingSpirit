
const maps = require("./maps");

module.exports = {
    c2f: c2f,
};

function c2f(originCode, options) {
    /**
     * transpile .cat to .c
     *
     * returns new Promise
     */

    let cCodeLines = unifyOpeningBraceStyle(originCode.toString()).match(/^.*$/gm)
        .map((v) => v.trimRight());

    cCodeLines = spreadLines(handleComment(unifyClosingBraceStyle(cCodeLines)));

    // cCodeLines = spreadLines(cCodeLines);

    /**
     * cCodeLines have data like this
     *
     *
     [
     '#include <stdio.h>',
     '#include <stdlib.h>',
     'int main():',
     '    for (int i = 0; i < 10; i++) {',
     '        for (int j = 0; j < 10; j++) {',
     '            print("%d times %d is %d \\n", i, j, i * j);',
     '        }',
     '    }',
     '    return 0;',
     '}' ]
     */
    let fCode = "";
    const space = 84;

    return new Promise((resolve, reject) => {
        try {
            cCodeLines.forEach((lineString, lineNumber) => {
                const call_func_reg = /(?<tabLevel>\s*)(?<funcName>\w+)(?:\s*)(?<parenthesis>\(.*?\))(?<semicolon>;)(?:\s*)(?<comment>\/\/.*)?/gm;
                // 함수 호출
                // 빈칸 함수이름 ( 인자 ) 세미콜른 코멘트
                call_func_reg.lastIndex = 0;
                const exec_res = call_func_reg.exec(lineString);
                if (exec_res !== null) {
                    const idx = lineString.indexOf(";");
                    if (idx > -1) {
                        const blank = Math.max(space - lineString.length, 0);
                        fCode +=
                            exec_res.groups.comment === undefined ? "" : exec_res.groups.tabLevel + exec_res.groups.comment + "\n";
                        fCode +=
                            exec_res.groups.tabLevel + exec_res.groups.funcName + exec_res.groups.parenthesis + " ".repeat(blank) + ";\n";
                    } else {
                        fCode += lineString + "\n";
                    }
                }
                else {
                    const idx = Object.keys(maps.cSyntax).indexOf(lineString.slice(-1));
                    if (idx > -1) {
                        const blank = Math.max(space - lineString.length, 0);
                        fCode += lineString.slice(0, -1) + " ".repeat(blank) + Object.keys(maps.cSyntax)[idx] + "\n";
                    } else {
                        fCode += lineString + "\n";
                    }
                }
            });

            if (options.shorten) {
                fCode = shorten(fCode);
            }
            fCode = noMultipleEmptyLines(fCode);

            resolve(fCode);
        }
        catch (e){
            reject(e.stack)
        }
    });
}

function unifyOpeningBraceStyle(cCode) {
    /**
     * while(true)            > >   while(true) {
     * {                      > >        doSomeThing();
     *     doSomeThing();     > >   }
     * }                      > >
     */

    return cCode.replace(/\s*{/gm, " {");
}

function unifyClosingBraceStyle(cCodeLines) {
    /**
     * do {                   > >   do {
     *     someThing();       > >       someThing();
     * } while(1);            > >   }
     *                        > >   while(1);
     */
    let ret = "";
    cCodeLines.forEach(lineString => {
        let reg = /^(\s*)}(\s*)(.+)$/gm;
        if (reg.exec(lineString)) {
            ret += lineString.replace(/^(\s*)}(\s*)(.*)$/gm,
                (match, p1, p2, p3, offset, string) => {
                    return `${p1}}\n${p1}${p2.replace(/ /g, "")}${p3}\n`;
                });
        }
        else {
            ret += `${lineString}\n`;
        }
    });

    return ret.toString().match(/^.*$/gm);
}

function shorten(fCode) {
    /**
     * ;          > >   ;}}
     * }          > >
     * }          > >
     */

    return fCode.replace(/\s*}/gm, "}");
}

function spreadLines(cCodeLines) {
    /**
     * prevent stuck function call at a line
     * run(); eat();          > >    run();
     *                        > >    eat();
     *
     * run(); break;          > >    run();
     *                        > >    break;
     */
    const semicolon_reg = /(?:\s*)(.*?;[}]*)(?:\s*)/gm;
    const for_reg = /for(?:\s*)\((.*?);(.*?);(.*?)\)/gm;
    let ret = "";
    cCodeLines.forEach((lineString, nu) => {
        semicolon_reg.lastIndex = 0;
        for_reg.lastIndex = 0;
        if (lineString.match(for_reg)) {
            ret += `${lineString}\n`;
        }
        else if (lineString.match(semicolon_reg)) {
            const tabSpaceReg = /(?<tabLevel>\s*)/gm;
            const res = tabSpaceReg.exec(lineString);
            ret += lineString.replace(semicolon_reg, `${res.groups.tabLevel}$1\n`);
        } else {
            ret += `${lineString}\n`;
        }
    });

    return ret.toString().match(/^.*$/gm);
}

function handleComment(cCodeLines) {
    /**
     * function();   // comment         ->     // comment
     *                                         function();
     */
    const comment_reg = /(?<tabLevel>\s*)(?<beforeComment>.*)(?<comment>\/\/.*)/gm;

    let ret = "";
    cCodeLines.forEach((lineString, nu) => {
        comment_reg.lastIndex = 0;
        if (lineString.match(comment_reg)) {
            const res_comment = comment_reg.exec(lineString);
            if (res_comment.groups.beforeComment === "") {
                ret += `${res_comment.groups.tabLevel}${res_comment.groups.comment}\n`;
            } else {
                ret += `${res_comment.groups.tabLevel}${res_comment.groups.comment}\n${res_comment.groups.tabLevel}${res_comment.groups.beforeComment}`
            }
        } else {
            ret += `${lineString}\n`;
        }
    });

    return ret.toString().match(/^.*$/gm);
}

function noMultipleEmptyLines(fCode) {
    return fCode.replace(/\n{2,}$/gm, "\n");
}
