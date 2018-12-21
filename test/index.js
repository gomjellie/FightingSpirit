/**
 * test files on examples directory
 */

const expect = require("chai").expect;

const fs = require("fs");
const util = require('util');
const readFile = util.promisify(fs.readFile);

describe('lost-temple', function(){
    const lostTemple = require('../lib');

    it('check gugu.c -> gugu.f', function(done){
        readFile("./example/gugu.c")
            .then(lostTemple.cat2c)
            .then((res) => {
                expect(res).to.equal(String(fs.readFileSync("./example/gugu.f")));
                done();
            })
            .catch(console.error);
    });

    it('check helloWorld.c -> helloWorld.f', function(done){
        readFile("./example/helloWorld.c")
            .then(lostTemple.cat2c)
            .then((res) => {
                expect(res).to.equal(String(fs.readFileSync("./example/helloWorld.f")));
                done();
            })
            .catch(console.error);
    });
});
