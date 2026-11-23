(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsBox = document.getElementById('dots');
  const curNum = document.getElementById('curNum');
  const totNum = document.getElementById('totNum');
  const progressFill = document.getElementById('progressFill');
  const hudChapter = document.getElementById('hudChapter');

  let current = 0;
  let locked = false;
  const total = slides.length;

  totNum.textContent = String(total).padStart(2, '0');

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', '跳到第 ' + (i + 1) + ' 页');
    d.addEventListener('click', () => go(i));
    dotsBox.appendChild(d);
  });
  const dots = Array.from(dotsBox.children);

  function pad(n) { return String(n).padStart(2, '0'); }

  function render() {
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    curNum.textContent = pad(current + 1);
    hudChapter.textContent = slides[current].dataset.chapter || '';
    progressFill.style.width = ((current + 1) / total * 100) + '%';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    slides[current].querySelector('.slide-inner').scrollTop = 0;

    const active = slides[current];
    if (active.dataset.anim) {
      active.classList.remove('playing');
      void active.offsetWidth;
      active.classList.add('playing');
    }
  }

  function go(index) {
    if (index < 0 || index >= total || index === current || locked) return;
    current = index;
    locked = true;
    render();
    setTimeout(() => { locked = false; }, 520);
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => go(parseInt(el.dataset.goto, 10)));
  });

  document.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') {
      e.preventDefault(); next();
    } else if (k === 'ArrowLeft' || k === 'PageUp') {
      e.preventDefault(); prev();
    } else if (k === 'Home') {
      e.preventDefault(); go(0);
    } else if (k === 'End') {
      e.preventDefault(); go(total - 1);
    }
  });

  let touchStartY = null;
  document.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (touchStartY === null) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 55) { dy > 0 ? next() : prev(); }
    touchStartY = null;
  }, { passive: true });

  function scrollableAtBottom(el, dir) {
    if (!el) return true;
    const can = el.scrollHeight - el.clientHeight - el.scrollTop;
    return dir > 0 ? can <= 4 : el.scrollTop <= 4;
  }

  let wheelLock = false;
  document.addEventListener('wheel', e => {
    if (wheelLock) return;
    const inner = slides[current].querySelector('.slide-inner');
    const dir = e.deltaY > 0 ? 1 : -1;
    const targetScroll = e.target.closest('.slide-inner, .scroll-area');
    if (targetScroll && !scrollableAtBottom(targetScroll, dir)) return;
    e.preventDefault();
    wheelLock = true;
    dir > 0 ? next() : prev();
    setTimeout(() => { wheelLock = false; }, 620);
  }, { passive: false });

  render();
})();
