import { execSync } from 'child_process';

// Detect silence in the audio
const silenceInfo = execSync(ffmpeg -hide_banner -i file.mp4 -af silencedetect=noise=-30dB:d=1.50 -f null -).toString();

// Extract the first line of the silence information
const silencePoints = silenceInfo.split('\n')[0];

// Use the silence points to trim the input file
execSync(ffmpeg -hide_banner -i file.mp4 -to ${silencePoints} trimmed.mp4);