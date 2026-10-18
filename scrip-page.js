/* Page-only enhancements. Buying rates and calculator logic stay in their original files. */
(function () {
  const checks = Array.from(document.querySelectorAll('.scrip-doc-ready'));
  const progress = document.getElementById('scrip-checklist-progress');
  if (!checks.length || !progress) return;
  const update = () => {
    const ready = checks.filter(input => input.checked).length;
    progress.textContent = ready + ' of ' + checks.length + ' documents ready' + (ready === checks.length ? ' — contact our desk to confirm the next steps.' : '');
  };
  checks.forEach(input => input.addEventListener('change', update));
  window.addEventListener('pageshow', update);
  update();
})();
