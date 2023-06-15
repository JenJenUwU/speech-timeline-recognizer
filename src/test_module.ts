import Vosk, { Model, Recognizer } from "vosk-lib";
import path from "path";
import fs from 'fs';

const MODEL_DIR = path.resolve(__dirname, "..", "model");

// Set the path to the Vosk model and the audio sample rate
const sampleRate = 16000;

// Set the path to the audio file
const audioFilePath = 'C:/Users/Admin/Desktop/CodingFiles/speech-timeline-recognizer/data/sub-0002/sub-0002_ffmpeg.wav';

// Create a Vosk recognizer
const model = new Vosk.Model(MODEL_DIR);
const recognizer = new Vosk.Recognizer({ model: model, sampleRate: sampleRate });

// Read the audio file
const audioData = fs.readFileSync(audioFilePath);

// Process the audio data
recognizer.acceptWaveform(audioData);

// Get the final result
console.log(recognizer.finalResult());
console.log(recognizer.result());