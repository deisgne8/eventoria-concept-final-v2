(() => {
const section=document.querySelector('.expertise-section'),track=section.querySelector('.expertise-track'),sticky=section.querySelector('.expertise-sticky'),heading=section.querySelector('.expertise-heading'),images=[...section.querySelectorAll('.expertise-images img')],panels=[...section.querySelectorAll('.expertise-panel')],buttons=[...section.querySelectorAll('[data-step]')];
const clamp=n=>Math.max(0,Math.min(1,n));
let active=-1,queued=false;
const compact=()=>innerWidth<=900||innerHeight<=650;
function select(index){
 active=index;
 buttons.forEach((b,i)=>b.setAttribute('aria-pressed',i===index));
 panels.forEach((p,i)=>{p.classList.toggle('is-active',i===index);p.setAttribute('aria-hidden',i!==index);});
 images.forEach((im,i)=>im.classList.toggle('is-active',i===index));
}
function update(){
 queued=false;
 if(compact()){
  sticky.style.setProperty('--image-scale',1);sticky.style.setProperty('--image-inverse',1);
  heading.classList.add('is-visible');sticky.classList.add('is-entered');
  if(active<0)select(0);
  return;
 }
 const rect=track.getBoundingClientRect(),h=innerHeight,intro=clamp(1-rect.top/h),ease=intro<.5?2*intro*intro:1-Math.pow(-2*intro+2,2)/2,scale=(innerWidth<=760?.5:.3)+(innerWidth<=760?.5:.7)*ease;
 sticky.style.setProperty('--image-scale',scale);sticky.style.setProperty('--image-inverse',1/scale);
 if(intro>=.2)heading.classList.add('is-visible');
 if(intro>=.5)sticky.classList.add('is-entered');
 const index=Math.round(clamp(-rect.top/(track.offsetHeight-sticky.offsetHeight))*3);
 if(index!==active)select(index);
}
function request(){if(!queued){queued=true;requestAnimationFrame(update);}}
buttons.forEach((b,i)=>{b.style.transitionDelay=`${i*.06}s`;b.addEventListener('click',()=>{if(compact()){select(i);return;}scrollTo({top:scrollY+track.getBoundingClientRect().top+i/3*(track.offsetHeight-sticky.offsetHeight),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});});
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);update();
})();
