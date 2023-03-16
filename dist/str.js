#!/usr/bin/env node
"use strict";var B=Object.create;var y=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var I=Object.getPrototypeOf,q=Object.prototype.hasOwnProperty;var G=(t,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let r of T(o))!q.call(t,r)&&r!==e&&y(t,r,{get:()=>o[r],enumerable:!(n=C(o,r))||n.enumerable});return t};var s=(t,o,e)=>(e=t!=null?B(I(t)):{},G(o||!t||!t.__esModule?y(e,"default",{value:t,enumerable:!0}):e,t));var u=s(require("fs")),w=s(require("path")),h=require("commander");var v=s(require("fs")),k=s(require("path")),z=require("stream"),g=s(require("vosk-lib")),L=s(require("wav")),W=s(require("fuse.js")),D=require("opencc");var b=s(require("path")),R=b.default.resolve(__dirname,"..","model"),S=process.env.VERBOSE;var O=s(require("os")),m=s(require("path")),_=require("child_process");function E(t,o="ffmpeg"){let e=m.default.resolve(O.default.tmpdir(),`${m.default.basename(t)}.wav`),n=["-loglevel","error","-i",m.default.basename(t),"-af","agate=range=0:ratio=100:threshold=0.01","-acodec","pcm_s16le","-ac","1","-ar","16000",e];return(0,_.spawnSync)(o,n,{cwd:m.default.dirname(t),stdio:S?"inherit":"ignore"}),e}var M=!1,P,$=new D.OpenCC("s2t.json");function F(t,o,e){return M===!1&&(e||console.log("Loading model ..."),g.default.setLogLevel(-1),P=new g.default.Model(R),M=!0,e||console.log("Model loaded.")),t=E(k.default.resolve(t)),new Promise(n=>{e||console.log(`Recognizing ${t} ...`);let r=v.default.createReadStream(t,{highWaterMark:4096}),i=new L.default.Reader,l=new z.Readable().wrap(i);i.on("format",async({audioFormat:f,sampleRate:N,channels:V})=>{if(f!=1||V!=1)throw new Error("Audio file must be WAV with mono PCM.");let a=new g.default.Recognizer({model:P,sampleRate:N});a.setMaxAlternatives(10),a.setWords(!0),a.setPartialWords(!0);let p=[];for await(let c of l)if(a.acceptWaveform(c)){let x=await j(a.result(),o);p.push(x),o&&(o=o.slice(x.text.length))}p.push(await j(a.finalResult(),o));let A={text:p.map(c=>c.text).join(""),words:p.map(c=>c.result.map(d=>({start:d.start,end:d.end,value:d.word}))).flat()};e||console.log(`Recognized ${t}`),r.close(()=>{n(A),v.default.rmSync(t)}),a.free()}),r.pipe(i)})}async function j(t,o){let{alternatives:e}=t;for(let n=0;n<e.length;n++){e[n].text=await $.convertPromise(e[n].text.replace(/\s+/g,""));for(let r=0;r<e[n].result.length;r++)e[n].result[r].word=await $.convertPromise(e[n].result[r].word);delete e[n].confidence}if(o){let r=new W.default(e,{keys:["text"],threshold:1}).search(o);return r.length>0?r.map(i=>i.item)[0]:{result:[],text:""}}else return e[0]}var J=JSON.parse(u.default.readFileSync(w.default.join(__dirname,"..","package.json"),"utf8"));h.program.version(`${J.name} ${J.version}`);h.program.argument("<wav...>","Path to the wav file").option("-e, --expect <expected result>","The expected result").option("-o, --output <path>","The output path").option("-f, --force","Force to overwrite the output file if it exists").option("-p, --pretty","Pretty print the result with indentation").option("-s, --silent","Silent mode").action(async(t,{expect:o,output:e,force:n,pretty:r,silent:i})=>{e&&(e=w.default.resolve(e),u.default.existsSync(e)&&!n&&(i||console.error(`${e} already exists.`),process.exit(1)));let l={};for(let f of t)l[f]=await F(w.default.resolve(f),o,i);console.log(JSON.stringify(l,null,r?4:0)),e?(u.default.writeFileSync(e,JSON.stringify(l,null,r?4:0)),i||console.log(`Results is written to ${e}`)):console.log(JSON.stringify(l,null,True?4:0))});h.program.parse();
const fs = require('fs')
const path = require('path')

const json = JSON.parse(fs.readFileSync('results.json', 'utf-8'));

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