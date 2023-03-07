import fs from "node:fs";
import path from "node:path";

export function exportdir(directory: string):void{
    const json = JSON.parse(fs.readFileSync(directory, 'utf-8'));

    // Create a directory to store the output JSON files
    const outputDir = 'output';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    for (const file in json) {
      // Create the filename for the output JSON file
        const filedir = file.replace(/[/.]/g,"_");
        const filename = `output/${filedir}.txt`;
        fs.writeFileSync(filename, '');
        const words = json[file].words;
        for (const word of words) {
            const outputdata = (`${word.value}\t${word.start}\t${word.end}`);
            const strinifydata = JSON.stringify(outputdata)
    
            fs.appendFileSync(filename, JSON.parse(strinifydata))
            fs.appendFileSync(filename, "\n")
        }
        
    }      
}