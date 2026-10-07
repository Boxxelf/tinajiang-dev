import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname.replace(/\/$/,'');
let now=0,id=0,draws=0;const timers=new Map(),frames=new Map(),uniforms={};
const events=()=>({events:{},addEventListener(k,f){(this.events[k]??=[]).push(f)},emit(k,e={}){for(const f of this.events[k]??[])f(e)}});
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_,n)=>n,getAttribLocation:()=>0,uniform2f:(n,x,y)=>uniforms[n]=[x,y],drawElements:()=>draws++},{get:(t,k)=>k in t?t[k]:()=>({})});
const toggle={...events(),hidden:true,attrs:{},setAttribute(k,v){this.attrs[k]=v}};
const photo={decode:async()=>{}};const host={...events(),clientWidth:200,classList:{add(){},remove(){}},setAttribute(){},querySelector:()=>photo,getBoundingClientRect:()=>({left:0,top:0,width:200,height:200})};
const canvas={...events(),parentElement:host,getContext:()=>gl};const doc={...events(),hidden:false,documentElement:events(),querySelector:q=>q==='#tina-avatar'?canvas:toggle};
const reduced={...events(),matches:false},compact={...events(),matches:true};let intersection;
const bytes=fs.readFileSync(root+'/public/assets/tina-avatar-reference-v2.bin');
const context={document:doc,window:events(),matchMedia:q=>q.includes('reduced')?reduced:compact,devicePixelRatio:3,innerWidth:390,innerHeight:844,performance:{now:()=>now},Math:Object.assign(Object.create(Math),{random:()=>.5}),Float32Array,Uint32Array,Uint16Array,
 setTimeout:(f,delay)=>{const key=++id;timers.set(key,{f,due:now+delay});return key},clearTimeout:k=>timers.delete(k),requestAnimationFrame:f=>{const key=++id;frames.set(key,f);return key},cancelAnimationFrame:k=>frames.delete(k),
 IntersectionObserver:class{constructor(f){intersection=f}observe(){}},ResizeObserver:class{observe(){}},fetch:async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)})};
vm.runInNewContext(fs.readFileSync(root+'/web/about-avatar.js','utf8'),context);await new Promise(r=>setImmediate(r));
const frame=delta=>{now+=delta;const jobs=[...frames.values()];frames.clear();for(const f of jobs)f(now)};
assert.equal(canvas.width,300,'Mobile pixel ratio is capped');assert.equal(frames.size,0,'Idle does not keep rendering');assert.equal(timers.size,1);
const [key,timer]=[...timers][0];timers.delete(key);now=timer.due;timer.f();frame(85);assert(uniforms.eyelids.every(v=>v<.06),'Both eyelids close');frame(210);assert.deepEqual(uniforms.eyelids,[1,1]);assert.equal(frames.size,0);assert.equal(timers.size,1);
toggle.emit('click');frame(16);assert.equal(timers.size,0,'Pause cancels next blink');assert.deepEqual(uniforms.eyelids,[1,1]);assert.equal(frames.size,0);
toggle.emit('click');frame(16);assert.equal(timers.size,1);intersection([{isIntersecting:false}]);assert.equal(timers.size,0);assert.equal(frames.size,0);
intersection([{isIntersecting:true}]);frame(16);assert.equal(timers.size,1);doc.hidden=true;doc.emit('visibilitychange');assert.equal(timers.size,0);doc.hidden=false;doc.emit('visibilitychange');frame(16);assert.equal(timers.size,1);
reduced.emit('change',{matches:true});frame(16);assert.equal(timers.size,0);assert.deepEqual(uniforms.eyelids,[1,1]);
console.log('PASS: blink closure/reopening, idle rendering, pause/resume, offscreen, hidden tab, reduced motion, mobile DPR. Draw calls:',draws);
