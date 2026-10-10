/* 결. V8 — experimental, single-context WebGL2 luminous glass renderer.
   One active large orb only; V7 Canvas remains the fallback.
   This script has no dependencies and does not alter stored records. */
(function(global){
'use strict';
const VERT=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){
  vUv=(aPos+1.0)*0.5;
  gl_Position=vec4(aPos,0.,1.);
}`;
const FRAG=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec3 uColors[4];
uniform int uCount;
uniform float uTime;
uniform float uAnimate;
uniform float uAspect;

float sat(float x){return clamp(x,0.,1.);}
float gaussian(vec2 p,vec2 c,vec2 radius) {
  vec2 d=(p-c)/radius;
  return exp(-dot(d,d)*1.45);
}
vec4 emotionWeights(vec2 p){
  if(uCount<=1) return vec4(1.,0.,0.,0.);
  if(uCount==2) {
    float t=smoothstep(-.55,.55,(p.x+p.y)*.7071);
    return vec4(1.-t,t,0.,0.);
  }
  if(uCount==3) {
    float top=(1.-p.y)/3.;
    vec4 w=max(vec4(top,(1.-top-p.x*.57735027)*.5,(1.-top+p.x*.57735027)*.5,0.),0.);
    w=pow(w,vec4(1.48));
    return w/max(.00001,dot(w,vec4(1.)));
  }
  float u=(p.x+1.)*.5,v=(p.y+1.)*.5;
  vec4 w=pow(max(vec4((1.-u)*(1.-v),u*(1.-v),u*v,(1.-u)*v),0.),vec4(1.48));
  return w/max(.00001,dot(w,vec4(1.)));
}
vec3 pigmentAt(vec2 p) {
  vec4 w=emotionWeights(p);
  vec3 c=uColors[0]*w.x+uColors[1]*w.y+uColors[2]*w.z+uColors[3]*w.w;
  return c;
}
void main(){
  // Full quad is 3.4 diameters; sphere is r=1, halo extends beyond it.
  vec2 p=(vUv-.5)*3.40;
  p.x*=uAspect;
  float r=length(p);
  if(r>1.62){fragColor=vec4(0.);return;}
  float t=uTime*uAnimate;
  vec2 L=vec2(.13*sin(t*.78)+.02,.12*cos(t*.78)-.045);
  vec3 local=pigmentAt(p);
  if(r<=1.008) {
    float z=sqrt(max(0.,1.-r*r));
    float core=gaussian(p,L,vec2(.225,.205));
    float scatter=gaussian(p,L,vec2(.54,.53));
    float shimmer=gaussian(p,L+vec2(.11,.06),vec2(.14,.115));
    // A glass skin of the same tint; do NOT produce a white edge or ring.
    float surface=.52+.18*z;
    float innerShield=1.-smoothstep(.72,1.,r);
    float light=.25*scatter+.50*core+.14*shimmer*innerShield;
    vec3 stained=local*surface;
    vec3 coreColor=mix(local,vec3(1.,.982,.945),.71);
    vec3 illuminated=stained + coreColor*light;
    illuminated += local*.11*scatter*innerShield;
    // Small soft wandering glimmer is driven by exactly the same light position.
    illuminated=mix(illuminated,vec3(1.,.982,.950),.22*shimmer*innerShield);
    // Color stays saturated near the rim, no separate border stroke.
    float edgeAlpha=1.-smoothstep(.993,1.008,r);
    // The external halo is already under the sphere via the alpha blend.
    fragColor=vec4(clamp(illuminated,0.,1.)*edgeAlpha,edgeAlpha);
    return;
  }
  // Color each halo pixel using the pigment at its OWN compass position:
  // yellow on yellow side, blue on blue side (not the average of all colors).
  vec2 n=p/max(r,.0001);
  vec3 haloColor=pigmentAt(n*.94);
  float radial=exp(-pow(max(0.,r-1.)/.265,1.6));
  // The halo responds to the SAME moving internal light, rather than a CSS keyframe.
  float directional=.66+.34*sat(dot(n,normalize(L+vec2(.002,.002)))*.55+.5);
  float w=.27*radial*directional;
  float outerMask=1.-smoothstep(1.47,1.62,r);
  float alpha=w*outerMask;
  fragColor=vec4(haloColor*alpha,alpha);
}`;
const hex=code=>{
  if(typeof code!=='string'||!/^#[0-9a-fA-F]{6}$/.test(code))return [0.65,0.65,0.65];
  return [1,3,5].map(i=>parseInt(code.slice(i,i+2),16)/255);
};
function compile(gl,type,src){
 const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
   const why=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error('shader: '+why);
 }return shader;
}
function makeProgram(gl){
 const vert=compile(gl,gl.VERTEX_SHADER,VERT),frag=compile(gl,gl.FRAGMENT_SHADER,FRAG),program=gl.createProgram();
 gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);
 gl.deleteShader(vert);gl.deleteShader(frag);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link: '+gl.getProgramInfoLog(program));
 return program;
}
function create(){
 const canvas=document.createElement('canvas');canvas.className='gyeol-shader';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'low-power'});
 if(!gl)return null;
 let program,buffer;
 try{
   program=makeProgram(gl);buffer=gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
   gl.useProgram(program);const attr=gl.getAttribLocation(program,'aPos');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 }catch(e){console.warn('결. WebGL2 initialization failed:',e);return null}
 const uniform={
    colors:gl.getUniformLocation(program,'uColors[0]'),count:gl.getUniformLocation(program,'uCount'),
    time:gl.getUniformLocation(program,'uTime'),animate:gl.getUniformLocation(program,'uAnimate'),
    aspect:gl.getUniformLocation(program,'uAspect')
 };
 let host=null,colors=[],raf=0,running=false,lost=false,frame=0,start=performance.now(),reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),visible=true;
 const stop=()=>{running=false;if(raf)cancelAnimationFrame(raf);raf=0};
 const resize=()=>{
   if(!host)return;
   const diameter=host.getBoundingClientRect().width||180;
   const dpr=Math.min(window.devicePixelRatio||1,1.5);
   const pixel=Math.round(Math.min(512,Math.max(180,diameter*1.7*dpr)));
   if(canvas.width!==pixel||canvas.height!==pixel){canvas.width=pixel;canvas.height=pixel;}
 };
 const paint=(now)=>{
   if(!host||lost)return;
   resize();
   gl.viewport(0,0,canvas.width,canvas.height);
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
   let packed=new Float32Array(12);
   colors.slice(0,4).forEach((color,i)=>packed.set(hex(color),i*3));
   gl.uniform3fv(uniform.colors,packed);
   gl.uniform1i(uniform.count,Math.min(4,Math.max(1,colors.length)));
   gl.uniform1f(uniform.time,(now-start)*.001);
   gl.uniform1f(uniform.animate,reduced.matches?0:1);
   gl.uniform1f(uniform.aspect,1);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 };
 const loop=now=>{
   if(!running)return;
   if(now-frame>=1000/30){frame=now;paint(now)}
   raf=requestAnimationFrame(loop);
 };
 const run=()=>{
   if(!host||document.hidden||lost)return;
   if(reduced.matches){stop();paint(performance.now());return}
   if(!running){running=true;raf=requestAnimationFrame(loop)}
 };
 const clearHost=()=>{
   stop();
   if(host){host.classList.remove('shader-orb');host=null}
   canvas.remove();
 };
 canvas.addEventListener('webglcontextlost',ev=>{ev.preventDefault();lost=true;stop();if(host){host.classList.remove('shader-orb');host=null}canvas.remove()});
 canvas.addEventListener('webglcontextrestored',()=>{lost=false;/* Host will reattach on next UI update. */});
 const onVisibility=()=>{if(document.hidden)stop();else run()};
 document.addEventListener('visibilitychange',onVisibility);
 const onResize=()=>{if(host)paint(performance.now())};
 window.addEventListener('resize',onResize,{passive:true});
 return {
   mount(next,chosen){
     if(!next||!chosen?.length){clearHost();return false}
     if(host!==next){
       clearHost();host=next;next.appendChild(canvas);next.classList.add('shader-orb');
       start=performance.now();
     }
     colors=chosen.slice(0,4);resize();paint(performance.now());run();return true
   },
   detach:clearHost,
   snapshot(){if(host){stop();paint(performance.now());return canvas.toDataURL('image/png')}return null},
   dispose(){
     clearHost();document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('resize',onResize);
     gl.deleteBuffer(buffer);gl.deleteProgram(program)
   }
 };
}
global.GyeolShader={create,supported(){const c=document.createElement('canvas');return Boolean(c.getContext('webgl2'))}};
})(window);
