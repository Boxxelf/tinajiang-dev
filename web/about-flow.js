/* Transform measured lines without rewriting copy, changing its reading order,
   or replacing real links. Layout is measured only after reflow, never per word
   on scroll. No dependency on the portrait renderer is required. */
(() => {
  const journey=document.querySelector('.about-journey');
  const avatar=journey?.querySelector('.avatar-anchor');
  if(!journey || !avatar) return;
  const toggle=document.querySelector('.avatar-motion-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const wide=matchMedia('(min-width: 761px) and (min-height: 541px), (min-width: 1001px)');
  const copies=[...journey.querySelectorAll('.chapter-copy')];
  const headings=[...journey.querySelectorAll('.chapter-heading')];
  headings.forEach((heading,index)=>{heading.dataset.flowSide=index%2?'right':'left';});
  const introduction=journey.querySelector('.about-introduction');
  if(introduction){introduction.dataset.flowSide='right';headings.push(introduction);}
  let lines=[], headingBounds=[], frame=0, measuring=false, active=false;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

  let words=[],prepared=false;
  function prepareWords(){
    if(prepared)return;
    prepared=true;
  // Whitespace stays as native text, preserving selection and screen-reader prose.
  for(const copy of copies){
    const walker=document.createTreeWalker(copy,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const node of nodes){
      if(!node.textContent.trim() || node.parentElement.closest('a')) continue;
      const fragment=document.createDocumentFragment();
      for(const part of node.textContent.split(/(\s+)/)){
        if(!part) continue;
        if(/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
        else {const word=document.createElement('span');word.className='about-flow-word';word.textContent=part;fragment.append(word);}
      }
      node.replaceWith(fragment);
    }
    // Move each link as one target, including its underline and focus outline.
    for(const link of copy.querySelectorAll('a')) link.classList.add('about-flow-word');
  }
  words=[...journey.querySelectorAll('.about-flow-word')];
  }
  function motionEnabled(){return wide.matches&&!reduced.matches&&toggle?.getAttribute('aria-pressed')!=='true';}
  function reset(){for(const element of [...words,...headings]) element.style.removeProperty('transform');}
  function measure(){
    if(measuring) return;
    const nextActive=motionEnabled();
    if(!nextActive&&!active)return;
    measuring=true;
    active=nextActive;
    if(active)prepareWords();
    journey.classList.toggle('about-flow-active',active);
    reset(); lines=[]; headingBounds=[];
    if(active){
      const scroll=window.scrollY;
      for(const copy of copies){
        const direction=copy.classList.contains('chapter-left')?-1:1;
        let line;
        for(const word of copy.querySelectorAll('.about-flow-word')){
          const rect=word.getBoundingClientRect();
          if(!line || Math.abs(rect.top+scroll-line.top)>2){
            line={words:[],top:rect.top+scroll,height:rect.height,left:rect.left,right:rect.right,direction};
            lines.push(line);
          }
          line.words.push(word);line.left=Math.min(line.left,rect.left);line.right=Math.max(line.right,rect.right);
        }
      }
      headingBounds=headings.map(element=>{
        const rect=element.getBoundingClientRect();
        return {element,top:rect.top+scroll,height:rect.height,width:rect.width,left:rect.left,right:rect.right,direction:element.dataset.flowSide==='left'?-1:1};
      });
    }
    measuring=false;
    schedule();
  }
  function draw(){
    frame=0;
    if(!active || document.hidden) return;
    const rect=avatar.getBoundingClientRect();
    const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;
    const scroll=window.scrollY,margin=24;
    const radiusY=rect.height*.62+24,radiusX=rect.width*.52+26;
    const amplitude=rect.width*.64,spread=radiusY*.96;
    const viewport=document.documentElement.clientWidth;
    for(const line of lines){
      const y=line.top-scroll+line.height/2;
      const dy=y-centerY;
      // A broad bell-shaped curve makes the approach and return gradual.
      let distance=amplitude*Math.exp(-.5*(dy/spread)**2);
      const edge=radiusX*Math.sqrt(Math.max(0,1-(dy/radiusY)**2));
      const required=line.direction<0?line.right-(centerX-edge):(centerX+edge)-line.left;
      if(Math.abs(dy)<radiusY) distance=Math.max(distance,required);
      const available=line.direction<0?line.left-margin:viewport-margin-line.right;
      const offset=line.direction*clamp(distance,0,Math.max(0,available));
      const transform=`translate3d(${offset.toFixed(2)}px,0,0)`;
      for(const word of line.words) word.style.transform=transform;
    }
    for(const heading of headingBounds){
      const top=heading.top-scroll,bottom=top+heading.height;
      // Use the closest edge of the full heading, so every line of the title
      // clears the portrait while its typography remains a coherent group.
      const dy=centerY<top?top-centerY:centerY>bottom?bottom-centerY:0;
      const edge=radiusX*Math.sqrt(Math.max(0,1-(dy/radiusY)**2));
      let distance=(heading.width/2+radiusX+6)*Math.exp(-.5*(dy/(spread+heading.height*.2))**2);
      const required=heading.direction<0?heading.right-(centerX-edge):(centerX+edge)-heading.left;
      if(Math.abs(dy)<radiusY) distance=Math.max(distance,required);
      const available=heading.direction<0?heading.left-margin:viewport-margin-heading.right;
      const offset=heading.direction*clamp(distance,0,Math.max(0,available));
      heading.element.style.transform=`translate3d(${offset.toFixed(2)}px,0,0)`;
    }
  }
  function schedule(){if(active&&!document.hidden&&!frame) frame=requestAnimationFrame(draw);}
  let resizeFrame=0;
  function remeasure(){if(!resizeFrame) resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;measure();});}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',remeasure,{passive:true});
  wide.addEventListener('change',remeasure);
  reduced.addEventListener('change',remeasure);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) remeasure();});
  if(toggle) new MutationObserver(remeasure).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
  new ResizeObserver(remeasure).observe(journey);
  document.fonts?.ready.then(remeasure);
  document.fonts?.addEventListener('loadingdone',remeasure);
  measure();
})();
