# speech-timeline-recognizer
## Requirements
1. PNPM
2. Nodejs
3. ffmpeg
4. Vosk model - Chinese
## How to Setup

1. Install PNPM: <https://pnpm.io/installation>
2. Install ffmpeg: <https://ffmpeg.org/download.html>
3. Clone git repository to local directory
```
git clone https://github.com/JenJenUwU/speech-timeline-recognizer.git
```
4. Install Node.js 18: `pnpm env use -g 18`
5. Run `pnpm i` to install all dependencies. It will take a while since it downloads a big model (1~2 GB)
[The model (vosk-model-cn-0.22)](https://alphacephei.com/vosk/models) is released under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license.

## How to Use

1. Help: `pnpm start --help`
2. Build it 'pnpm build'
3. Run it:
```sh
pnpm start -output "output json name" -expect "The expected result" "The path to the wav file"
```
# Optional Argument
```sh
-p: Toggle pretty
-f: Overwrite original file
-s: Silence Terminal    
```
4. Example run code:
```sh
pnpm start -o results.json -p -f -e "我的濾水器有點問題水位指示過高而且一直漏水能請你禮拜二上午派工程師來看看嗎這個禮拜我只有那天有空請記得跟我確認時間非常感謝" data/sub-*/*_text-*.wav
```
## Known Error
1. Type Error occurs when the audio file does not fit the expected result in a large scale (Failed recording)