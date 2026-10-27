// Hero film: bigger file only on very wide screens, never autoplays for reduced-motion visitors,
// pauses off-screen, and always offers a pause/play button.
(function () {
  var video = document.querySelector(".hero-video");
  var toggle = document.querySelector(".video-toggle");
  if (!video || !toggle) return;
  var userPaused = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (matchMedia("(min-width: 1600px)").matches && video.dataset.srcLarge) {
    video.querySelector("source").src = video.dataset.srcLarge;
    video.load();
  }
  function render() {
    var paused = video.paused;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.querySelector(".vt-label").textContent = paused ? "Play film" : "Pause film";
    // SVG elements have no .hidden property, so toggle the attribute itself.
    toggle.querySelector(".ic-pause").toggleAttribute("hidden", paused);
    toggle.querySelector(".ic-play").toggleAttribute("hidden", !paused);
  }
  function play() { var p = video.play(); if (p && p.catch) p.catch(render); }
  video.addEventListener("play", render);
  video.addEventListener("pause", render);
  toggle.addEventListener("click", function () {
    if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (userPaused) return;
      if (entries[0].isIntersecting) play(); else video.pause();
    }).observe(document.querySelector(".hero"));
  }
  if (!userPaused) play();
  render();
})();

(function () {
  var root = document.documentElement;
  var started = false;
  // If GSAP never loads, show the page as plain content.
  setTimeout(function () { if (!started) root.classList.remove("js-motion"); }, 4000);
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  var smoother = null;

  // In-page links scroll through ScrollSmoother when it is running.
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || !smoother) return;
    var target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    smoother.scrollTo(target, true, "top top");
  });

  function heroIntro() {
    gsap.set([".hero-title", ".hero .eyebrow", ".hero-foot"], { visibility: "visible" });
    var split = SplitText.create(".hero-title", {
      type: "lines,chars",
      linesClass: "hl",
      autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.chars, { yPercent: 115, duration: 1.4, stagger: 0.028, ease: "expo.out", delay: 0.35 });
      }
    });
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".hero-img", { scale: 1.3, autoAlpha: 0, duration: 2.6, ease: "power2.out" }, 0)
      .from(".hero .eyebrow", { y: 18, autoAlpha: 0, duration: 1.1 }, 0.7)
      .from(".hero-foot > *", { y: 26, autoAlpha: 0, duration: 1.1, stagger: 0.1 }, 1);
    // Slow drift on top of the film, so the frame never feels locked off.
    gsap.to(".hero-kb", { scale: 1.14, xPercent: -2, yPercent: -1.5, duration: 18, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".hero-media", { yPercent: 16, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-inner", { yPercent: -12, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    return split;
  }

  function zoomPinned() {
    var tl = gsap.timeline({ scrollTrigger: { trigger: ".zoom", start: "top top", end: "+=180%", pin: true, scrub: 1 } });
    tl.fromTo(".zoom-frame", { clipPath: "inset(27% 35% 27% 35% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 }, 0)
      .fromTo(".zoom-frame img", { scale: 1.55 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
      .fromTo(".zoom-word.l", { autoAlpha: 1, xPercent: 0 }, { autoAlpha: 0, xPercent: -70, ease: "power2.in", duration: 0.6 }, 0)
      .fromTo(".zoom-word.r", { autoAlpha: 1, xPercent: 0 }, { autoAlpha: 0, xPercent: 70, ease: "power2.in", duration: 0.6 }, 0)
      .from(".zoom-shade", { autoAlpha: 0, duration: 0.35 }, 0.7)
      .from(".zoom-copy > *", { y: 50, autoAlpha: 0, stagger: 0.08, duration: 0.35 }, 0.8);
  }

  function zoomSimple() {
    gsap.fromTo(".zoom-frame img", { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".zoom-frame", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".zoom-copy > *", { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".zoom-copy", start: "top 88%" } });
  }

  function statement() {
    var split = SplitText.create(".statement-text", { type: "words" });
    gsap.fromTo(split.words, { opacity: 0.15 }, { opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: ".statement-text", start: "top 80%", end: "bottom 45%", scrub: true } });
    gsap.fromTo(".dhara-line", { scaleY: 0 }, { scaleY: 1, ease: "none",
      scrollTrigger: { trigger: ".statement", start: "top 85%", end: "top 30%", scrub: true } });
    return split;
  }

  function stackPinned() {
    var stage = document.querySelector(".stack");
    var cards = gsap.utils.toArray(".stack .card");
    stage.classList.add("is-stacked");
    var tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: "+=" + (cards.length - 1) * 90 + "%", pin: true, scrub: 1, invalidateOnRefresh: true } });
    cards.forEach(function (card, i) {
      if (i === 0) return;
      tl.fromTo(card, { yPercent: 120 }, { yPercent: 0, ease: "none", duration: 1 }, i - 1);
      cards.slice(0, i).forEach(function (prev, j) {
        var depth = i - j;
        tl.to(prev, { scale: 1 - depth * 0.05, yPercent: -depth * 5, ease: "none", duration: 1 }, i - 1)
          .to(prev.querySelector(".card-shade"), { autoAlpha: Math.min(0.2 + depth * 0.22, 0.75), ease: "none", duration: 1 }, i - 1);
      });
    });
  }

  function galleryPinned() {
    var section = document.querySelector(".gallery");
    var track = section.querySelector(".g-track");
    section.classList.add("is-pinned");
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var move = gsap.to(track, { x: function () { return -dist(); }, ease: "none",
      scrollTrigger: { trigger: section, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true } });

    gsap.utils.toArray(".g-media img").forEach(function (img) {
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none",
        scrollTrigger: { trigger: img.parentNode, containerAnimation: move, start: "left right", end: "right left", scrub: true } });
    });

    // Velocity skew, after the GSAP demo: fast scrolling leans the frames, then they settle.
    var proxy = { skew: 0 };
    var setSkew = gsap.quickSetter(".g-media", "skewX", "deg");
    var clamp = gsap.utils.clamp(-9, 9);
    ScrollTrigger.create({
      trigger: section, start: "top bottom", end: function () { return "+=" + (dist() + window.innerHeight * 2); },
      onUpdate: function (self) {
        var skew = clamp(self.getVelocity() / -320);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, { skew: 0, duration: 0.9, ease: "power3", overwrite: true, onUpdate: function () { setSkew(proxy.skew); } });
        }
      }
    });
  }

  function mobileReveals() {
    gsap.utils.toArray(".card, .g-item, .visit-inner > *").forEach(function (el) {
      gsap.from(el, { y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
  }

  function visitAndFooter() {
    gsap.from(".visit h2, .visit-lead, .steps li", { y: 40, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: ".visit-inner", start: "top 80%" } });
    gsap.fromTo(".wordmark-fill", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none",
      scrollTrigger: { trigger: ".site-footer", start: "top 90%", end: "bottom bottom", scrub: true } });
  }

  function headerHide() {
    var header = document.querySelector(".site-header");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) { header.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 160); }
    });
  }

  function magnetic() {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      if (btn.dataset.magnetic) return;
      btn.dataset.magnetic = "1";
      var label = btn.querySelector(".magnetic-label");
      var bx = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3" });
      var by = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3" });
      var lx = gsap.quickTo(label, "x", { duration: 0.6, ease: "power3" });
      var ly = gsap.quickTo(label, "y", { duration: 0.6, ease: "power3" });
      btn.addEventListener("mousemove", function (e) {
        if (root.classList.contains("rm")) return;
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        bx(dx * 0.35); by(dy * 0.35); lx(dx * 0.15); ly(dy * 0.15);
      });
      btn.addEventListener("mouseleave", function () {
        gsap.to([btn, label], { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  document.fonts.ready.then(function () {
    started = true;
    var mm = gsap.matchMedia();
    mm.add({
      desktop: "(min-width: 768px)",
      motion: "(prefers-reduced-motion: no-preference)",
      fine: "(hover: hover) and (pointer: fine)"
    }, function (ctx) {
      var c = ctx.conditions;
      if (!c.motion) {
        root.classList.remove("js-motion");
        root.classList.add("rm");
        return;
      }
      root.classList.remove("rm");
      smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.1, effects: true, smoothTouch: false });

      // Create in page order so pins push later triggers to the right place.
      var splits = [heroIntro()];
      if (c.desktop) zoomPinned(); else zoomSimple();
      splits.push(statement());
      if (c.desktop) { stackPinned(); galleryPinned(); } else { mobileReveals(); }
      visitAndFooter();
      headerHide();
      if (c.fine) magnetic();

      return function () {
        splits.forEach(function (s) { s.revert(); });
        document.querySelector(".stack").classList.remove("is-stacked");
        document.querySelector(".gallery").classList.remove("is-pinned");
        document.querySelector(".site-header").classList.remove("is-hidden");
        if (smoother) { smoother.kill(); smoother = null; }
      };
    });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  });
})();
