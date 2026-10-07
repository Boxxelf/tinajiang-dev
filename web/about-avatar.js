/* The generated portrait is mapped onto a shallow sculpted mesh. Head rotation
   and local eye texture movement are independent; no external runtime is needed. */
(() => {
  const canvas = document.querySelector('#tina-avatar');
  if (!canvas) return;
  const host = canvas.parentElement;
  const fallback = host.querySelector('img');
  const toggle = document.querySelector('.avatar-motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const gl = canvas.getContext('webgl', {alpha:true, antialias:true, premultipliedAlpha:false, powerPreference:'low-power'});
  if (!gl) return;

  const vertex = `
    attribute vec2 position;
    uniform vec2 turn;
    varying vec2 uv;
    void main() {
      uv = position * .5 + .5;
      float x = position.x;
      float y = position.y;
      float dome = sqrt(max(0., 1. - pow(x / .86, 2.) - pow((y + .02) / .94, 2.)));
      float face = exp(-pow(x / .54, 4.) - pow((y + .08) / .64, 4.));
      float nose = exp(-pow((x - .015) / .14, 2.) - pow((y + .085) / .19, 2.));
      float z = .22 * dome + .14 * face + .18 * nose - .16;
      float cy = cos(turn.x), sy = sin(turn.x);
      float cp = cos(turn.y), sp = sin(turn.y);
      vec3 p = vec3(cy*x + sy*z, y, -sy*x + cy*z);
      p = vec3(p.x, cp*p.y - sp*p.z, sp*p.y + cp*p.z);
      float roll = -turn.x * .10;
      p.xy = mat2(cos(roll), sin(roll), -sin(roll), cos(roll)) * p.xy;
      gl_Position = vec4(p.xy * .91, 0., 1. - p.z * .10);
    }`;
  const fragment = `
    precision mediump float;
    uniform sampler2D portrait;
    uniform vec2 gaze;
    varying vec2 uv;
    float eye(vec2 center) {
      vec2 q = (uv - center) / vec2(.060, .036);
      return 1. - smoothstep(.35, 1., dot(q,q));
    }
    void main() {
      float mask = max(eye(vec2(.419, .551)), eye(vec2(.600, .553)));
      vec2 look = uv - gaze * vec2(.014, .009) * mask;
      gl_FragColor = texture2D(portrait, look);
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
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  } catch { return; }
  gl.useProgram(program);

  const vertices = [], indices = [], resolution = 96;
  for (let y=0; y<=resolution; y++) {
    for (let x=0; x<=resolution; x++) vertices.push(x/resolution*2-1, y/resolution*2-1);
  }
  for (let y=0; y<resolution; y++) {
    for (let x=0; x<resolution; x++) {
      const a=y*(resolution+1)+x, b=a+resolution+1;
      indices.push(a,a+1,b,a+1,b+1,b);
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  const turnUniform = gl.getUniformLocation(program, 'turn');
  const gazeUniform = gl.getUniformLocation(program, 'gaze');
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let ready=false, visible=true, enabled=!reduced.matches, frame=0, last=0;
  let targetX=0, targetY=0, yaw=0, pitch=0, eyeX=0, eyeY=0;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function draw() {
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(turnUniform,yaw,pitch);
    gl.uniform2f(gazeUniform,eyeX,-eyeY);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }
  function tick(now) {
    frame=0;
    if (!ready || !visible || document.hidden) return;
    const dt=Math.min((now-last)/1000 || .016,.05); last=now;
    const headEase=1-Math.exp(-dt*7), eyeEase=1-Math.exp(-dt*15);
    const x=enabled?targetX:0, y=enabled?targetY:0;
    yaw+=(x*.32-yaw)*headEase;
    pitch+=(y*.21-pitch)*headEase;
    eyeX+=(x-eyeX)*eyeEase; eyeY+=(y-eyeY)*eyeEase;
    draw();
    if (Math.abs(yaw-x*.32)+Math.abs(pitch-y*.21)+Math.abs(eyeX-x)+Math.abs(eyeY-y)>.0002) start();
  }
  function start() { if (!frame && ready && visible && !document.hidden) frame=requestAnimationFrame(tick); }
  function resize() {
    const size=Math.round(host.clientWidth*Math.min(devicePixelRatio,2));
    if (canvas.width!==size) canvas.width=canvas.height=size;
    gl.viewport(0,0,canvas.width,canvas.height);
    if (ready) draw();
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
    toggle.hidden=!ready;
    toggle.textContent=enabled?'Pause motion':'Enable motion';
    toggle.setAttribute('aria-pressed',String(!enabled));
    host.setAttribute('aria-label',`A cartoon portrait of Tina with wavy black hair and colorful beaded earrings.${enabled?' Her head and eyes follow your pointer.':''}`);
  }
  function setMotion(on) {
    enabled=on;
    center();
    if (!on) { yaw=pitch=eyeX=eyeY=0; if (ready) draw(); }
    updateToggle();
  }
  toggle.addEventListener('click',()=>setMotion(!enabled));
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
    host.classList.remove('avatar-ready');toggle.hidden=true;
  });
  function load() {
    if (!fallback.naturalWidth) return;
    try { gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,fallback); }
    catch { return; }
    ready=true;resize();draw();host.classList.add('avatar-ready');updateToggle();
    if (!finePointer.matches) center();
  }
  if(fallback.complete)load();else fallback.addEventListener('load',load,{once:true});
})();
