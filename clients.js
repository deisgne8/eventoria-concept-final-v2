(() => {
const cards=[...document.querySelectorAll('.inertia-client')];
cards.forEach(card=>card.addEventListener('click',()=>{const active=!card.classList.contains('is-active');cards.forEach(c=>{c.classList.remove('is-active');c.setAttribute('aria-pressed','false');});card.classList.toggle('is-active',active);card.setAttribute('aria-pressed',String(active));}));
})();
