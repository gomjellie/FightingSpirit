#!/usr/bin/env node

/**
 * /usr/local/bin/fight 에 들어가서 command line 에서 lost 를 호출할때 이 스크립트들이 실행된다.
 *
 Usage: fight [options] [source files...] -o output file

 Options:
 -o, --outFile [outFile]  Concatenate and emit output to single file.
 -O, --outDir [outDir]    Redirect output structure to the directory.
 -h, --help               output usage information

 Examples: lost hello.cat
 lost hello.cat -o hello.c
 lost hello.cat --output hello.c
 */

const commander = require('commander');
const path = require('path');
const chalk = require('chalk');
const fs = require("fs");
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const fightingSpirit = require("..");

commander
    .usage('[options] [file...]')
    .arguments('<input_files...>')

    .on('--help', function () {
        console.log('');
        console.log('Examples: lost hello.cat');
        console.log('          lost hello.cat -o hello.c');
        console.log('          lost hello.cat --outFile hello.c');
    })

    .option('-o, --outFile [outFile]', 'Concatenate and emit output to single file.')

    .option('-O, --outDir [outDir]', 'Redirect output structure to the directory.')

    .option("--no-overwrite", "no overwrite to existing c code")

    .option("--no-shorten", "put closing brace and semicolon at one line so it could shorten line")
    /**
     * To get string arguments from options you will need to use angle brackets <> for required inputs or square brackets [] for optional inputs.
     */
    .action(function(input_files){
        const outFile = commander.outFile
            || input_files.map((v) => v.replace(/(\.[ch])/, "$1f"));
        process.stdout.write("input_files : " + chalk.green(input_files) + "\n");
        process.stdout.write("outFile : " + chalk.red(outFile) + "\n");

        const options = {
            // defaults true
            shorten: commander.shorten,
            overwrite: commander.overwrite,
        };

        console.log("options", options);
        input_files.forEach((v, i) => {
            const fullPath = getFullPath(v);
            readFile(fullPath)
                .then((originalCode) => fightingSpirit.c2f(originalCode, options))
                .then((transpiledCode) => writeFile(outFile[i], transpiledCode));
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
