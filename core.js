(() => {
  const section = document.querySelector('.core-section');
  if (!section) return;
  const scene = section.querySelector('.core-scene');
  const card = section.querySelector('.core-content');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);

  function update() {
    queued = false;
    const enabled = !reduced.matches && innerHeight >= 650 && innerHeight - 102 >= card.offsetHeight + 48;
    section.classList.toggle('core-motion', enabled);
    if (!enabled) {
      section.style.setProperty('--core-card-shift', '0px');
      section.style.setProperty('--core-image-scale', '1');
      section.style.setProperty('--core-reveal-side', '0%');
      return;
    }
    const rect = section.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(scene).top) || 0;
    const travel = section.offsetHeight - scene.offsetHeight - 28;
    const progress = clamp((top + 14 - rect.top) / Math.max(1, travel));
    // Expand as the photo enters the viewport, keeping its full height visible.
    const entryTravel = Math.max(1, innerHeight - top - 14);
    const expansion = ease(clamp((innerHeight - rect.top) / entryTravel));
    const entrance = ease(clamp((progress - .42) / .36));
    section.style.setProperty('--core-image-scale', `${1 + expansion * .08}`);
    section.style.setProperty('--core-reveal-side', `${(1 - expansion) * 8}%`);
    const hiddenOffset = (scene.offsetHeight + card.offsetHeight) / 2 + 24;
    section.style.setProperty('--core-card-shift', `${(1 - entrance) * hiddenOffset}px`);
    section.dataset.corePhase = expansion < 1 ? 'expanding' : progress < .42 ? 'photo' : progress < .78 ? 'entering' : 'centered';
  }

  function request() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  addEventListener('load', request);
  reduced.addEventListener('change', request);
  document.fonts.ready.then(request);
  update();
})();
