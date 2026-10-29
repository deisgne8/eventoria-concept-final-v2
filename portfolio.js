(() => {
const section=document.querySelector('.portfolio-section'),stage=section.querySelector('.portfolio-stage'),backgrounds=[...section.querySelectorAll('.portfolio-backgrounds img')],portraits=[...section.querySelectorAll('.portfolio-portrait')],titles=[...section.querySelectorAll('.portfolio-title')],buttons=[...section.querySelectorAll('[data-project]')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
const layers=backgrounds.map(img=>{const wrapper=document.createElement('div');wrapper.className='portfolio-background-slide';img.before(wrapper);wrapper.append(img);img.style.opacity=1;return wrapper;});
const full='polygon(0 0,100% 0,100% 100%,0 100%)',ease='cubic-bezier(.76,0,.24,1)';
let active=0,busy=false,animations=[];
function selected(i){buttons.forEach((b,n)=>b.setAttribute('aria-pressed',n===i));}
function settle(i){layers.forEach((l,n)=>{l.style.visibility=n===i?'visible':'hidden';l.style.zIndex=1;l.style.clipPath=full;backgrounds[n].style.transform='none';});portraits.forEach((p,n)=>{p.style.visibility=n===i?'visible':'hidden';p.style.zIndex=1;p.style.clipPath=full;p.firstElementChild.style.transform='none';});titles.forEach((t,n)=>{t.classList.toggle('is-active',n===i);t.setAttribute('aria-hidden',n!==i);});selected(i);}
function animate(el,frames,options={}){const a=el.animate(frames,{duration:1000,easing:ease,fill:'both',...options});animations.push(a);return a;}
async function change(next){
 if(busy||next===active)return;const old=active,d=next>old?1:-1;active=next;busy=true;
 if(reduced.matches){settle(next);busy=false;return;}
 busy=true;
 layers[next].style.visibility=portraits[next].style.visibility='visible';layers[old].style.zIndex=portraits[old].style.zIndex=2;layers[next].style.zIndex=portraits[next].style.zIndex=1;
 const end=d>0?'polygon(0 0,100% 0,100% 0,0 0)':'polygon(0 100%,100% 100%,100% 100%,0 100%)';
 const start=d>0?'polygon(0 0,100% 0,100% 110%,0 100%)':'polygon(0 0,100% -10%,100% 100%,0 100%)';
 animate(layers[old],[{clipPath:start},{clipPath:end}]);
 animate(backgrounds[old],[{transform:'translateY(0) scale(1) rotate(0deg)'},{transform:`translateY(${-50*d}%) scale(1.5) rotate(${-7*d}deg)`}]);
 animate(backgrounds[next],[{transform:`translateY(${50*d}%)`},{transform:'translateY(0)'}]);
 animate(portraits[old],[{clipPath:full},{clipPath:d>0?'polygon(0 100%,100% 100%,100% 100%,0 100%)':'polygon(0 0,100% 0,100% 0,0 0)'}]);
 animate(portraits[old].firstElementChild,[{transform:'translateY(0)'},{transform:`translateY(${50*d}%)`}]);
 animate(portraits[next].firstElementChild,[{transform:`translateY(${-50*d}%)`},{transform:'translateY(0)'}]);
 animate(titles[old],[{opacity:1,transform:'translateY(0) rotate(0deg)'},{opacity:0,transform:`translateY(${-55*d}px) rotate(${-7*d}deg)`}],{duration:300,easing:'ease-in'});
 titles[next].classList.add('is-active');titles[next].setAttribute('aria-hidden','false');titles[old].setAttribute('aria-hidden','true');
 animate(titles[next],[{opacity:0,transform:`translateY(${55*d}px) rotate(${7*d}deg)`},{opacity:1,transform:'translateY(0) rotate(0deg)'}],{delay:500,duration:500,easing:'cubic-bezier(.22,1,.36,1)'});
 selected(next);
 await new Promise(resolve=>setTimeout(resolve,1100));animations.forEach(a=>a.cancel());animations=[];settle(next);busy=false;
}
buttons.forEach((b,i)=>b.addEventListener('click',()=>change(i)));
section.querySelector('.portfolio-prev').addEventListener('click',()=>change((active-1+titles.length)%titles.length));
section.querySelector('.portfolio-next').addEventListener('click',()=>change((active+1)%titles.length));
reduced.addEventListener('change',()=>{animations.forEach(a=>a.cancel());settle(active);});
settle(0);
})();
