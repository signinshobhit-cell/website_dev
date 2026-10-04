(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('latest-news');
    const track = document.getElementById('homeNewsTrack');
    const controls = document.getElementById('homeNewsControls');
    const pause = document.getElementById('homeNewsPause');
    const position = document.getElementById('homeNewsPosition');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const { esc, safeUrl, brief, formatDate } = NewsView;
    let items = [], paused = reduced.matches, inView = false;
    NewsView.bind(track, () => items);
    function playbackLabel() {
      pause.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
      pause.setAttribute('aria-pressed', String(paused));
    }
    function updateTags() {
      Array.from(track.querySelectorAll('.home-news-new')).forEach((tag, index) => { tag.hidden = !NewsCore.isRecent(items[index].date); });
    }
    function updatePosition() {
      const bounds = track.getBoundingClientRect();
      const visible = Array.from(track.querySelectorAll('.home-news-card')).map((card, i) => ({ rect: card.getBoundingClientRect(), index: i + 1 })).filter(({ rect }) => rect.right > bounds.left + 8 && rect.left < bounds.right - 8);
      position.textContent = visible.length ? `Updates ${visible[0].index}–${visible.at(-1).index} of ${items.length}` : 'Latest published updates';
    }
    function move(direction) {
      const first = track.querySelector('.home-news-card');
      const max = track.scrollWidth - track.clientWidth;
      if (!first || max <= 1) return;
      const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
      let target = track.scrollLeft + direction * step;
      if (direction > 0 && track.scrollLeft >= max - 2) target = 0;
      if (direction < 0 && track.scrollLeft <= 2) target = max;
      target = Math.max(0, Math.min(max, target));
      if (window.gsap) gsap.to(track, { scrollLeft: target, duration: reduced.matches ? 0 : .7, ease: 'power2.inOut', overwrite: true });
      else track.scrollTo({ left: target, behavior: reduced.matches ? 'instant' : 'smooth' });
    }
    document.getElementById('homeNewsPrevious').addEventListener('click', () => move(-1));
    document.getElementById('homeNewsNext').addEventListener('click', () => move(1));
    pause.addEventListener('click', () => { paused = !paused; playbackLabel(); });
    track.addEventListener('keydown', event => {
      if (event.target === track && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    });
    track.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    // Stop movement immediately when the reader starts interacting.
    const stopMotion = () => { if (window.gsap) gsap.killTweensOf(track); };
    section.addEventListener('pointerenter', stopMotion);
    track.addEventListener('pointerdown', stopMotion);
    section.addEventListener('focusin', stopMotion);
    reduced.addEventListener('change', () => { stopMotion(); paused = reduced.matches; playbackLabel(); });
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (!inView) stopMotion(); }, { threshold: .2 });
    observer.observe(section);
    const timer = setInterval(() => {
      updateTags();
      if (!paused && inView && !document.hidden && !section.matches(':hover, :focus-within') && !document.querySelector('#newsDialog[open]')) move(1);
    }, 5000);
    window.addEventListener('pagehide', event => { if (!event.persisted) { clearInterval(timer); observer.disconnect(); } });
    async function load() {
      track.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch('./data/news.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        items = NewsCore.normalize(await response.json()).slice(0, 6);
        track.innerHTML = items.length ? items.map(item => {
          const image = safeUrl(item.image);
          return `<article class="home-news-card" data-slug="${esc(item.slug)}">${image ? `<img src="${esc(image)}" alt="" loading="lazy">` : ''}<div class="home-news-meta"><span class="home-news-category">${esc(item.categoryLabel || 'Trade Update')}</span><span>${formatDate(item.date)}</span><span class="home-news-new" ${NewsCore.isRecent(item.date) ? '' : 'hidden'}>New</span></div><h3>${esc(item.title)}</h3><p>${esc(brief(item.summary, 40))}</p><a class="home-news-link" href="trade-article.html?slug=${encodeURIComponent(item.slug)}" aria-haspopup="dialog" aria-label="Read update: ${esc(item.title)}">Read update <span aria-hidden="true">→</span></a></article>`;
        }).join('') : '<p class="home-news-state">No news has been published yet. Check back soon.</p>';
        controls.hidden = !items.length; updatePosition(); playbackLabel();
      } catch (error) {
        track.innerHTML = '<div class="home-news-state"><p>Latest news could not be loaded.</p><button class="news-button" id="homeNewsRetry" type="button">Try again</button></div>';
        controls.hidden = true; document.getElementById('homeNewsRetry').addEventListener('click', load);
        console.error('Latest news:', error);
      } finally { track.setAttribute('aria-busy', 'false'); }
    }
    load();
  });
})();
