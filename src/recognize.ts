import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import vosk, { Model } from "vosk-lib";
import wav from "wav";
import Fuse from "fuse.js";
import { OpenCC } from "opencc";
import { MODEL_DIR } from "./constants.js";
//function which converts wav into string
import { convert } from "./convert.js";

let loaded = false;
let model: Model;
const converter = new OpenCC("s2t.json");

//exporting the recognize function
export function recognize(
    //defining function input variables
    file: string,
    expect?: string,
    silent?: boolean,
): Promise<{
    //defining function output variables
    text: string;
    words: { start: number; end: number; value: string }[];
}> {
    //if the vosk model is not loaded, load the model and return message
    if (loaded === false) {
        silent || console.log("Loading model ...");
        vosk.setLogLevel(-1);
        model = new vosk.Model(MODEL_DIR);
        loaded = true;
        silent || console.log("Model loaded.");
    }

    //giving the file variable an absolute path value
    file = convert(path.resolve(file));
    //returning a promise
    return new Promise((resolve) => {
        silent || console.log(`Recognizing ${file} ...`);
        //read the data in small chunks of 4096 bytes
        const stream = fs.createReadStream(file, { highWaterMark: 4096 });
        //create a reader class to read the wav data
        const reader = new wav.Reader();
        //create a readable stream for the reader class
        const readable = new Readable().wrap(reader);
        //create an event that throws error when the audio format is not wav with mono PCM
        reader.on("format", async ({ audioFormat, sampleRate, channels }) => {
            if (audioFormat != 1 || channels != 1) {
                throw new Error("Audio file must be WAV with mono PCM.");
            }
            
            //creates a recognizer object with modified model and sample rate
            const rec = new vosk.Recognizer({ model, sampleRate });
            //set the max alternatives to 3
            rec.setMaxAlternatives(3);
            //enables word level recognition
            rec.setWords(true);
            //enables partial word recognition
            //allows the code to recognize word by word instead of the recognizing the whole audio file as one
            rec.setPartialWords(true);

            const results: {
                //define properties of the result variable
                text: string;
                result: { start: number; end: number; word: string }[];
            }[] = [];
            //loop through all the readable stream data
            for await (const data of readable) {
                //if the end of the speech is reached, extract the result
                const end_of_speech = rec.acceptWaveform(data);
                if (end_of_speech) {
                    //extract the result with the extract function
                    const result = await extract(rec.result(), expect);
                    //push the result to the results array
                    results.push(result);
                    //if the expect variable is defined, remove the recognized text from the expect variable
                    if (expect) {
                        expect = expect.slice(result.text.length);
                    }
                }
            }
            //push the final result to the results array
            //results.push(await extract(rec.finalResult(), expect));

            //define the final text variable
            const final = {
                //text gained from mapping the total result to the text property
                text: results.map((r) => r.text).join(""),
                //words gained from mapping each result with the time start and end and the word itself
                words: results
                    .map((r) =>
                        r.result.map((w) => ({ start: w.start, end: w.end, value: w.word })),
                    )
                    .flat(),
            };
            //log the file being recognized
            silent || console.log(`Recognized ${file}`);
            //close the stream and delete the file
            stream.close(() => {
                resolve(final);
                fs.rmSync(file);
            });
            //delete the recognizer object
            rec.free();
        });
        //pipe the stream to the reader object
        stream.pipe(reader);
    });
}

//function to extract the result, taking 2 arguments (result and expect)
async function extract(result: any, expect?: string) {
    //destructuring the result object to get the alternatives
    const { alternatives } = result;
    //loop through the alternatives array
    for (let i = 0; i < alternatives.length; i++) {
        //convert the text and word to traditional chinese
        alternatives[i].text = await converter.convertPromise(
            alternatives[i].text.replace(/\s+/g, ""),
        );
        //loop through the result array
        //convert the word to traditional chinese
        for (let j = 0; j < alternatives[i].result.length; j++) {
            alternatives[i].result[j].word = await converter.convertPromise(
                alternatives[i].result[j].word,
            );
        }
        //delete the confidence property
        delete alternatives[i].confidence;
    }


    //if the expect argument is defined, use the fuse.js library to search for the expect argument in the alternatives array
    if (expect) {
        const fuse = new Fuse(alternatives, { keys: ["text"], threshold: 1 });
        const result = fuse.search(expect);
        //if the result array is not empty, return the first item in the result array
        if (result.length > 0) {
            return result.map((r) => r.item)[0];
        //else return result and text
        } else {
            return { result: [], text: "" };
        }
    } else {
        return alternatives[0];
    }
}