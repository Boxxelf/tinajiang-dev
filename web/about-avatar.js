/* A small, self-contained 3D sculpture: closed head, hair, eyes and earrings.
   Champagne metal reflects soft studio lights; no portrait texture or runtime
   download is used. Pointer motion changes the geometry and its reflections. */
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
    attribute float material;
    attribute float eyePart;
    uniform vec2 turn;
    uniform vec2 gaze;
    varying vec3 worldPosition;
    varying vec3 worldNormal;
    varying vec3 localPosition;
    varying float metalKind;
    vec3 rotateHead(vec3 p) {
      float cy = cos(turn.x), sy = sin(turn.x);
      float cp = cos(turn.y), sp = sin(turn.y);
      p = vec3(cy*p.x + sy*p.z, p.y, -sy*p.x + cy*p.z);
      p = vec3(p.x, cp*p.y - sp*p.z, sp*p.y + cp*p.z);
      float roll = -turn.x * .075;
      p.xy = mat2(cos(roll), sin(roll), -sin(roll), cos(roll)) * p.xy;
      return p;
    }
    void main() {
      vec3 p = position;
      // Eyes move across the convex face, independently of the head rotation.
      vec2 eyeOffset = gaze * vec2(.041, .026) * eyePart;
      p.xy += eyeOffset;
      p.z -= (position.x * eyeOffset.x * 1.28 + (position.y + .21) * eyeOffset.y * .80);
      localPosition = p;
      worldPosition = rotateHead(p);
      worldNormal = normalize(rotateHead(normal));
      metalKind = material;
      float cameraDistance = 5.2 - worldPosition.z;
      float focal = 3.58;
      // True perspective and depth keep side volumes and overlapping locks solid.
      gl_Position = vec4(worldPosition.xy * focal,
        cameraDistance * 1.020202 - .2020202, cameraDistance);
    }`;
  const fragment = `
    precision mediump float;
    uniform vec2 lightPosition;
    varying vec3 worldPosition;
    varying vec3 worldNormal;
    varying vec3 localPosition;
    varying float metalKind;
    float softbox(vec3 reflection, vec2 center, vec2 size) {
      vec2 q = (reflection.xy - center) / size;
      return exp(-.5 * (pow(q.x, 4.) + pow(q.y, 4.)))
        * smoothstep(-.20, .35, reflection.z);
    }
    void main() {
      vec3 n = normalize(worldNormal);
      vec3 view = normalize(vec3(0., 0., 5.2) - worldPosition);
      vec3 reflection = reflect(-view, n);
      vec3 champagne = vec3(.90, .66, .39);
      if (metalKind > .5 && metalKind < 1.5) champagne *= vec3(.95, .95, .94);
      if (metalKind > 1.5 && metalKind < 2.5) champagne = vec3(.29, .22, .13);
      if (metalKind > 2.5) champagne = vec3(.94, .72, .43);

      float key = max(0., dot(n, normalize(vec3(-.55, .85, 1.2))));
      float fill = max(0., dot(n, normalize(vec3(.95, .15, .65))));
      float facing = max(0., dot(n, view));
      float fresnel = pow(1. - facing, 3.);
      // A warm, neutral environment leaves readable shading even away from a light.
      float sky = smoothstep(-.70, .65, reflection.y);
      vec3 environment = mix(vec3(.060, .051, .040), vec3(.49, .46, .40), sky);
      float horizon = exp(-pow((reflection.y + .24) / .24, 2.));
      environment *= 1. - horizon * .38;
      vec3 color = champagne * (environment * .70 + .014 + key * .024 + fill * .012);

      // Broad ivory studio panels reveal the curves instead of making black chrome.
      float upper = softbox(reflection, vec2(-.44, .50), vec2(.30, .19));
      float right = softbox(reflection, vec2(.75, .10), vec2(.145, .55));
      float bottom = softbox(reflection, vec2(-.58, -.70), vec2(.19, .25));
      color += vec3(1., .94, .82) * (upper * .90 + right * .68 + bottom * .27);

      // The moving reflection is pale peach. Both light direction and the actual
      // surface normal determine where it appears; there is no painted color patch.
      vec3 movingLight = normalize(vec3(lightPosition.x * 1.55 + .18,
        lightPosition.y * 1.15 + .04, 1.25));
      float moving = pow(max(0., dot(reflection, movingLight)), 11.);
      color += vec3(.98, .80, .66) * moving * .20;
      color += champagne * fresnel * .11;
      if (metalKind < .5) {
        float fringeShade = exp(-pow((localPosition.y - .48) / .15, 2.));
        color *= 1. - fringeShade * .12;
      }
      color = pow(clamp(color, 0., 1.), vec3(1. / 2.2));
      gl_FragColor = vec4(color, 1.);
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

  const vertices = [], indices = [];
  const normalize = p => {
    const length = Math.hypot(...p) || 1;
    return p.map(v => v / length);
  };
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  function addVertex(p, n, material, eye = 0) {
    vertices.push(...p, ...n, material, eye);
  }
  function ellipsoid(center, radius, material = 0, eye = 0, segments = 40, rings = 28) {
    const offset = vertices.length / 8;
    for (let j = 0; j <= rings; j++) {
      const theta = Math.PI * j / rings, s = Math.sin(theta), c = Math.cos(theta);
      for (let i = 0; i <= segments; i++) {
        const phi = Math.PI * 2 * i / segments;
        const unit = [s * Math.cos(phi), c, s * Math.sin(phi)];
        const p = unit.map((v, k) => center[k] + v * radius[k]);
        const n = normalize(unit.map((v, k) => v / radius[k]));
        addVertex(p, n, material, eye);
      }
    }
    for (let j = 0; j < rings; j++) for (let i = 0; i < segments; i++) {
      const a = offset + j * (segments + 1) + i, b = a + segments + 1;
      indices.push(a, a+1, b, a+1, b+1, b);
    }
  }
  function curvePoint(points, t) {
    const scaled = Math.min(.999999, Math.max(0, t)) * (points.length - 1);
    const index = Math.floor(scaled), f = scaled-index;
    const a = points[Math.max(0,index-1)], b = points[index];
    const c = points[Math.min(points.length-1,index+1)], d = points[Math.min(points.length-1,index+2)];
    return b.map((v,k) => .5 * ((2*v) + (-a[k]+c[k])*f
      + (2*a[k]-5*v+4*c[k]-d[k])*f*f + (-a[k]+3*v-3*c[k]+d[k])*f*f*f));
  }
  function lock(points, material = 1, depth = .84) {
    const steps = (points.length-1)*12, sides = 18, offset = vertices.length/8;
    const frames = [];
    for (let j = 0; j <= steps; j++) {
      const t = j/steps, p = curvePoint(points,t);
      const before = curvePoint(points,Math.max(0,t-.002));
      const after = curvePoint(points,Math.min(1,t+.002));
      const tangent = normalize(after.slice(0,3).map((v,k) => v-before[k]));
      const n = normalize(cross(tangent,[0,0,1])), b = normalize(cross(tangent,n));
      frames.push({p,tangent,n,b});
    }
    const surfacePoint = (frame,c,s) => frame.p.slice(0,3).map((v,k) =>
      v + frame.n[k]*c*frame.p[3] + frame.b[k]*s*frame.p[3]*depth);
    for (let j = 0; j <= steps; j++) {
      const frame = frames[j];
      for (let i = 0; i <= sides; i++) {
        const angle = Math.PI*2*i/sides, c = Math.cos(angle), s = Math.sin(angle);
        const point = surfacePoint(frame,c,s);
        const before = surfacePoint(frames[Math.max(0,j-1)],c,s);
        const after = surfacePoint(frames[Math.min(steps,j+1)],c,s);
        const along = after.map((v,k) => v-before[k]);
        const around = frame.n.map((v,k) => -v*s + frame.b[k]*c*depth);
        let normal = normalize(cross(around,along));
        const radial = frame.n.map((v,k) => v*c + frame.b[k]*s);
        if (normal.reduce((sum,v,k) => sum+v*radial[k],0)<0) normal=normal.map(v=>-v);
        addVertex(point,normal,material);
      }
    }
    for (let j = 0; j < steps; j++) for (let i = 0; i < sides; i++) {
      const a = offset+j*(sides+1)+i, b = a+sides+1;
      indices.push(a,a+1,b,a+1,b+1,b);
    }
    // Close both ends, so a turned lock has a real, solid silhouette.
    for (const end of [0,steps]) {
      const centerIndex = vertices.length/8, frame = frames[end];
      addVertex(frame.p.slice(0,3),frame.tangent.map(v => v*(end===0?-1:1)),material);
      for (let i=0;i<sides;i++) indices.push(centerIndex,offset+end*(sides+1)+i,offset+end*(sides+1)+i+1);
      ellipsoid(frame.p.slice(0,3),[frame.p[3],frame.p[3],frame.p[3]*depth],material,0,20,14);
    }
  }

  // The head extends behind the face. The hair surrounds it in depth, rather
  // than being painted onto a front-facing disc.
  ellipsoid([0,.05,-.29],[.75,.93,.56],1);
  ellipsoid([0,-.19,.22],[.665,.745,.55],0,0,64,48);
  for (const side of [-1,1]) {
    const mirror = points => points.map(([x,y,z,r]) => [x*side,y,z,r]);
    lock(mirror([
      [.06,.88,.18,.085],[.29,1.045,.18,.23],[.56,.92,.18,.25],
      [.75,.65,.13,.23],[.94,.43,.05,.22],[.91,.20,-.02,.07]
    ]));
    lock(mirror([
      [.69,.35,-.02,.14],[.87,.14,.045,.21],[.93,-.12,.04,.23],
      [.79,-.39,.045,.18],[.92,-.69,-.01,.23],[.86,-.97,-.015,.24],
      [.60,-1.12,.01,.13],[.49,-1.075,.005,.025]
    ]),1,.90);
    lock(mirror([
      [.67,-.54,.10,.095],[.62,-.80,.19,.17],[.48,-1.03,.15,.16],
      [.65,-1.18,.02,.17],[.82,-1.13,-.02,.035]
    ]));
    // The S-curved fringe leaves a small center part and overlaps the scalp.
    lock(mirror([
      [.045,.69,.55,.065],[.23,.79,.55,.17],[.43,.71,.57,.205],
      [.56,.47,.59,.18],[.67,.25,.55,.15],[.82,.15,.39,.065]
    ]),0,.79);
    ellipsoid([side*.68,-.32,.30],[.13,.18,.12],0,0,28,20);
    for (let bead=0;bead<3;bead++) {
      const radius = .066 + bead*.014;
      ellipsoid([side*.745,-.49-bead*.158,.40],[radius,radius*1.07,radius],3,0,28,20);
    }
    // Small inset gold pill eyes retain the approved minimalist expression.
    const eyeX = side*.25, eyeY = -.205;
    const eyeZ = .22+.55*Math.sqrt(1-(eyeX/.665)**2-((eyeY+.19)/.745)**2);
    ellipsoid([eyeX,eyeY,eyeZ+.025],[.083,.171,.043],2,1,32,24);
    ellipsoid([eyeX,eyeY,eyeZ+.052],[.068,.155,.052],3,1,32,24);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  for (const [name,size,offset] of [['position',3,0],['normal',3,12],['material',1,24],['eyePart',1,28]]) {
    const attribute = gl.getAttribLocation(program,name);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute,size,gl.FLOAT,false,32,offset);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  const turnUniform = gl.getUniformLocation(program,'turn');
  const gazeUniform = gl.getUniformLocation(program,'gaze');
  const lightUniform = gl.getUniformLocation(program,'lightPosition');

  let ready=true, visible=true, enabled=!reduced.matches, frame=0, last=0;
  const restYaw=-.075, restPitch=.035;
  let targetX=0, targetY=0, yaw=restYaw, pitch=restPitch, eyeX=0, eyeY=0;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function draw() {
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(turnUniform,yaw,pitch);
    gl.uniform2f(gazeUniform,eyeX,-eyeY);
    gl.uniform2f(lightUniform,eyeX,-eyeY);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
  }
  function tick(now) {
    frame=0;
    if (!ready || !visible || document.hidden) return;
    const dt=Math.min((now-last)/1000 || .016,.05); last=now;
    const headEase=1-Math.exp(-dt*7), eyeEase=1-Math.exp(-dt*15);
    const x=enabled?targetX:0, y=enabled?targetY:0;
    const desiredYaw=restYaw+x*.44, desiredPitch=restPitch+y*.25;
    yaw+=(desiredYaw-yaw)*headEase;
    pitch+=(desiredPitch-pitch)*headEase;
    eyeX+=(x-eyeX)*eyeEase; eyeY+=(y-eyeY)*eyeEase;
    draw();
    if (Math.abs(yaw-desiredYaw)+Math.abs(pitch-desiredPitch)+Math.abs(eyeX-x)+Math.abs(eyeY-y)>.0002) start();
  }
  function start() { if (!frame && ready && visible && !document.hidden) frame=requestAnimationFrame(tick); }
  function resize() {
    const size=Math.max(1,Math.round(host.clientWidth*Math.min(devicePixelRatio,2)));
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
  resize();
  host.classList.add('avatar-ready');
  updateToggle();
})();
