(() => {
const gate=document.querySelector('.entry-loader'),number=gate.querySelector('.entry-percent'),choices=gate.querySelector('.entry-choices');
const sessionKey='eventoria:preloader-shown';
let previouslyShown=false;
try{previouslyShown=sessionStorage.getItem(sessionKey)==='1';sessionStorage.setItem(sessionKey,'1');}catch{}
if(previouslyShown){
 document.body.classList.add('has-entered');
 window.dispatchEvent(new Event('eventoria:enter'));
 return;
}
gate.showModal();document.documentElement.classList.add('entry-loading');
gate.addEventListener('cancel',e=>e.preventDefault());
const images=[...document.querySelectorAll('.brand-lockup img,.travelling-brand img')];
const tasks=[document.fonts.ready,...images.map(img=>img.decode().catch(()=>{}))];
let done=0,shown=0,finished=false,last=performance.now();
number.textContent='0%';
Promise.allSettled(tasks.map(task=>Promise.resolve(task).finally(()=>done++))).then(()=>finished=true);
const fallback=setTimeout(()=>{finished=true;},8000);
function tick(now){
 const target=finished?100:Math.min(95,done/tasks.length*95);
 if(shown<target&&now-last>=22){shown++;last=now;number.textContent=shown+'%';}
 if(shown<100){requestAnimationFrame(tick);return;}
 clearTimeout(fallback);
 setTimeout(()=>{gate.classList.add('is-ready');choices.hidden=false;gate.querySelector('[data-audio="on"]').focus();},350);
}
requestAnimationFrame(tick);
choices.addEventListener('click',event=>{const button=event.target.closest('[data-audio]');if(!button)return;if(button.dataset.audio==='on')document.querySelector('.sound-toggle').click();document.body.classList.remove("is-ready");gate.close();document.body.classList.add("has-entered");window.dispatchEvent(new Event("eventoria:enter"));document.documentElement.classList.remove('entry-loading');document.querySelector('.menu-toggle').focus({preventScroll:true});});
})();
