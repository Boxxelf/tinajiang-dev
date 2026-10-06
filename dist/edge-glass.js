/* Lens displacement is based on circular sag, not a translucent blur overlay.
   The reference bends the outer 8% of the viewport with a 1:1 band strength
   and 16 spectral samples spanning 30% of the displacement. */
(() => {
  if (!CSS.supports('backdrop-filter', 'url(#edge-lens-top)')) return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;pointer-events:none;overflow:hidden';
  document.body.append(svg);
  const smooth = (a,b,x) => {const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
  const weights=Array.from({length:16},(_,i)=>{const t=i/15;return [1-smooth(.2,.8,t),smooth(0,.5,t)*(1-smooth(.5,1,t)),smooth(.2,.8,t)];});
  const totals=[0,1,2].map(c=>weights.reduce((sum,w)=>sum+w[c],0));
  let scheduled=0;
  function update(){
    scheduled=0;
    const band=innerHeight*.08, height=innerHeight*.096, width=innerWidth, density=Math.min(devicePixelRatio||1,2);
    const map=document.createElement('canvas');map.width=1;map.height=Math.ceil(height*density);
    const ctx=map.getContext('2d');
    if(!ctx)return;
    const pixels=ctx.createImageData(1,map.height);
    const defs=document.createElementNS(ns,'defs');
    for(const side of ['top','bottom']){
      for(let y=0;y<map.height;y++){
        const distance=(side==='top'?y+.5:map.height-y-.5)/density;
        const t=Math.max(0,1-distance/band);
        const sag=1-Math.sqrt(Math.max(0,1-t*t));
        pixels.data.set([128,Math.round(128+(side==='top'?1:-1)*127*sag),128,255],y*4);
      }
      ctx.putImageData(pixels,0,0);
      const filter=document.createElementNS(ns,'filter');
      for(const [key,value] of Object.entries({id:`edge-lens-${side}`,x:'0',y:'0',width:String(width),height:String(height),filterUnits:'userSpaceOnUse',primitiveUnits:'userSpaceOnUse','color-interpolation-filters':'sRGB'}))filter.setAttribute(key,value);
      const add=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));filter.append(el);return el;};
      add('feImage',{href:map.toDataURL(),x:0,y:0,width,height,preserveAspectRatio:'none',result:'mapImage'});
      const transfer=add('feComponentTransfer',{in:'mapImage',result:'lensMap'});
      // Fix the horizontal coordinate at exactly 0.5 (8-bit maps round it).
      for(const channel of ['R','G','B']){const f=document.createElementNS(ns,`feFunc${channel}`);f.setAttribute('type','linear');f.setAttribute('slope',channel==='G'?String(255/254):'0');f.setAttribute('intercept',channel==='G'?String(-1/254):'.5');transfer.append(f);}
      for(let i=0;i<16;i++){
        const spread=1+(side==='top'?-1:1)*(i/15-.5)*.3;
        add('feDisplacementMap',{in:'SourceGraphic',in2:'lensMap',scale:2*band*spread,xChannelSelector:'R',yChannelSelector:'G',result:`tap${i}`});
        const w=weights[i].map((x,c)=>x/totals[c]);
        add('feColorMatrix',{in:`tap${i}`,type:'matrix',values:`${w[0]} 0 0 0 0  0 ${w[1]} 0 0 0  0 0 ${w[2]} 0 0 0 0 0 1 0`,result:`color${i}`});
        if(i)add('feComposite',{in:i===1?'color0':`sum${i-1}`,in2:`color${i}`,operator:'arithmetic',k1:0,k2:1,k3:1,k4:0,result:`sum${i}`});
      }
      defs.append(filter);
    }
    svg.replaceChildren(defs);
    document.documentElement.classList.add('glass-refraction-ready');
  }
  const resize=()=>{if(!scheduled)scheduled=requestAnimationFrame(update);};
  addEventListener('resize',resize,{passive:true});
  update();
})();
