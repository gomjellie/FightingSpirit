#!/usr/bin/env node

/**
 * /usr/local/bin/lost 에 들어가서 command line 에서 lost 를 호출할때 이 스크립트들이 실행된다.
 *
 * Usage: lost [options] [source files...] -o output file
 *
 * Options:
 * -o, --output <output>  Write the build output to an output file.
 * -h, --help             output usage information
 *
 * e.g.)
 *
 * lost helloworld.cat -o helloworld.c
 *
 * OR
 *
 * lost -o helloworld.c helloworld.cat
 */

const commander = require('commander');
const path = require('path');
const chalk = require('chalk');
const fs = require("fs");
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const lostTemple = require("..");

commander
    .usage('[options] [source files...] -o output file')
    .arguments('<input_files...>')

    .on('--help', function () {
        console.log('');
        console.log('Examples: lost hello.cat');
        console.log('          lost hello.cat -o hello.c');
        console.log('          lost hello.cat --output hello.c');
    })

    .option('-o, --output [output]', 'Write the build output to an output file.')
    /**
     * To get string arguments from options you will need to use angle brackets <> for required inputs or square brackets [] for optional inputs.
     */
    .action(function(input_files){
        const output = commander.output
            || input_files.map((v) => v.replace(/(\.[ch])(at)/, "$1"));
        process.stdout.write("output : " + chalk.red(output) + "\n");
        process.stdout.write("input_files : " + chalk.green(input_files) + "\n");

        input_files.forEach((v, i) => {
            const fullPath = getFullPath(v);
            readFile(fullPath)
                .then(lostTemple.cat2c)
                .then((transpiledCode) => writeFile(output[i], transpiledCode));
        })
    })

    .parse(process.argv);

function getFullPath (input) {
    /**
     * get file name and return it's full path as string
     * a.cat -> /working/directory/a.cat
     * ./a.cat -> /working/directory/a.cat
     */
    let fullPath;
    if (input === null) {
        return process.cwd();
    }
    fullPath = path.normalize(input);
    if (fullPath.length === 0) {
        return process.cwd();
    }
    if (fullPath.charAt(0) !== '/') {
        fullPath = path.normalize(process.cwd() + '/./' + fullPath);
    }
    if (fullPath.length > 1 && fullPath.charAt(fullPath.length - 1) === '/') {
        return fullPath.substr(0, fullPath.length - 1);
    }
    return fullPath;
}
