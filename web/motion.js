/* Camera-facing image planes projected from a rotating 3D sphere.
   Reference: CleanShot 2026-10-04 at 10.39.16 AM, 0–14.78s. */
(() => {
  const stage = document.querySelector('.creative-space');
  if (!stage) return;
  const cards = [...stage.querySelectorAll('.space-card')];
  const intro = stage.querySelector('.space-intro');
  const status = document.querySelector('.space-status');
  const controls = [...document.querySelectorAll('[data-mode]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const count = cards.length;
  let width=stage.clientWidth, height=stage.clientHeight, mode='cloud', frame=0, last=0;
  let yaw=.36, pitch=-.12, velocityX=0, velocityY=0, targetX=0, targetY=0;
  let parallaxX=0, parallaxY=0, drag=null, distance=0, suppressClick=false;
  let hovered=-1, start=performance.now(), introDone=reduced.matches, hidden=false;
  const points=cards.map((card,i)=>{
    const y=1-2*(i+.5)/count;
    const r=Math.sqrt(1-y*y), phi=i*Math.PI*(3-Math.sqrt(5));
    return {x:Math.cos(phi)*r,y,z:Math.sin(phi)*r,px:0,py:0,pz:0,size:0,ratio:Number(card.dataset.ratio)};
  });
  const mix=(a,b,t)=>a+(b-a)*t;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
  function choose(next){mode=next;introDone=true;velocityX=velocityY=0;stage.dataset.mode=mode;controls.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));intro.hidden=true;startLoop();}
  controls.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.mode)));
  const label=i=>{if(i===hovered)return;hovered=i;status.textContent=i<0?'':`${cards[i].dataset.title} · ${cards[i].dataset.category}`;};
  cards.forEach((card,i)=>{
    card.addEventListener('pointerenter',()=>{if(!drag)label(i)});
    card.addEventListener('pointerleave',()=>{if(!drag)label(-1)});
    card.addEventListener('focus',()=>{if(card.matches(':focus-visible'))choose('index');label(i)});
    card.addEventListener('blur',()=>label(-1));
    card.addEventListener('dragstart',e=>e.preventDefault());
  });
  stage.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false}},true);
  stage.addEventListener('pointerdown',e=>{
    if(e.button!==0||!e.isPrimary||mode==='index')return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,time:performance.now(),moved:false,threshold:e.pointerType==='touch'?12:7};distance=0;suppressClick=false;
    velocityX=velocityY=0;stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove',e=>{
    if(e.pointerType!=='touch'){targetX=(e.clientX/width-.5)*2;targetY=(e.clientY/height-.5)*2;}
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    distance=Math.hypot(e.clientX-drag.originX,e.clientY-drag.originY);
    if(!drag.moved&&distance<=drag.threshold)return;
    drag.moved=true;
    if(drag.moved){introDone=true;intro.hidden=true;stage.setPointerCapture(e.pointerId);suppressClick=true;label(-1)}
    const dt=Math.max(performance.now()-drag.time,8)/1000;
    const sensitivity=width<600?.007:.005;
    yaw+=dx*sensitivity;pitch=clamp(pitch+dy*sensitivity,-1.25,1.25);
    velocityX=mix(velocityX,clamp(dx*sensitivity/dt,-4,4),.5);
    velocityY=mix(velocityY,clamp(dy*sensitivity/dt,-3,3),.5);
    drag={...drag,x:e.clientX,y:e.clientY,time:performance.now()};
  });
  function release(e){if(drag?.id!==e.pointerId)return;if(e.type==='pointercancel'||performance.now()-drag.time>100)velocityX=velocityY=0;drag=null;stage.classList.remove('is-dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);}
  addEventListener('pointerup',release);addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
  stage.addEventListener('pointerleave',()=>{targetX=targetY=0});
  stage.addEventListener('wheel',e=>{if(mode==='index'||reduced.matches)return;e.preventDefault();introDone=true;velocityX+=clamp(e.deltaY*.002+e.deltaX*.002,-.7,.7);startLoop()},{passive:false});
  stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||e.target!==stage)return;e.preventDefault();introDone=true;if(e.key==='ArrowLeft')yaw-=.18;if(e.key==='ArrowRight')yaw+=.18;if(e.key==='ArrowUp')pitch-=.14;if(e.key==='ArrowDown')pitch+=.14;startLoop()});
  function render(now){
    frame=0;if(hidden)return;
    if(mode==='index'){intro.hidden=true;cards.forEach(card=>{card.style.opacity='1';card.style.transform='';card.style.width='';card.style.height='';card.style.zIndex='';});return;}
    if(last&&now-last<15){frame=requestAnimationFrame(render);return;}
    const dt=last?Math.min((now-last)/1000,.04):1/60;last=now;
    // Keep the link under a stationary finger or mouse until click has completed.
    if(drag&&!drag.moved){frame=requestAnimationFrame(render);return;}
    const age=(now-start)/1000, small=width<600;
    if(age>5.6)introDone=true;
    if(!drag&&hovered<0&&!reduced.matches&&mode!=='index'&&introDone){yaw+=velocityX*dt;pitch=clamp(pitch+velocityY*dt,-1.25,1.25);const friction=Math.exp(-3.8*dt);velocityX*=friction;velocityY*=friction;yaw+=.035*dt;}
    parallaxX=mix(parallaxX,targetX,1-Math.exp(-4*dt));parallaxY=mix(parallaxY,targetY,1-Math.exp(-4*dt));
    const radius=Math.min(height*.32,width*(small?.34:.3),small&&!introDone?Math.max(24,(height-280)/2):Infinity);
    const base=Math.min(height*.125,width*(small?.16:.085));
    const easeFrame=reduced.matches?1:1-Math.exp(-8*dt);
    let phase='cloud', expansion=1;
    if(!introDone){phase='orbit';expansion=ease((age-.55)/1.6);if(age>3.65)expansion=1-ease((age-3.65)/.65);if(age>4.3){phase='cloud';expansion=ease((age-4.3)/1.3);}}
    intro.hidden=introDone;
    if(!introDone)intro.style.opacity=String(age<3.5?Math.min(age*3,1):1-ease((age-3.5)/.6));
    const columns=small?3:6,rows=Math.ceil(count/columns);
    const cellW=Math.min(width*.82/columns,150),cellH=Math.min((height-160)/rows,165);
    cards.forEach((card,i)=>{
      const p=points[i];let x,y,z,scale=1;
      if(mode==='index'){
        x=((i%columns)-(columns-1)/2)*cellW;y=(Math.floor(i/columns)-(rows-1)/2)*cellH;z=0;scale=small?.88:1.05;
      }else if((!introDone&&phase==='orbit')||mode==='orbit'){
        const angle=i/count*Math.PI*2-Math.PI/2+(introDone?yaw:(age-1)*.12);
        x=Math.cos(angle)*radius*expansion;y=Math.sin(angle)*radius*expansion;z=Math.sin(angle*2)*12;scale=.74*expansion;
      }else{
        const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
        const rx=p.x*cy+p.z*sy,rz=-p.x*sy+p.z*cy;
        const ry=p.y*cx-rz*sx;z=(p.y*sx+rz*cx)*radius*.65;
        const perspective=900/(900-z);
        x=rx*radius*perspective*expansion;y=-ry*radius*1.05*perspective*expansion;
        scale=perspective*(.78+(i%4)*.07)*expansion;
      }
      const focus=i===hovered&&mode!=='index'?1.12:1;
      p.px=mix(p.px,x+(mode==='index'?0:parallaxX*8),easeFrame);
      p.py=mix(p.py,y+(mode==='index'?0:parallaxY*6),easeFrame);
      p.pz=mix(p.pz,z,easeFrame);p.size=mix(p.size,scale*focus,easeFrame);
      const h=mode==='index'?Math.min(base,cellH-40):base;
      const w=`${Math.max(44,h*p.ratio)}px`, hh=`${Math.max(48,h)}px`;if(card.style.width!==w)card.style.width=w;if(card.style.height!==hh)card.style.height=hh;
      card.style.transform=`translate(-50%,-50%) translate3d(${p.px.toFixed(2)}px,${p.py.toFixed(2)}px,0) scale(${p.size.toFixed(4)})`;
      const order=String(Math.round(p.pz+1000)),opacity=String(introDone?1:ease((age-.6)/.8));if(card.style.zIndex!==order)card.style.zIndex=order;if(card.style.opacity!==opacity)card.style.opacity=opacity;
    });
    // Reduced-motion and the index are stationary once interpolation settles.
    if(!reduced.matches)frame=requestAnimationFrame(render);
  }
  function startLoop(){if(!frame&&!hidden){last=0;frame=requestAnimationFrame(render)}}
  function accessibility(){if(reduced.matches)choose('index');else startLoop()}
  reduced.addEventListener('change',accessibility);
  addEventListener('resize',()=>{width=stage.clientWidth;height=stage.clientHeight;startLoop()});
  document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden){cancelAnimationFrame(frame);frame=0}else startLoop()});
  addEventListener('pagehide',()=>{hidden=true;cancelAnimationFrame(frame);frame=0});
  addEventListener('pageshow',()=>{hidden=document.hidden;startLoop()});
  stage.dataset.mode=mode;if(reduced.matches)choose('index');else startLoop();
})();
