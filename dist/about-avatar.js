/* Closed reference-contour reconstruction with photo-projected front color.
   Depth and the unseen back are inferred from the approved front image.
   See scripts/build-avatar-model.py and the portable reference GLB. */
(() => {
  const canvas = document.querySelector('#tina-avatar');
  if (!canvas) return;
  const host = canvas.parentElement;
  const toggle = document.querySelector('.avatar-motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power'
  });
  function fallbackMotionControl() {
    if (!toggle) return;
    let enabled = !reduced.matches;
    const update = () => {
      toggle.hidden = false;
      toggle.textContent = enabled ? 'Pause motion' : 'Enable motion';
      toggle.setAttribute('aria-pressed', String(!enabled));
    };
    toggle.addEventListener('click', () => { enabled = !enabled; update(); });
    reduced.addEventListener('change', event => { enabled = !event.matches; update(); });
    update();
  }
  if (!gl) { fallbackMotionControl(); return; }

  const vertex = `
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 textureCoordinate;
    attribute vec3 backColor;
    uniform vec2 turn;
    uniform vec2 gaze;
    varying vec2 uv;
    varying vec3 rearColor;
    varying float photographWeight;
    varying vec3 worldPosition;
    varying vec3 worldNormal;
    varying vec3 referenceNormal;
    vec3 rotateHead(vec3 p) {
      float cy=cos(turn.x),sy=sin(turn.x),cp=cos(turn.y),sp=sin(turn.y);
      p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
      return vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
    }
    float eye(vec2 center) {
      vec2 q=(textureCoordinate-center)/vec2(.045,.069);
      return 1.-smoothstep(.35,1.,dot(q,q));
    }
    void main() {
      vec3 p=position;
      float eyes=max(eye(vec2(.404,.482)),eye(vec2(.590,.482)));
      p.xy+=gaze*vec2(.032,.022)*eyes;
      uv=textureCoordinate;
      rearColor=backColor;
      photographWeight=smoothstep(.05,.30,position.z);
      referenceNormal=normal;
      worldPosition=rotateHead(p);
      worldNormal=normalize(rotateHead(normal));
      gl_Position=vec4(worldPosition.xy*(3.58/5.2),-worldPosition.z*.18,1.);
    }`;
  const fragment = `
    precision mediump float;
    uniform sampler2D portrait;
    uniform vec2 lightPosition;
    uniform float rear;
    varying vec2 uv;
    varying vec3 rearColor;
    varying float photographWeight;
    varying vec3 worldPosition;
    varying vec3 worldNormal;
    varying vec3 referenceNormal;
    void main() {
      vec3 n=normalize(worldNormal);
      vec3 view=normalize(vec3(0.,0.,5.2)-worldPosition);
      if(rear>.5) {
        vec3 color=mix(12.92*rearColor,1.055*pow(max(rearColor,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),rearColor));
        float glint=pow(max(0.,dot(reflect(-view,n),normalize(vec3(lightPosition,1.2)))),18.)*.025*min(1.,length(lightPosition));
        gl_FragColor=vec4(mix(color,vec3(1.,.97,.90),glint),1.);
        return;
      }
      vec4 reference=texture2D(portrait,uv);
      if(reference.a<.12)discard;
      // Preserve the approved photograph's color and fine contours. Move only
      // the broad reflected illumination, leaving eye rims and hair seams clear.
      vec2 shift=(n.xy-normalize(referenceNormal).xy)*.028+lightPosition*.007;
      vec4 lighting=texture2D(portrait,uv,3.2);
      vec4 moved=texture2D(portrait,uv+shift,3.2);
      float safe=smoothstep(.88,.99,min(lighting.a,moved.a));
      vec3 ratio=clamp((moved.rgb+.10)/(lighting.rgb+.10),vec3(.84),vec3(1.17));
      vec3 color=reference.rgb*mix(vec3(1.),ratio,safe);
      float turning=min(1.,length(n-normalize(referenceNormal))*4.);
      float grazing=smoothstep(.40,.80,1.-abs(dot(n,view)))*turning;
      vec3 softRim=lighting.rgb/max(lighting.a,.25);
      color=mix(color,softRim,grazing*.72);
      vec3 reflected=reflect(-view,n);
      vec3 lamp=normalize(vec3(lightPosition*1.5,1.2));
      float glint=pow(max(0.,dot(reflected,lamp)),18.)*min(1.,length(lightPosition))*.035;
      color=mix(color,vec3(1.,.97,.90),glint);
      vec3 gold=mix(12.92*rearColor,1.055*pow(max(rearColor,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),rearColor));
      color=mix(gold,color,photographWeight);
      gl_FragColor=vec4(clamp(color,0.,1.),1.);
    }`;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Portrait shader unavailable');
    }
    return shader;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { fallbackMotionControl(); return; }
  } catch { fallbackMotionControl(); return; }
  gl.useProgram(program);

  let frontCount=0, totalCount=0;
  const turnUniform=gl.getUniformLocation(program,'turn');
  const gazeUniform=gl.getUniformLocation(program,'gaze');
  const lightUniform=gl.getUniformLocation(program,'lightPosition');
  const rearUniform=gl.getUniformLocation(program,'rear');
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  let ready=false,visible=true,enabled=!reduced.matches,frame=0,last=0;
  const restYaw=0,restPitch=0;
  let targetX=0,targetY=0,yaw=restYaw,pitch=restPitch,eyeX=0,eyeY=0;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function draw() {
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(turnUniform,yaw,pitch);
    gl.uniform2f(gazeUniform,eyeX,-eyeY);
    gl.uniform2f(lightUniform,eyeX,-eyeY);
    gl.uniform1f(rearUniform,0);
    gl.drawElements(gl.TRIANGLES,frontCount,gl.UNSIGNED_SHORT,0);
    gl.uniform1f(rearUniform,1);
    gl.drawElements(gl.TRIANGLES,totalCount-frontCount,gl.UNSIGNED_SHORT,frontCount*2);
  }
  function tick(now) {
    frame=0;
    if(!ready||!visible||document.hidden)return;
    const dt=Math.min((now-last)/1000||.016,.05);last=now;
    const headEase=1-Math.exp(-dt*7),eyeEase=1-Math.exp(-dt*15);
    const x=enabled?targetX:0,y=enabled?targetY:0;
    const desiredYaw=x*.24,desiredPitch=y*.14;
    yaw+=(desiredYaw-yaw)*headEase;pitch+=(desiredPitch-pitch)*headEase;
    eyeX+=(x-eyeX)*eyeEase;eyeY+=(y-eyeY)*eyeEase;
    draw();
    if(Math.abs(yaw-desiredYaw)+Math.abs(pitch-desiredPitch)+Math.abs(eyeX-x)+Math.abs(eyeY-y)>.0002)start();
  }
  function start(){if(!frame&&ready&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
  function resize(){
    const size=Math.max(1,Math.round(host.clientWidth*Math.min(devicePixelRatio,2)));
    if(canvas.width!==size)canvas.width=canvas.height=size;
    gl.viewport(0,0,canvas.width,canvas.height);
    if(ready)draw();
  }
  function point(event) {
    if (!enabled || !visible || (event.pointerType==='touch' && !host.contains(event.target))) return;
    const rect=host.getBoundingClientRect();
    targetX=clamp((event.clientX-rect.left-rect.width/2)/Math.max(innerWidth*.38,160),-1,1);
    targetY=clamp((event.clientY-rect.top-rect.height/2)/Math.max(innerHeight*.35,180),-1,1);
    start();
  }
  function center() { targetX=targetY=0; start(); }
  function updateToggle() {
    if (toggle) {
      toggle.hidden=false;
      toggle.textContent=enabled?'Pause motion':'Enable motion';
      toggle.setAttribute('aria-pressed',String(!enabled));
    }
    host.setAttribute('aria-label',`A three-dimensional champagne-gold portrait of Tina with center-parted waves and beaded earrings.${enabled&&ready?' Her head, eyes and soft warm reflections follow your pointer.':''}`);
  }
  function setMotion(on) {
    enabled=on;
    center();
    if (!on) { yaw=restYaw;pitch=restPitch;eyeX=eyeY=0;if (ready) draw(); }
    updateToggle();
  }
  if (toggle) toggle.addEventListener('click',()=>setMotion(!enabled));
  reduced.addEventListener('change',event=>setMotion(!event.matches));
  window.addEventListener('pointermove',point,{passive:true});
  host.addEventListener('pointerdown',point,{passive:true});
  host.addEventListener('pointercancel',center,{passive:true});
  host.addEventListener('pointerup',event=>{if(event.pointerType==='touch')center();},{passive:true});
  document.documentElement.addEventListener('pointerleave',center);
  window.addEventListener('blur',center);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;targetX=targetY=0;}else start();
  });
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible)start();else{cancelAnimationFrame(frame);frame=0;targetX=targetY=0;}
  }).observe(host);
  new ResizeObserver(resize).observe(host);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();ready=false;cancelAnimationFrame(frame);frame=0;
    host.classList.remove('avatar-ready');updateToggle();
  });
  async function loadModel(){
    try{
      const photo=host.querySelector('img');
      const response=await fetch('/assets/tina-avatar-reference-v2.bin');
      if(!response.ok)throw new Error('Portrait model unavailable');
      const bytes=await response.arrayBuffer();
      const header=new Uint32Array(bytes,0,4);
      if(header[0]!==0x54494E42)throw new Error('Invalid portrait model');
      const count=header[1];frontCount=header[2];totalCount=header[3];
      if(bytes.byteLength!==16+count*44+totalCount*2)throw new Error('Incomplete portrait model');
      gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(bytes,16,count*11),gl.STATIC_DRAW);
      for(const [name,size,offset] of [['position',3,0],['normal',3,12],['textureCoordinate',2,24],['backColor',3,32]]){
        const attribute=gl.getAttribLocation(program,name);
        gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,size,gl.FLOAT,false,44,offset);
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(bytes,16+count*44,totalCount),gl.STATIC_DRAW);
      await photo.decode();
      gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,photo);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      ready=true;resize();host.classList.add('avatar-ready');updateToggle();
    }catch{ready=false;host.classList.remove('avatar-ready');updateToggle();}
  }
  updateToggle();
  loadModel();
})();
