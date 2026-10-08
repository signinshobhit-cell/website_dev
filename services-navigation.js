(() => {
  const dropdown = document.querySelector('.nav-dropdown');
  const toggle = dropdown?.querySelector('.nav-dropdown-toggle');
  if (!toggle) return;
  const close = () => { dropdown.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', event => { if (!dropdown.contains(event.target)) close(); });
  dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); toggle.focus(); }
  });
})();
