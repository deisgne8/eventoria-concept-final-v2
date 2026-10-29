(() => {
const section=document.querySelector('.process-section'),stage=section.querySelector('.process-stage'),cards=[...section.querySelectorAll('.process-card')],reduced=matchMedia('(prefers-reduced-motion: reduce)'),angles=[-9,8,-6,6,-4];
let pending=false;
const clamp=n=>Math.max(0,Math.min(1,n));
function render(){pending=false;if(reduced.matches||innerWidth<=760||innerHeight<=650){cards.forEach(card=>{card.style.transform='none';card.style.opacity=1;});return;}const rect=section.getBoundingClientRect(),p=clamp(-rect.top/(section.offsetHeight-stage.offsetHeight)),step=p*4.8;
stage.style.setProperty('--intro-drift',`${-p*60}px`);stage.style.setProperty('--process-progress',p);
cards.forEach((card,i)=>{const arrival=clamp(step-i+.85),leave=clamp(step-i-.65),e=1-Math.pow(1-arrival,3),y=(1-e)*(innerHeight*.9)-leave*(innerHeight*.95),rotation=angles[i]*(1-e*.7)-leave*12;card.style.transform=`translateY(${y}px) rotate(${rotation}deg) scale(${.94+.06*e-.07*leave})`;card.style.opacity=clamp(arrival*5)*(1-clamp((leave-.7)/.3));card.style.zIndex=i+1;});}
function request(){if(!pending){pending=true;requestAnimationFrame(render);}}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);reduced.addEventListener('change',request);render();
})();
