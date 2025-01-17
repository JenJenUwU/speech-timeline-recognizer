import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { VERBOSE } from "./constants.js";

/**
 * Convert to 16000 Hz mono WAV file.
 * @param source Path to the wav file
 * @param ffmpeg Path to the ffmpeg executable
 */
export function convert(source: string, ffmpeg = "ffmpeg"): string {
    const temp = path.resolve(os.tmpdir(), `${path.basename(source)}.wav`);
    const args = [
        "-loglevel",
        "error",
        "-i",
        path.basename(source),
        "-af",
        "agate=range=0:ratio=100:threshold=0.01, dynaudnorm=p=0.5:m=100:s=12:g=15, loudnorm=I=-10:LRA=11:TP=-1",
        "-acodec",
        "pcm_s16le",
        "-ac",
        "1",
        "-ar",
        "16000",
        temp,
    ];

    spawnSync(ffmpeg, args, {
        cwd: path.dirname(source),
        stdio: VERBOSE ? "inherit" : "ignore",
    });

    return temp;
}