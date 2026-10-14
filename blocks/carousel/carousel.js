// Accessible, dependency-free carousel initializer
(function () {
  class Carousel {
    constructor(node, options = {}) {
      this.root = node;
      this.track = node.querySelector('.carousel-track');
      this.slides = Array.from(node.querySelectorAll('.carousel-slide'));
      this.prevBtn = node.querySelector('.carousel-control.prev');
      this.nextBtn = node.querySelector('.carousel-control.next');
      this.indicators = Array.from(node.querySelectorAll('.carousel-indicators button'));
      this.index = 0;
      this.timer = null;
      this.interval = parseInt(node.dataset.autoplayInterval || options.interval || 5000, 10);
      this.loop = node.dataset.loop !== 'false';
      this.init();
    }

    init() {
      if (!this.track || this.slides.length === 0) return;
      this.update();
      this.bind();
      if (this.interval > 0) this.play();
      // make first indicator current
      if (this.indicators[0]) this.indicators[0].setAttribute('aria-current', 'true');
    }

    bind() {
      if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
      if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
      this.indicators.forEach((btn, i) => {
        btn.addEventListener('click', () => this.goTo(i));
      });
      this.root.addEventListener('mouseenter', () => this.pause());
      this.root.addEventListener('mouseleave', () => this.play());
      this.root.addEventListener('focusin', () => this.pause());
      this.root.addEventListener('focusout', () => this.play());
      document.addEventListener('keydown', (e) => {
        if (!this.root.contains(document.activeElement)) return;
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });

      // Basic swipe support
      let startX = null;
      this.root.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        this.pause();
      }, {passive: true});
      this.root.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) {
          if (dx < 0) this.next(); else this.prev();
        }
        startX = null;
        this.play();
      });
      window.addEventListener('resize', () => this.update());
    }

    update() {
      const w = this.root.clientWidth;
      // ensure slides are sized to container width
      this.slides.forEach(s => s.style.minWidth = w + 'px');
      this.jumpTo(this.index);
    }

    jumpTo(idx) {
      const pos = idx * this.root.clientWidth;
      this.track.style.transition = 'none';
      this.track.style.transform = `translateX(-${pos}px)`;
      // force reflow then re-enable transition
      void this.track.offsetWidth;
      this.track.style.transition = '';
    }

    goTo(idx) {
      if (idx < 0) idx = this.loop ? this.slides.length - 1 : 0;
      if (idx >= this.slides.length) idx = this.loop ? 0 : this.slides.length - 1;
      this.index = idx;
      const pos = idx * this.root.clientWidth;
      this.track.style.transform = `translateX(-${pos}px)`;
      this.updateIndicators();
      this.emitEvent('carousel-change', {index: this.index});
    }

    prev() {
      this.goTo(this.index - 1);
    }

    next() {
      this.goTo(this.index + 1);
    }

    updateIndicators() {
      this.indicators.forEach((btn, i) => {
        if (i === this.index) btn.setAttribute('aria-current', 'true');
        else btn.removeAttribute('aria-current');
      });
    }

    play() {
      if (this.interval <= 0) return;
      this.pause();
      this.timer = setInterval(() => this.next(), this.interval);
    }

    pause() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    emitEvent(name, detail = {}) {
      this.root.dispatchEvent(new CustomEvent(name, {detail, bubbles: true}));
    }
  }

  function initAll() {
    const nodes = document.querySelectorAll('.carousel[data-init!="false"]');
    nodes.forEach(n => {
      if (!n.__carousel) n.__carousel = new Carousel(n);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Expose for manual init
  window.CarouselBlock = {
    initAll,
  };
})();
