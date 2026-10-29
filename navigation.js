(() => {
const header=document.querySelector('.sticky-header'), brand=document.querySelector('.travelling-brand'), identity=document.querySelector('.identity'), hero=document.querySelector('.hero');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let frame;
function update(){frame=0;const raw=Math.max(0,Math.min(1,scrollY/(hero.offsetHeight*.82)));const p=reduced.matches?(raw>.15?1:0):raw;const active=raw>0.005;const mobile=innerWidth<=760;const full=identity.querySelector('.brand-name').getBoundingClientRect().width;const end=mobile?150:190;const width=full+(end-full)*p;const x=(innerWidth-full)/2+(innerWidth*.05-(innerWidth-full)/2)*p;const identityRect=identity.getBoundingClientRect();const startY=identityRect.top+scrollY+identityRect.height/2-full*(28.99/157.99)/2;const y=startY+((mobile?12:20)-startY)*p;
brand.style.display=active?'block':'none';brand.style.width=width+'px';brand.style.transform=`translate3d(${x}px,${y}px,0)`;brand.style.filter=p<.95?'brightness(0) invert(1)':'none';identity.style.visibility=active?'hidden':'';
const reveal=Math.max(0,Math.min(1,(p-.65)/.35));header.style.opacity=reveal;header.style.transform=`translateY(${(1-reveal)*-100}%)`;header.classList.toggle('is-visible',p>=1);header.inert=p<1;brand.tabIndex=p>=1?0:-1;
}
addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update)},{passive:true});addEventListener('resize',update);update();
})();
