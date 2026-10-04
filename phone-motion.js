// Animate the homepage call link without changing its native telephone action.
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('[data-phone-motion]');
  if (!button || !window.gsap) return;
  const icon = button.querySelector('svg');
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', context => {
    gsap.from(button, {
      y: -10, opacity: 0, duration: 0.7, delay: 0.15,
      ease: 'power3.out', clearProps: 'transform,opacity'
    });
    if (icon) {
      gsap.timeline({ delay: 0.7 })
        .to(icon, { rotation: -14, duration: 0.12, transformOrigin: '50% 50%' })
        .to(icon, { rotation: 12, duration: 0.12, repeat: 3, yoyo: true })
        .to(icon, { rotation: 0, duration: 0.2, ease: 'power2.out', clearProps: 'transform' });
    }

    context.add('activate', () => {
      gsap.to(button, { y: -2, scale: 1.025, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      if (icon) gsap.to(icon, { rotation: -12, duration: 0.25, overwrite: 'auto' });
    });
    context.add('reset', () => {
      if (button.matches(':hover, :focus-visible')) return;
      gsap.to(button, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto', clearProps: 'transform' });
      if (icon) gsap.to(icon, { rotation: 0, duration: 0.3, overwrite: 'auto', clearProps: 'transform' });
    });
    const enter = event => { if (event.pointerType !== 'touch') context.activate(); };
    const focus = () => { if (button.matches(':focus-visible')) context.activate(); };
    button.addEventListener('pointerenter', enter);
    button.addEventListener('pointerleave', context.reset);
    button.addEventListener('focus', focus);
    button.addEventListener('blur', context.reset);
    return () => {
      button.removeEventListener('pointerenter', enter);
      button.removeEventListener('pointerleave', context.reset);
      button.removeEventListener('focus', focus);
      button.removeEventListener('blur', context.reset);
    };
  });
});
