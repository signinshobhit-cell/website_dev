/* Shared navigation and copyright behaviour. */
(() => {
function updateFooterYear() {
  const yearElements = document.querySelectorAll('.footer-year, #year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
}
function initServicesDropdown() {

  const dropdown = document.querySelector('.nav-dropdown');
  const toggle = document.querySelector('.nav-dropdown-toggle');

  if (!dropdown || !toggle) return;


  toggle.addEventListener('click', function(e) {

    e.preventDefault();
    e.stopPropagation();

    const isOpen = dropdown.classList.contains('open');

    dropdown.classList.toggle('open');

    toggle.setAttribute(
      'aria-expanded',
      String(!isOpen)
    );

  });


  /* Close when clicking outside */

  document.addEventListener('click', function(e) {

    if (!dropdown.contains(e.target)) {

      dropdown.classList.remove('open');

      toggle.setAttribute(
        'aria-expanded',
        'false'
      );

    }

  });


  /* Close when pressing Escape */

  document.addEventListener('keydown', function(e) {

    if (e.key === 'Escape') {

      dropdown.classList.remove('open');

      toggle.setAttribute(
        'aria-expanded',
        'false'
      );

      toggle.focus();

    }

  });

}
const init=()=>{updateFooterYear();initServicesDropdown();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
