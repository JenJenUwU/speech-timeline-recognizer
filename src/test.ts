import Vosk, { Model, Recognizer } from "vosk-lib";
import path from "path";
import fs from 'fs';

const MODEL_DIR = path.resolve(__dirname, "..", "model");
const sampleRate = 16000;

const audioFilePath = 'C:/Users/Admin/Desktop/CodingFiles/speech-timeline-recognizer/data/sub-0002/sub-0002_ffmpeg.wav';

const model = new Model(MODEL_DIR);
const recognizer = new Recognizer({ model: model, sampleRate: sampleRate });

const audioData = fs.readFileSync(audioFilePath);

const segmentDuration = 10; // Segment duration in seconds
const segmentSize = sampleRate * segmentDuration;

let remainingAudio = audioData;
const partialResults: any[] = [];

while (remainingAudio.length >= segmentSize) {
  const segment = remainingAudio.slice(0, segmentSize);
  recognizer.acceptWaveform(segment);

  const partialResult = recognizer.partialResult();
  console.log(partialResult);
  partialResults.push(partialResult);

  remainingAudio = remainingAudio.slice(segmentSize);
}

recognizer.acceptWaveform(remainingAudio); // Process the remaining audio

const finalResult = recognizer.finalResult();
console.log(finalResult);

const combinedResult = partialResults.join(" ") + " " + finalResult;
console.log(combinedResult);
