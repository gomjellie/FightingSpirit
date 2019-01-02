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
            fight: "./example/gugu.fight.c",
        },
        "check function declaration": {
            c: "./example/guguFunction.c",
            fight: "./example/guguFunction.fight.c",
        },
        "check hello World": {
            c: "./example/helloWorld.c",
            fight: "./example/helloWorld.fight.c",
        },
        "check line comment": {
            c: "./example/lineComment.c",
            fight: "./example/lineComment.fight.c",
        },
        "check long comment": {
            c: "./example/longComment.c",
            fight: "./example/longComment.fight.c",
        },
        "check switch (break; in another line)": {
            c: "./example/switch.c",
            fight: "./example/switch.fight.c",
        },
        "check switch (break; in a line)": {
            c: "./example/switchBreakInOneLine.c",
            fight: "./example/switchBreakInOneLine.fight.c",
        },
        "check brace opening style": {
            c: "./example/openingBraceStyle.c",
            fight: "./example/openingBraceStyle.fight.c",
        }
    };

    for (const testName in shortenMap) {
        // run once
        it(`${testName} (run once)`, (done) => {
            readFile(shortenMap[testName].c)
                .then((cCode) => fightingSpirit.c2f(cCode, { shorten: true, overwrite: false }))
                .then((res) => {
                    expect(res).to.equal(String(fs.readFileSync(shortenMap[testName].fight)));
                    done();
                })
                .catch(console.error);
        });
    }

    for (const testName in shortenMap) {
        // run twice
        it(`${testName} (run twice)`, (done) => {
            readFile(shortenMap[testName].c)
                .then((cCode) => fightingSpirit.c2f(cCode, { shorten: true, overwrite: false }))
                .then((onceCompiled) => fightingSpirit.c2f(onceCompiled, {shorten: true, overwrite: false }))
                .then((res) => {
                    expect(res).to.equal(String(fs.readFileSync(shortenMap[testName].fight)));
                    done();
                })
                .catch(console.error);
        });
    }

});
