/* Transform measured lines without rewriting copy, changing its reading order,
   or replacing real links. Layout is measured only after reflow, never per word
   on scroll. No dependency on the portrait renderer is required. */
(() => {
  const journey=document.querySelector('.about-journey');
  const avatar=journey?.querySelector('.avatar-anchor');
  if(!journey || !avatar) return;
  const toggle=document.querySelector('.avatar-motion-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width: 760px), (max-width: 1000px) and (max-height: 540px)');
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
  function motionEnabled(){return !reduced.matches&&toggle?.getAttribute('aria-pressed')!=='true';}
  function reset(){avatar.style.removeProperty('transform');for(const element of [...words,...headings]) element.style.removeProperty('transform');}
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
    const mobile=compact.matches;
    const viewport=document.documentElement.clientWidth;
    const scroll=window.scrollY;
    const progress=clamp(scroll/160,0,1);
    const ease=progress*progress*(3-2*progress);
    const portraitSize=clamp(viewport*.28,90,120);
    // Keep the large opening portrait; make room for readable side lanes as
    // visitors scroll. Only compositor transforms change between measurements.
    if(mobile)avatar.style.transform=`scale(${(1-(1-portraitSize/200)*ease).toFixed(4)})`;
    const rect=avatar.getBoundingClientRect();
    const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;
    const margin=mobile?16:24;
    const radiusY=mobile?rect.height*.50+12:rect.height*.62+24;
    const radiusX=mobile?rect.width*.50+10:rect.width*.52+26;
    const amplitude=rect.width*(mobile?.48:.64),spread=radiusY*.96;
    function edgeAt(dy,halfLine=0){
      if(!mobile)return radiusX*Math.sqrt(Math.max(0,1-(dy/radiusY)**2));
      const clearance=Math.max(0,Math.abs(dy)-halfLine);
      const t=clamp((clearance-rect.height/2-4)/40,0,1);
      return radiusX*(1-t*t*(3-2*t));
    }
    for(const line of lines){
      const y=line.top-scroll+line.height/2;
      const dy=y-centerY;
      // A broad bell-shaped curve makes the approach and return gradual.
      let distance=amplitude*Math.exp(-.5*(dy/spread)**2);
      const edge=edgeAt(dy,line.height/2);
      const required=line.direction<0?line.right-(centerX-edge):(centerX+edge)-line.left;
      if(Math.abs(dy)<radiusY+line.height/2) distance=Math.max(distance,required);
      const available=line.direction<0?line.left-margin:viewport-margin-line.right;
      const offset=line.direction*clamp(distance,0,Math.max(0,available));
      const transform=`translate3d(${offset.toFixed(2)}px,0,0)`;
      if(line.transform!==transform){
        for(const word of line.words)word.style.transform=transform;
        line.transform=transform;
      }
    }
    for(const heading of headingBounds){
      const top=heading.top-scroll,bottom=top+heading.height;
      // Use the closest edge of the full heading, so every line of the title
      // clears the portrait while its typography remains a coherent group.
      const dy=centerY<top?top-centerY:centerY>bottom?bottom-centerY:0;
      const edge=edgeAt(dy);
      let distance=(heading.width/2+radiusX+6)*Math.exp(-.5*(dy/(spread+heading.height*.2))**2);
      const required=heading.direction<0?heading.right-(centerX-edge):(centerX+edge)-heading.left;
      if(Math.abs(dy)<radiusY) distance=Math.max(distance,required);
      // The introduction starts exactly centered. Its first movement belongs
      // to scrolling, not to the distant tail of the avoidance curve.
      if(heading.element===introduction){
        const arrival=clamp((scroll-24)/120,0,1);
        distance*=arrival*arrival*(3-2*arrival);
      }
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
  compact.addEventListener('change',remeasure);
  reduced.addEventListener('change',remeasure);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) remeasure();});
  if(toggle) new MutationObserver(remeasure).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
  new ResizeObserver(remeasure).observe(journey);
  document.fonts?.ready.then(remeasure);
  document.fonts?.addEventListener('loadingdone',remeasure);
  measure();
})();
