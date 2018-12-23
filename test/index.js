/**
 * test files on examples directory
 */

const expect = require("chai").expect;

const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

describe("fighting-spirit", function () {
    const fightingSpirit = require("../lib");

    it("check gugu.c -> gugu.cf", (done) => {
        readFile("./example/gugu.c")
            .then(fightingSpirit.c2f)
            .then((res) => {
                expect(res).to.equal(String(fs.readFileSync("./example/gugu.cf")));
                done();
            })
            .catch(console.error);
    });

    it("check helloWorld.c -> helloWorld.cf", (done) => {
        readFile("./example/helloWorld.c")
            .then(fightingSpirit.c2f)
            .then((res) => {
                expect(res).to.equal(String(fs.readFileSync("./example/helloWorld.cf")));
                done();
            })
            .catch(console.error);
    });
});
