(() => {
  const toggle = document.querySelector('.menu-toggle'), panel = document.querySelector('.full-menu'), main = document.querySelector('main'), footer = document.querySelector('.site-footer');
  if (!toggle || !panel) return;
  let open = false;
  const setOpen = (value) => { open = value; document.body.classList.toggle('menu-open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); panel.inert = !open; if (main) main.inert = open; if (footer) footer.inert = open; document.body.style.overflow = open ? 'hidden' : ''; (open ? panel.querySelector('a') : toggle)?.focus({preventScroll:true}); };
  toggle.addEventListener('click', () => setOpen(!open)); panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => { if (!open) return; if (event.key === 'Escape') setOpen(false); if (event.key === 'Tab') { const items = [toggle, ...panel.querySelectorAll('a')], first = items[0], last = items.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), {threshold:.14});
  document.querySelectorAll('.work-story-card, .additional-card').forEach(item => observer.observe(item));
})();
