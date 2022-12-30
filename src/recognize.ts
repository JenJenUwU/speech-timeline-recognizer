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
            //set the max alterantives to 3
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
            results.push(await extract(rec.finalResult(), expect));

            //define the final text variable
            const final = {
                text: results.map((r) => r.text).join(""),
                words: results
                    .map((r) =>
                        r.result.map((w) => ({ start: w.start, end: w.end, value: w.word })),
                    )
                    .flat(),
            };

            silent || console.log(`Recognized ${file}`);
            stream.close(() => {
                resolve(final);
                fs.rmSync(file);
            });

            rec.free();
        });

        stream.pipe(reader);
    });
}

async function extract(result: any, expect?: string) {
    const { alternatives } = result;

    for (let i = 0; i < alternatives.length; i++) {
        alternatives[i].text = await converter.convertPromise(
            alternatives[i].text.replace(/\s+/g, ""),
        );
        for (let j = 0; j < alternatives[i].result.length; j++) {
            alternatives[i].result[j].word = await converter.convertPromise(
                alternatives[i].result[j].word,
            );
        }
        delete alternatives[i].confidence;
    }

    if (expect) {
        const fuse = new Fuse(alternatives, { keys: ["text"], threshold: 1 });
        const result = fuse.search(expect);
        if (result.length > 0) {
            return result.map((r) => r.item)[0];
        } else {
            return { result: [], text: "" };
        }
    } else {
        return alternatives[0];
    }
}