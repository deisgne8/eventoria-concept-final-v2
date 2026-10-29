(() => {
const footer=document.querySelector('.site-footer');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function reset(){footer.style.setProperty('--footer-x','0px');footer.style.setProperty('--footer-y','0px');}
footer.addEventListener('pointermove',event=>{
 if(reduced.matches||event.pointerType==='touch')return;
 const rect=footer.getBoundingClientRect();
 footer.style.setProperty('--footer-x',`${((event.clientX-rect.left)/rect.width-.5)*32}px`);
 footer.style.setProperty('--footer-y',`${((event.clientY-rect.top)/rect.height-.5)*24}px`);
},{passive:true});
footer.addEventListener('pointerleave',reset);
reduced.addEventListener('change',reset);
})();
