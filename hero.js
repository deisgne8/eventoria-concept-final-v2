(async () => {
'use strict';
const heroElement=document.querySelector('.hero,.work-hero,.process-page-hero,.about-page-hero');
const canvas=document.getElementById('field')||(()=>{const element=document.createElement('canvas');element.id='field';element.setAttribute('aria-hidden','true');return element;})();
if(heroElement&&canvas.parentElement!==heroElement)heroElement.prepend(canvas);
const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
if(!gl)return;
const vertex=`attribute vec3 aPosition;attribute float aSeed;attribute float aOuter;attribute vec2 aDisplacement;attribute float aEnergy;
uniform float uTime;uniform float uReveal;uniform float uScrollTurn;uniform float uHeat;uniform vec2 uPointer;uniform float uHover;uniform vec2 uSize;uniform float uScale;uniform vec2 uOffset;uniform mediump float uGlow;uniform float uHero;uniform float uDpr;uniform float uAudio;uniform float uBass;uniform float uBeat;
varying mediump vec4 vColor;varying mediump float vSeed;
void main(){
vSeed=aSeed;vec3 p=aPosition;float t=uTime;float ambient=step(1.5,aOuter);
float phase=aSeed*62.8318;
float scatter=1.-uReveal;
// A coherent, volumetric emblem: the silhouette remains legible as it floats.
float yaw=sin(t*.24)*.23+uScrollTurn;
p.xz=mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw))*p.xz;
float roll=sin(t*.18)*.035;
p.xy=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*p.xy;
p.xy+=vec2(sin(t*.65+p.y*4.+phase),cos(t*.52+p.x*4.+phase))*.012;
p.y+=sin(t*.8)*.045;
float orbit=phase+scatter*5.;
p.xy+=vec2(cos(orbit),sin(orbit))*(1.1+aSeed*1.7)*scatter;
p.z+=sin(orbit*2.)*scatter;
if(ambient>.5){
p=aPosition;
p.x+=sin(t*.11+phase)*.16;
p.y=mod(p.y+t*(.018+aSeed*.022)+2.6,5.2)-2.6;
}
p*=1.+(uBass*.025+uBeat*.22)*(1.-ambient);
// Timed energy burst synchronized with the separate boom sound.
p.xyz+=vec3(sin(phase*3.+t*83.),cos(phase*5.+t*97.),sin(phase*7.+t*71.))*uBeat*.06*(1.-ambient);
float burstMotes=step(.92,aSeed)*(1.-ambient);
p.xyz+=normalize(aPosition+vec3(.001))*sin((1.-uBeat)*3.14159)*uBeat*1.8*burstMotes;
p.xy+=normalize(p.xy+vec2(.001))*sin(length(p.xy)*10.-t*5.)*uAudio*.025*(1.-ambient);
float perspective=4.5/(4.5-p.z*.65);
vec2 pos=p.xy*perspective*uScale+aDisplacement*(1.-ambient);
pos+=uOffset*(1.-ambient);
pos+=uPointer*.012*uHover*uHero*(1.-ambient);
gl_Position=vec4(pos.x/uSize.x*2.,pos.y/uSize.y*2.,0.,1.);
float sparkle=pow(max(0.,sin(phase+t*(.6+aSeed*.8))),12.);
float pointSize=(2.4+aSeed*4.2+sparkle*.8)*uDpr*clamp(uScale/300.,.55,1.4);
pointSize*=mix(1.,.22,ambient)*(1.+uAudio*.28);
gl_PointSize=pointSize*mix(1.,3.8,uGlow);
vec3 blue=vec3(.243137,.572549,.674510);
vec3 ice=vec3(.85,.98,1.);
float light=smoothstep(-.25,.35,p.z)*.35+sparkle*.5;
vec3 col=mix(blue,ice,min(1.,light+aEnergy*.75+uAudio*.35+uBeat*.3));
float alpha=(.8+aSeed*.2)*(1.-uGlow*.985)*smoothstep(0.,.35,uReveal);
alpha*=mix(1.,.4*uHero,ambient);
vColor=vec4(col,alpha);
}`;
const fragment=`precision mediump float;varying mediump vec4 vColor;varying mediump float vSeed;uniform mediump float uGlow;
void main(){
vec2 uv=(gl_PointCoord-.5)*2.;float angle=vSeed*6.283;
uv=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*uv;
float d=length(uv);
if(uGlow>.5){if(d>1.)discard;gl_FragColor=vec4(vColor.rgb,vColor.a*exp(-d*d*4.)*(1.-smoothstep(.7,1.,d)));return;}
// Hexagonal crystal grains with separately lit triangular facets.
float edge=max(abs(uv.x)*.866025+abs(uv.y)*.5,abs(uv.y));
if(edge>.88)discard;
float facet=uv.y>.0?(uv.x>0.? .84:1.35):(uv.x>0.? .42:.68);
float highlight=pow(max(0.,1.-length((uv-vec2(-.24,.28))*2.)),4.);
vec3 lit=vColor.rgb*facet+vec3(highlight*.7);
float rim=1.-smoothstep(.76,.88,edge);
gl_FragColor=vec4(lit,vColor.a*rim);
}`;
function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
let seed=719;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
// Sample the supplied SVG silhouette so the particle field follows the actual mark.
const mark=new Image();mark.src='assets/eventoria-logo.svg';await mark.decode();
const mask=document.createElement('canvas');mask.width=750;mask.height=820;
const ctx=mask.getContext('2d',{willReadFrequently:true});ctx.drawImage(mark,0,0,750,820);
const pixels=ctx.getImageData(0,0,750,820).data;const silhouette=[];
// Reuse the decoded image mask so the animation also works when opened directly
// from the filesystem, where fetch('assets/...') is blocked by browser policy.
const outlinePixels=pixels;
for(let y=0;y<820;y++)for(let x=0;x<750;x++)if(pixels[(y*750+x)*4+3]>120)silhouette.push([x,y]);
const logoCount=18000,count=logoCount+500,data=new Float32Array(count*5);
for(let i=0;i<logoCount;i++){const point=silhouette[Math.floor(random()*silhouette.length)];data[i*5]=((point[0]+random())/750-.5)*2.5;data[i*5+1]=(.5-(point[1]+random())/820)*2.73;data[i*5+2]=(random()-.5)*.48;data[i*5+3]=random();data[i*5+4]=outlinePixels[(point[1]*750+point[0])*4+3]>120?1:0;}
// Sparse airborne motes give the floating mark a sense of space.
for(let i=logoCount;i<count;i++){const d=i*5;data[d]=(random()-.5)*8;data[d+1]=(random()-.5)*5.2;data[d+2]=(random()-.5)*2;data[d+3]=random();data[d+4]=2;}
const audioUniform=gl.getUniformLocation(program,'uAudio'),bassUniform=gl.getUniformLocation(program,'uBass'),beatUniform=gl.getUniformLocation(program,'uBeat');
const glowUniform=gl.getUniformLocation(program,'uGlow'),heroUniform=gl.getUniformLocation(program,'uHero'),dprUniform=gl.getUniformLocation(program,'uDpr');
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
for(const [name,size,offset] of [['aPosition',3,0],['aSeed',1,12],['aOuter',1,16]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,20,offset);}
const displacement=new Float32Array(count*2),velocity=new Float32Array(count*2),energy=new Float32Array(count),scatterHold=new Float32Array(count);
const displacementBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,displacementBuffer);gl.bufferData(gl.ARRAY_BUFFER,displacement,gl.DYNAMIC_DRAW);
const displacementLocation=gl.getAttribLocation(program,'aDisplacement');gl.enableVertexAttribArray(displacementLocation);gl.vertexAttribPointer(displacementLocation,2,gl.FLOAT,false,0,0);
const energyBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,energyBuffer);gl.bufferData(gl.ARRAY_BUFFER,energy,gl.DYNAMIC_DRAW);
const energyLocation=gl.getAttribLocation(program,'aEnergy');gl.enableVertexAttribArray(energyLocation);gl.vertexAttribPointer(energyLocation,1,gl.FLOAT,false,0,0);
const offsetUniform=gl.getUniformLocation(program,'uOffset');
const time=gl.getUniformLocation(program,'uTime'),size=gl.getUniformLocation(program,'uSize'),scale=gl.getUniformLocation(program,'uScale');let width,height;
function resize(){const dpr=Math.min(devicePixelRatio||1,1.75);width=canvas.clientWidth;height=canvas.clientHeight;canvas.width=width*dpr;canvas.height=height*dpr;gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(dprUniform,dpr);gl.uniform2f(size,width,height);gl.uniform1f(scale,Math.min(height*.325,width*.37));}
window.addEventListener('resize',resize);resize();gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const reveal=gl.getUniformLocation(program,'uReveal');
const turnUniform=gl.getUniformLocation(program,'uScrollTurn'),heatUniform=gl.getUniformLocation(program,'uHeat');let scrollTurn=0,heat=0;
const pointerUniform=gl.getUniformLocation(program,'uPointer'),hoverUniform=gl.getUniformLocation(program,'uHover');
const hero=heroElement;
const workPage=document.body.classList.contains('work-page');
let pointerX=0,pointerY=0,hover=0,hoverTarget=0,previousPointerX=0,previousPointerY=0;
hero.addEventListener('pointermove',event=>{
if(event.pointerType==='touch'||reduced.matches)return;
const bounds=canvas.getBoundingClientRect();
pointerX=event.clientX-bounds.left-width/2;
pointerY=height/2-(event.clientY-bounds.top);
hoverTarget=Math.hypot(pointerX,pointerY)<Math.min(height*.44,width*.5)?1:0;
});
hero.addEventListener('pointerleave',()=>{hoverTarget=0;});
hero.addEventListener('pointercancel',()=>{hoverTarget=0;});
let frame,elapsed=0,last=null,mouseVX=0,mouseVY=0;
function render(ms){
if(document.querySelector(".entry-loader")&&!document.body.classList.contains("has-entered")){last=null;return;}
const deltaTime=last===null?0:(ms-last)/1000;
const audio=window.eventoriaAudio?.sample(deltaTime)||{level:0,bass:0,beat:0};
gl.uniform1f(beatUniform,reduced.matches?0:audio.beat);gl.uniform1f(audioUniform,reduced.matches?0:audio.level);gl.uniform1f(bassUniform,reduced.matches?0:audio.bass);
if(last!==null)elapsed+=deltaTime;
hover+=(hoverTarget-hover)*(1.-Math.exp(-deltaTime*9.));
last=ms;
const processSection=document.getElementById("process");
const processVisibility=processSection?Math.max(0,Math.min(1,1-processSection.getBoundingClientRect().top/innerHeight)):0;
const scrollProgress=Math.max(0,Math.min(1,scrollY/Math.max(1,innerHeight)))*(1-processVisibility);
scrollTurn+=(scrollY/(innerHeight*1.5)*(Math.PI/4)-scrollTurn)*(1-Math.pow(.94,deltaTime*60));
heat+=(scrollProgress-heat)*(1-Math.pow(.92,deltaTime*60));
const progress=reduced.matches?1:Math.min(elapsed/2.6,1);
const ease=1.-Math.pow(1.-progress,3.);
// Spring simulation: cursor impulses scatter particles; drag and attraction rebuild the mark.
const step=Math.min(deltaTime*60,2),radius=height*.12;
const pointerDX=pointerX-previousPointerX,pointerDY=pointerY-previousPointerY;
const inputBlend=1-Math.exp(-deltaTime*18);
mouseVX+=(pointerDX/Math.max(step,.5)-mouseVX)*inputBlend;
mouseVY+=(pointerDY/Math.max(step,.5)-mouseVY)*inputBlend;
const about=document.getElementById('hero-end')||document.querySelector('.selected-work,.about-message')||hero;
const enter=Math.max(0,Math.min(1,scrollY/Math.max(1,about.offsetTop)));
const leave=1-Math.max(0,Math.min(1,(scrollY-about.offsetTop-about.offsetHeight)/height));
const split=workPage?1:enter*enter*(3-2*enter)*leave;
const mobile=width<=760;
const baseScale=Math.min(height*.325,width*.37);
const targetScale=mobile?Math.min(height*.13,width*.24):Math.min(height*.235,width*.175);
const unitScale=baseScale+(targetScale-baseScale)*split;
const offsetX=mobile?0:width*.255*split;
const offsetY=mobile?height*.22*split:-height*.025*split;
gl.uniform1f(scale,unitScale);gl.uniform2f(offsetUniform,offsetX,offsetY);
const angle=Math.sin(elapsed*.24)*.23+scrollTurn,cosine=Math.cos(angle),sine=Math.sin(angle);
const ringAngle=-Math.sin(elapsed*.18)*.035,ringCos=Math.cos(ringAngle),ringSin=Math.sin(ringAngle);
let brushContact=0;
for(let i=0;i<logoCount;i++){
const d=i*5,o=i*2,outer=data[d+4];let x=data[d],y=data[d+1],z=data[d+2];
{const ox=x;x=cosine*x+sine*z;z=-sine*ox+cosine*z;}
{const ox=x;x=ringCos*x-ringSin*y;y=ringSin*ox+ringCos*y;}
y+=Math.sin(elapsed*.8)*.045;
const perspective=4.5/(4.5-z*.65);
const dx=x*perspective*unitScale+offsetX+displacement[o]-pointerX,dy=y*perspective*unitScale+offsetY+displacement[o+1]-pointerY;
const distance=Math.hypot(dx,dy);
// Velocity-driven brush: directional advection, a short fluid hold, then spring return.
const edge=Math.max(0,Math.min(1,(distance-height*.05)/(height*.07)));
const influence=hoverTarget*(1-edge*edge*(3-2*edge));
const speed=Math.hypot(mouseVX,mouseVY);
const impulse=Math.min(speed,30)*influence;
brushContact+=influence*Math.min(1,speed/16);
const hold=scatterHold[i];
if(!reduced.matches){
velocity[o]+=mouseVX/Math.max(1,speed/30)*influence*.35*step;
velocity[o+1]+=mouseVY/Math.max(1,speed/30)*influence*.35*step;
const flow=(.025+impulse*.035)*step;
velocity[o]+=Math.sin(y*4+elapsed*.5+data[d+3]*6.28)*flow;
velocity[o+1]+=Math.cos(x*4+elapsed*.5+data[d+3]*6.28)*flow;
}
const targetHold=Math.min(1,impulse*.16);
scatterHold[i]=targetHold>hold?hold+(targetHold-hold)*Math.min(1,deltaTime*15):Math.max(0,hold-deltaTime/.35);
const spring=.01*Math.max(.2,(1-Math.min(.7,impulse*.045))*(1-hold*.6));
const damping=Math.pow(.93,step);
velocity[o]=(velocity[o]-displacement[o]*spring*step)*damping;
velocity[o+1]=(velocity[o+1]-displacement[o+1]*spring*step)*damping;
const cap=Math.max(1,Math.hypot(velocity[o],velocity[o+1])/32);
velocity[o]/=cap;velocity[o+1]/=cap;
displacement[o]+=velocity[o]*step;displacement[o+1]+=velocity[o+1]*step;
const glowTarget=Math.min(1,Math.hypot(velocity[o],velocity[o+1])*.08+hold*.7+impulse*.04);
energy[i]+=(glowTarget-energy[i])*Math.min(1,deltaTime*(glowTarget>energy[i]?12:3));
if(reduced.matches){displacement[o]=0;displacement[o+1]=0;velocity[o]=0;velocity[o+1]=0;energy[i]=0;}

}
window.eventoriaAudio?.interact(reduced.matches?0:Math.min(1,brushContact/450),pointerX/(width*.5));
previousPointerX=pointerX;previousPointerY=pointerY;
gl.bindBuffer(gl.ARRAY_BUFFER,displacementBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,displacement);
gl.bindBuffer(gl.ARRAY_BUFFER,energyBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,energy);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.uniform1f(time,reduced.matches?0:elapsed);
gl.uniform1f(reveal,ease);
gl.uniform1f(turnUniform,reduced.matches?0:scrollTurn);gl.uniform1f(heatUniform,heat);
gl.uniform2f(pointerUniform,pointerX,pointerY);
gl.uniform1f(hoverUniform,reduced.matches?0:hover);
gl.uniform1f(heroUniform,Math.max(0,1-scrollY/Math.max(1,innerHeight)));
// Soft halo and sharp grains share geometry, avoiding a full-screen blur pass.
gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.uniform1f(glowUniform,1);gl.drawArrays(gl.POINTS,0,logoCount);
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(glowUniform,0);gl.drawArrays(gl.POINTS,0,count);
if(!reduced.matches)frame=requestAnimationFrame(render);
}
addEventListener('scroll',()=>{if(reduced.matches)render(performance.now())},{passive:true});
function startHero(){elapsed=0;last=null;cancelAnimationFrame(frame);document.body.classList.add('is-ready');render(performance.now());}
addEventListener('eventoria:enter',startHero,{once:true});
if(!document.querySelector('.entry-loader')||document.body.classList.contains('has-entered'))startHero();
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=null;if(!document.hidden)render(performance.now());});
reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);last=null;render(performance.now());});
})().catch(error=>{document.body.classList.add('is-ready');console.error('Hero animation:',error);});
