/**
 * test files on examples directory
 */

const expect = require("chai").expect;

const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

describe("fighting-spirit", function () {
    const fightingSpirit = require("../lib");
    const shortenMap = {
        "check double for loop": {
            c: "./example/gugu.c",
            shorten: "./example/gugu.shorten",
        },
        "check function declaration": {
            c: "./example/guguFunction.c",
            shorten: "./example/guguFunction.shorten",
        },
        "check hello World": {
            c: "./example/helloworld.c",
            shorten: "./example/helloWorld.shorten",
        },
        "check line comment": {
            c: "./example/lineComment.c",
            shorten: "./example/lineComment.shorten",
        },
        "check long comment": {
            c: "./example/longComment.c",
            shorten: "./example/longComment.shorten",
        },
        "check switch (break; in another line)": {
            c: "./example/switch.c",
            shorten: "./example/switch.shorten",
        },
        "check switch (break; in a line)": {
            c: "./example/switchBreakInOneLine.c",
            shorten: "./example/switchBreakInOneLine.shorten",
        },
    };

    for (const testName in shortenMap) {
        // test single execute
        it(testName, (done) => {
            readFile(shortenMap[testName].c)
                .then((cCode) => fightingSpirit.c2f(cCode, { shorten: true, overwrite: false }))
                .then((res) => {
                    expect(res).to.equal(String(fs.readFileSync(shortenMap[testName].shorten)));
                    done();
                })
                .catch(console.error);
        });
    }

});
