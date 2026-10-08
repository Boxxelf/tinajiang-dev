import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Exercise the production scroll handler with measured text fixtures. Browser
// checks cover the actual font layout; this catches discontinuities between them.
const source=fs.readFileSync(new URL('../web/about-flow.js',import.meta.url),'utf8');
const events=()=>({listeners:{},addEventListener(k,f){(this.listeners[k]??=[]).push(f)},emit(k){for(const f of this.listeners[k]??[])f()}});
for(const width of [320,390,430,1280]){
  const mobile=width<=760,center=width/2;
  const win={...events(),scrollY:0};
  const frames=new Map();let id=0,mutation;
  const style=()=>({removeProperty(k){delete this[k]}});
  const shift=e=>Number(e.style.transform?.match(/translate3d\(([-\d.]+)/)?.[1]??0);
  const element=(left,top,w,h)=>({style:style(),dataset:{},getBoundingClientRect(){const x=left+shift(this);return{left:x,right:x+w,top:top-win.scrollY,width:w,height:h}}});
  const lane=mobile?(width-Math.max(90,Math.min(120,width*.28)))/2-32:230;
  const gap=mobile?12:26;
  const left=element(center-gap-lane,1000,lane,24);
  const right=element(center+gap,1000,lane,24);
  const link=element(center-gap-lane,1200,lane,42);
  const words=[left,right,link];
  const copies=[{classList:{contains:()=>true},querySelectorAll:q=>q==='a'?[]:[left,link]},{classList:{contains:()=>false},querySelectorAll:q=>q==='a'?[]:[right]}];
  const heading=element(center-lane/2,850,lane,70);
  const intro=element(center-lane/2,600,lane,50);
  const avatar={style:style(),getBoundingClientRect(){const scale=Number(this.style.transform?.match(/scale\(([^)]+)/)?.[1]??1),size=(mobile?200:220)*scale;return{left:center-size/2,top:422-size/2,width:size,height:size}}};
  const toggle={paused:false,getAttribute(){return String(this.paused)}};
  const reduced={...events(),matches:false},compact={...events(),matches:mobile};
  const journey={classList:{toggle(){}},querySelector:q=>q==='.avatar-anchor'?avatar:intro,querySelectorAll:q=>q==='.chapter-copy'?copies:q==='.chapter-heading'?[heading]:words};
  const doc={...events(),hidden:false,documentElement:{clientWidth:width},querySelector:q=>q==='.about-journey'?journey:toggle,createTreeWalker:()=>({nextNode:()=>false})};
  vm.runInNewContext(source,{window:win,document:doc,matchMedia:q=>q.includes('reduced')?reduced:compact,NodeFilter:{SHOW_TEXT:4},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i),MutationObserver:class{constructor(f){mutation=f}observe(){}},ResizeObserver:class{observe(){}}});
  const flush=()=>{const jobs=[...frames.values()];frames.clear();for(const f of jobs)f()};
  const scroll=y=>{win.scrollY=y;win.emit('scroll');flush();return shift(left)};
  assert.equal(shift(intro),0,'Introduction starts centered');
  let previous,velocity,maxStep=0,maxAcceleration=0;
  for(let y=250;y<=950;y++){
    const x=scroll(y);
    if(previous!==undefined){const step=x-previous;maxStep=Math.max(maxStep,Math.abs(step));if(velocity!==undefined)maxAcceleration=Math.max(maxAcceleration,Math.abs(step-velocity));velocity=step;}
    previous=x;
    assert.equal(frames.size,0,'No continuous idle animation loop');
    assert(left.getBoundingClientRect().left>=15.99,'Text stays on screen');
  }
  assert(maxStep<1,`No displacement jump at ${width}px: ${maxStep}`);
  assert(maxAcceleration<.08,`No curve corner at ${width}px: ${maxAcceleration}`);
  // A line closer to the portrait center must move farther, not stick to a wall.
  assert(Math.abs(scroll(550))>Math.abs(scroll(530))+.2,'No flat side plateau');
  win.emit('resize');flush();assert.notEqual(left.style.transform,undefined,'Resize restores transforms in the measurement frame');
  toggle.paused=true;mutation();flush();assert.equal(left.style.transform,undefined);assert.equal(avatar.style.transform,undefined);
  toggle.paused=false;mutation();flush();assert.notEqual(left.style.transform,undefined);
  reduced.matches=true;reduced.emit('change');flush();assert.equal(left.style.transform,undefined);
  console.log(`PASS: ${width}px flow continuity, edge bounds, centered intro, resize, pause and reduced motion`);
}
