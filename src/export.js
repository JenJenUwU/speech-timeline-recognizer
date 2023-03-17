const fs = require('fs');
const path = require('path');

const json = JSON.parse(fs.readFileSync('results.json', 'utf-8'));

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