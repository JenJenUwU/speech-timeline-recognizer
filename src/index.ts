import fs from "node:fs";
import path from "node:path";
import { program } from "commander";
import { recognize } from "./recognize.js";

const package_json = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

program.version(`${package_json.name} ${package_json.version}`);

program
    .argument("<wav...>", "Path to the wav file")
    .option("-e, --expect <expected result>", "The expected result")
    .option("-o, --output <path>", "The output path")
    .option("-f, --force", "Force to overwrite the output file if it exists")
    .option("-p, --pretty", "Pretty print the result with indentation")
    .option("-s, --silent", "Silent mode")
    .action(async (wav, { expect, output, force, pretty, silent }: Options) => {
        if (output) {
            output = path.resolve(output);
            if (fs.existsSync(output) && !force) {
                silent || console.error(`${output} already exists.`);
                process.exit(1 )
            }
        }

        const results: Record<string, unknown> = {};
        for (const w of wav) {
            results[w] = await recognize(path.resolve(w), expect, silent);
        }
        //write to json file
        silent || console.log(JSON.stringify(results, null, pretty ? 4 : 0));
        if (output) {
            fs.writeFileSync(output, JSON.stringify(results, null, pretty ? 4 : 0));
            silent || console.log(`Results is written to ${output}`);
        } else {
            console.log(JSON.stringify(results, null, pretty ? 4 : 0));
        }
        
        const json = JSON.parse(fs.readFileSync(`${output}`, 'utf-8'));

        const outputDir = 'output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        for (const file in json) {
            const filedir = file.replace(/[/.]/g,"_");
            const filename = `output/${filedir}.txt`;
            fs.writeFileSync(filename, '');
            const words = json[file].words;
            for (const word of words) {
                const outputdata = (`${word.value}\t${word.start}\t${word.end}`);
                const strinifydata = JSON.stringify(outputdata);
                fs.appendFileSync(filename, JSON.parse(strinifydata));
                fs.appendFileSync(filename, "\n");
            }
        }      
    }); 
program.parse();

interface Options {
    expect?: string;
    output?: string;
    force?: boolean;
    pretty?: boolean;
    silent?: boolean;
}