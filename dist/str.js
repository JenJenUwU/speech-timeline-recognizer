#!/usr/bin/env node
"use strict";var A=Object.create;var b=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var C=Object.getOwnPropertyNames;var I=Object.getPrototypeOf,T=Object.prototype.hasOwnProperty;var q=(t,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let r of C(o))!T.call(t,r)&&r!==e&&b(t,r,{get:()=>o[r],enumerable:!(n=B(o,r))||n.enumerable});return t};var i=(t,o,e)=>(e=t!=null?A(I(t)):{},q(o||!t||!t.__esModule?b(e,"default",{value:t,enumerable:!0}):e,t));var a=i(require("fs")),y=i(require("path")),S=require("commander");var O=i(require("fs")),J=i(require("path")),N=require("stream"),v=i(require("vosk-lib")),z=i(require("wav")),D=i(require("fuse.js")),L=require("opencc");var R=i(require("path")),_=R.default.resolve(__dirname,"..","model"),$=process.env.VERBOSE;var E=i(require("os")),g=i(require("path")),M=require("child_process");function F(t,o="ffmpeg"){let e=g.default.resolve(E.default.tmpdir(),`${g.default.basename(t)}.wav`),n=["-loglevel","error","-i",g.default.basename(t),"-af","agate=range=0:ratio=100:threshold=0.01","-acodec","pcm_s16le","-ac","1","-ar","16000",e];return(0,M.spawnSync)(o,n,{cwd:g.default.dirname(t),stdio:$?"inherit":"ignore"}),e}var P=!1,j,k=new L.OpenCC("s2t.json");function W(t,o,e){return P===!1&&(e||console.log("Loading model ..."),v.default.setLogLevel(-1),j=new v.default.Model(_),P=!0,e||console.log("Model loaded.")),t=F(J.default.resolve(t)),new Promise(n=>{e||console.log(`Recognizing ${t} ...`);let r=O.default.createReadStream(t,{highWaterMark:4096}),s=new z.default.Reader,p=new N.Readable().wrap(s);s.on("format",async({audioFormat:u,sampleRate:w,channels:c})=>{if(u!=1||c!=1)throw new Error("Audio file must be WAV with mono PCM.");let m=new v.default.Recognizer({model:j,sampleRate:w});m.setMaxAlternatives(3),m.setWords(!0),m.setPartialWords(!0);let f=[];for await(let l of p)if(m.acceptWaveform(l)){let h=await G(m.result(),o);f.push(h),o&&(o=o.slice(h.text.length))}let x={text:f.map(l=>l.text).join(""),words:f.map(l=>l.result.map(d=>({start:d.start,end:d.end,value:d.word}))).flat()};e||console.log(`Recognized ${t}`),r.close(()=>{n(x),O.default.rmSync(t)}),m.free()}),r.pipe(s)})}async function G(t,o){let{alternatives:e}=t;for(let n=0;n<e.length;n++){e[n].text=await k.convertPromise(e[n].text.replace(/\s+/g,""));for(let r=0;r<e[n].result.length;r++)e[n].result[r].word=await k.convertPromise(e[n].result[r].word);delete e[n].confidence}if(o){let r=new D.default(e,{keys:["text"],threshold:1}).search(o);return r.length>0?r.map(s=>s.item)[0]:{result:[],text:""}}else return e[0]}var V=JSON.parse(a.default.readFileSync(y.default.join(__dirname,"..","package.json"),"utf8"));S.program.version(`${V.name} ${V.version}`);S.program.argument("<wav...>","Path to the wav file").option("-e, --expect <expected result>","The expected result").option("-o, --output <path>","The output path").option("-f, --force","Force to overwrite the output file if it exists").option("-p, --pretty","Pretty print the result with indentation").option("-s, --silent","Silent mode").action(async(t,{expect:o,output:e,force:n,pretty:r,silent:s})=>{e&&(e=y.default.resolve(e),a.default.existsSync(e)&&!n&&(s||console.error(`${e} already exists.`),process.exit(1)));let p={};for(let c of t)p[c]=await W(y.default.resolve(c),o,s);s||console.log(JSON.stringify(p,null,r?4:0)),e?(a.default.writeFileSync(e,JSON.stringify(p,null,r?4:0)),s||console.log(`Results is written to ${e}`)):console.log(JSON.stringify(p,null,r?4:0));let u=JSON.parse(a.default.readFileSync(`${e}`,"utf-8")),w="output";a.default.existsSync(w)||a.default.mkdirSync(w);for(let c in u){let f=`output/${c.replace(/[/.]/g,"_")}.txt`;a.default.writeFileSync(f,"");let x=u[c].words;for(let l of x){let d=`${l.value}	${l.start}	${l.end}`,h=JSON.stringify(d);a.default.appendFileSync(f,JSON.parse(h)),a.default.appendFileSync(f,`
`)}}});S.program.parse();
