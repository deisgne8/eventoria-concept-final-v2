import * as THREE from './assets/vendor/three.module.js';
import {OBJLoader} from './assets/vendor/OBJLoader.js';
async function createBrandScene(section,host){
const isFooter=section.classList.contains('site-footer');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
try{
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));host.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.z=7.8;
scene.add(new THREE.HemisphereLight(0xb6ebff,0x07151c,2));
const key=new THREE.DirectionalLight(0xffcc33,4);key.position.set(3,2,3);scene.add(key);
const fill=new THREE.DirectionalLight(0x3e92ac,3);fill.position.set(-3,1,2);scene.add(fill);
const group=new THREE.Group();scene.add(group);
const model=await new OBJLoader().loadAsync('assets/eventoria-mark.obj');
const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
model.position.sub(center);const normalized=new THREE.Group();normalized.add(model);normalized.scale.setScalar(2.65/Math.max(size.x,size.y,size.z));group.add(normalized);
const surface=[];
model.traverse(child=>{if(!child.isMesh)return;child.material=new THREE.MeshStandardMaterial({color:0x183b48,metalness:.65,roughness:.33,side:THREE.DoubleSide});const attr=child.geometry.attributes.position;const triangles=[],areas=[];let total=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),cross=new THREE.Vector3();for(let i=0;i<attr.count;i+=3){a.fromBufferAttribute(attr,i);b.fromBufferAttribute(attr,i+1);c.fromBufferAttribute(attr,i+2);const area=cross.crossVectors(b.clone().sub(a),c.clone().sub(a)).length()*.5;total+=area;areas.push(total);triangles.push(i);}for(let n=0;n<22000;n++){const target=Math.random()*total;let lo=0,hi=areas.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(areas[mid]<target)lo=mid+1;else hi=mid;}const i=triangles[lo];a.fromBufferAttribute(attr,i);b.fromBufferAttribute(attr,i+1);c.fromBufferAttribute(attr,i+2);const u=Math.sqrt(Math.random()),v=Math.random();a.multiplyScalar(1-u).addScaledVector(b,u*(1-v)).addScaledVector(c,u*v);surface.push(a.x,a.y,a.z);}});
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(surface,3));
const points=new THREE.Points(pg,new THREE.PointsMaterial({color:0xe9f5e9,size:.009,transparent:true,opacity:.75,depthWrite:false}));points.position.copy(model.position);normalized.add(points);
// Fine strands curl through space around the solid emblem.
const dust=[],colors=[];
for(let j=0;j<14;j++){
const path=[];
for(let i=0;i<170;i++){const t=i/169*Math.PI*2,r=2.2+j*.14;const x=Math.cos(t+j)*r,y=Math.sin(t*1.4+j)*r*.65,z=Math.sin(t+j*.6)*1.7;path.push(new THREE.Vector3(x,y,z));if(i%2===0){dust.push(x,y,z);const c=new THREE.Color(j%4===0?0xffcc33:0x3e92ac);colors.push(c.r,c.g,c.b);}}
const geometry=new THREE.BufferGeometry().setFromPoints(path);const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x3e92ac,transparent:true,opacity:.055}));scene.add(line);
}
for(let i=0;i<450;i++){dust.push((Math.random()-.5)*15,(Math.random()-.5)*9,(Math.random()-.5)*6);colors.push(.24,.57,.67)}
const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));dg.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const field=new THREE.Points(dg,new THREE.PointsMaterial({size:.018,vertexColors:true,transparent:true,opacity:.5,depthWrite:false}));scene.add(field);
let mx=0,my=0,active=false,frame=0,time=0,last=0;
section.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();mx=(e.clientX-b.left)/b.width-.5;my=(e.clientY-b.top)/b.height-.5});section.addEventListener('pointerleave',()=>{mx=my=0});
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w<760?10:7.8;camera.updateProjectionMatrix();if(isFooter){const viewHeight=2*camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));group.scale.setScalar(viewHeight*.95/2.65);group.userData.baseY=-viewHeight*.5;}if(reduced.matches)renderer.render(scene,camera)}
new ResizeObserver(resize).observe(host);resize();host.classList.add('is-loaded');
function render(now){frame=0;if(!active||document.hidden)return;time+=last?Math.min((now-last)/1000,.05):0;last=now;const progress=Math.max(-1,Math.min(1,-section.getBoundingClientRect().top/innerHeight));const target=reduced.matches?0:Math.sin(time*.22)*.16+mx*.35+progress*.7;group.rotation.y+=(target-group.rotation.y)*.04;group.rotation.x+=((reduced.matches?0:my*.15)-group.rotation.x)*.04;group.position.y=(group.userData.baseY||0)+(reduced.matches?0:Math.sin(time*.7)*.06);field.rotation.y=reduced.matches?0:time*.012;renderer.render(scene,camera);if(!reduced.matches)frame=requestAnimationFrame(render)}
function resume(){cancelAnimationFrame(frame);last=0;if(active&&!document.hidden)frame=requestAnimationFrame(render)}
new IntersectionObserver(entries=>{active=entries[0].isIntersecting;resume()},{rootMargin:'100px'}).observe(section);document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
}catch(error){console.error('Brand chapter:',error)}

}
for(const section of document.querySelectorAll(".report-section,.site-footer")){
 let host=section.querySelector(".report-scene,.footer-scene");
 if(section.classList.contains('site-footer')&&!host){host=document.createElement('div');host.className='footer-scene';host.setAttribute('aria-hidden','true');section.prepend(host)}
 if(host)createBrandScene(section,host);
}
