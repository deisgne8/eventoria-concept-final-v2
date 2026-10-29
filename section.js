(() => {
const section=document.querySelector('.about-section'),hero=document.querySelector('.hero'),identity=document.querySelector('.identity'),bottom=document.querySelector('.hero-bottom');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=v=>Math.max(0,Math.min(1,v));
let busy=false,frame,gestureUntil=0;
function go(target){if(busy)return;const start=scrollY,distance=target-start,begin=performance.now();busy=true;const tick=now=>{const p=reduced.matches?1:clamp((now-begin)/1200);scrollTo(0,start+distance*(1-Math.pow(1-p,3)));if(p<1)frame=requestAnimationFrame(tick);else{busy=false;gestureUntil=performance.now()+250;}};frame=requestAnimationFrame(tick);}
addEventListener('wheel',event=>{if(event.ctrlKey||Math.abs(event.deltaY)<4||innerWidth<700)return;const next=section.offsetTop,third=document.querySelector('.approach-section').offsetTop;if(scrollY>third+2||event.deltaY>0&&scrollY>=third-2||event.deltaY<0&&scrollY<=0)return;event.preventDefault();if(busy||performance.now()<gestureUntil)return;const target=event.deltaY>0?(scrollY<next-2?next:third):(scrollY>next+2?next:0);go(target);},{passive:false});
document.querySelector('.scroll').addEventListener('click',event=>{event.preventDefault();go(section.offsetTop);history.replaceState(null,'','#hero-end');});
const intro=document.querySelector('.about-intro'),details=document.querySelector('.about-details');
for(const [element,amount] of [[intro,.4],[details,.5]]){if(!element)continue;new IntersectionObserver(entries=>{for(const entry of entries)element.classList.toggle('is-in-view',entry.isIntersecting&&entry.intersectionRatio>=amount);},{threshold:[0,amount]}).observe(element);}
function update(){const p=clamp(scrollY/hero.offsetHeight);identity.style.opacity=1-clamp((p-.4)/.45);identity.style.filter=`blur(${clamp((p-.4)/.45)*8}px)`;identity.style.transform=`translateY(calc(-50% - ${clamp(p/.85)*36}px))`;bottom.style.opacity=1-clamp((p-.02)/.1);}
const approachObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-in-view');approachObserver.unobserve(entry.target);}},{threshold:.12});document.querySelectorAll('.approach-reveal').forEach(element=>approachObserver.observe(element));
addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
})();
