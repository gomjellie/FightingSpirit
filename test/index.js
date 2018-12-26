/**
 * test files on examples directory
 */

const expect = require("chai").expect;

const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

describe("fighting-spirit", function () {
    const fightingSpirit = require("../lib");

    it("check gugu.c -> gugu.shorten", (done) => {
        readFile("./example/gugu.c")
            .then((cCode) => fightingSpirit.c2f(cCode, { shorten: true, overwrite: false }))
            .then((res) => {
                expect(res).to.equal(String(fs.readFileSync("./example/gugu.shorten")));
                done();
            })
            .catch(console.error);
    });

    it("check guguFunction.c -> guguFunction.shorten", (done) => {
        readFile("./example/guguFunction.c")
            .then((cCode) => fightingSpirit.c2f(cCode, { shorten: true, overwrite: false }))
            .then((res) => {
                expect(res).to.equal(String(fs.readFileSync("./example/guguFunction.shorten")));
                done();
            })
            .catch(console.error);
    });

    it("check helloWorld.c -> helloWorld.shorten", (done) => {
        readFile("./example/helloWorld.c")
            .then((cCode) => fightingSpirit.c2f(cCode, { shorten: true, overwrite: false }))
            .then((res) => {
                expect(res).to.equal(String(fs.readFileSync("./example/helloWorld.shorten")));
                done();
            })
            .catch(console.error);
    });
});
