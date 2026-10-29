(() => {
const section=document.querySelector('.receive-section'),steps=[...section.querySelectorAll('.receive-step')],reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=n=>Math.max(0,Math.min(1,n));let pending=false;
function update(){pending=false;const top=section.getBoundingClientRect().top;const time=clamp((innerHeight*.25-top)/(innerHeight*.5))*1.5;
steps.forEach((step,i)=>{const local=innerWidth<=760?clamp((innerHeight*.85-step.getBoundingClientRect().top)/(innerHeight*.4))*1.5:time-i*.5;
const value=reduced.matches?1:clamp(local/.4);step.querySelector('.receive-line').style.setProperty('--line-progress',value);step.querySelector('.receive-start').style.opacity=i===0?1:value>0?1:0;step.querySelector('.receive-follow').style.opacity=value>0?1:0;
[step.querySelector('.receive-number'),step.querySelector('h3'),step.querySelector('.receive-copy')].forEach((el,n)=>{const p=reduced.matches?1:clamp((local-[0,.1,.15][n])/[.2,.2,.25][n]);el.style.opacity=p;el.style.transform=`translateY(${20*(1-p)}px)`;});});}
function request(){if(!pending){pending=true;requestAnimationFrame(update);}}addEventListener('scroll',request,{passive:true});addEventListener('resize',request);reduced.addEventListener('change',request);update();
})();
