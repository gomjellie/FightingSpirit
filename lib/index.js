
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


    const cCodeLines = originCode.toString().match(/^.*$/gm)
        .map((v) => v.trimRight());

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
                const idx = Object.keys(maps.cSyntax).indexOf(lineString.slice(-1));
                if (idx > -1) {
                    const blank = Math.max(space - lineString.length, 0);
                    fCode += lineString.slice(0, -1) + " ".repeat(blank) + Object.keys(maps.cSyntax)[idx] + "\n";
                } else {
                    fCode += lineString + "\n";
                }
            });

            if (options.shorten) {
                fCode = shorten(fCode);
            }

            resolve(fCode);
        }
        catch (e){
            reject(e.stack)
        }
    });
}

function shorten(fCode) {
    return fCode.replace(/\s*}/gm, "}");
}
