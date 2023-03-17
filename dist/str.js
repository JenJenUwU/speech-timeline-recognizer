#!/usr/bin/env node
"use strict";var B=Object.create;var y=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var I=Object.getOwnPropertyNames;var T=Object.getPrototypeOf,q=Object.prototype.hasOwnProperty;var G=(o,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of I(t))!q.call(o,r)&&r!==e&&y(o,r,{get:()=>t[r],enumerable:!(n=C(t,r))||n.enumerable});return o};var i=(o,t,e)=>(e=o!=null?B(T(o)):{},G(t||!o||!o.__esModule?y(e,"default",{value:o,enumerable:!0}):e,o));var u=i(require("fs")),w=i(require("path")),h=require("commander");var v=i(require("fs")),k=i(require("path")),z=require("stream"),g=i(require("vosk-lib")),L=i(require("wav")),W=i(require("fuse.js")),D=require("opencc");var b=i(require("path")),R=b.default.resolve(__dirname,"..","model"),S=process.env.VERBOSE;var O=i(require("os")),c=i(require("path")),_=require("child_process");function E(o,t="ffmpeg"){let e=c.default.resolve(O.default.tmpdir(),`${c.default.basename(o)}.wav`),n=["-loglevel","error","-i",c.default.basename(o),"-af","agate=range=0:ratio=100:threshold=0.01","-acodec","pcm_s16le","-ac","1","-ar","16000",e];return(0,_.spawnSync)(t,n,{cwd:c.default.dirname(o),stdio:S?"inherit":"ignore"}),e}var M=!1,P,$=new D.OpenCC("s2t.json");function F(o,t,e){return M===!1&&(e||console.log("Loading model ..."),g.default.setLogLevel(-1),P=new g.default.Model(R),M=!0,e||console.log("Model loaded.")),o=E(k.default.resolve(o)),new Promise(n=>{e||console.log(`Recognizing ${o} ...`);let r=v.default.createReadStream(o,{highWaterMark:4096}),s=new L.default.Reader,l=new z.Readable().wrap(s);s.on("format",async({audioFormat:f,sampleRate:N,channels:V})=>{if(f!=1||V!=1)throw new Error("Audio file must be WAV with mono PCM.");let a=new g.default.Recognizer({model:P,sampleRate:N});a.setMaxAlternatives(3),a.setWords(!0),a.setPartialWords(!0);let p=[];for await(let m of l)if(a.acceptWaveform(m)){let x=await j(a.result(),t);p.push(x),t&&(t=t.slice(x.text.length))}p.push(await j(a.finalResult(),t));let A={text:p.map(m=>m.text).join(""),words:p.map(m=>m.result.map(d=>({start:d.start,end:d.end,value:d.word}))).flat()};e||console.log(`Recognized ${o}`),r.close(()=>{n(A),v.default.rmSync(o)}),a.free()}),r.pipe(s)})}async function j(o,t){let{alternatives:e}=o;for(let n=0;n<e.length;n++){e[n].text=await $.convertPromise(e[n].text.replace(/\s+/g,""));for(let r=0;r<e[n].result.length;r++)e[n].result[r].word=await $.convertPromise(e[n].result[r].word);delete e[n].confidence}if(t){let r=new W.default(e,{keys:["text"],threshold:1}).search(t);return r.length>0?r.map(s=>s.item)[0]:{result:[],text:""}}else return e[0]}var J=JSON.parse(u.default.readFileSync(w.default.join(__dirname,"..","package.json"),"utf8"));h.program.version(`${J.name} ${J.version}`);h.program.argument("<wav...>","Path to the wav file").option("-e, --expect <expected result>","The expected result").option("-o, --output <path>","The output path").option("-f, --force","Force to overwrite the output file if it exists").option("-p, --pretty","Pretty print the result with indentation").option("-s, --silent","Silent mode").action(async(o,{expect:t,output:e,force:n,pretty:r,silent:s})=>{e&&(e=w.default.resolve(e),u.default.existsSync(e)&&!n&&(s||console.error(`${e} already exists.`),process.exit(1)));let l={};for(let f of o)l[f]=await F(w.default.resolve(f),t,s);s||console.log(JSON.stringify(l,null,r?4:0)),e?(u.default.writeFileSync(e,JSON.stringify(l,null,r?4:0)),s||console.log(`Results is written to ${e}`)):console.log(JSON.stringify(l,null,r?4:0))});h.program.parse();
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