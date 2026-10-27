// Hero film: bigger file on large screens, never autoplays for reduced-motion visitors,
// pauses off-screen, and always offers a pause/play button.
(function () {
  var video = document.querySelector(".hero-video");
  var toggle = document.querySelector(".video-toggle");
  if (!video || !toggle) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var userPaused = reduce;
  if (window.matchMedia("(min-width: 1280px)").matches && video.dataset.srcLarge) {
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
    }).observe(video.parentElement);
  }
  if (!userPaused) play();
  render();
})();

(function () {
  if (!window.gsap) { document.querySelector(".loader").remove(); return; }
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin);

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var loader = document.querySelector(".loader");
  var header = document.querySelector(".site-head");
  var smoother = null;

  function scrollToHash(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    if (smoother) smoother.scrollTo(target, true, "top top");
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var hash = a.getAttribute("href");
      if (hash.length < 2) return;
      e.preventDefault();
      scrollToHash(hash);
    });
  });

  if (reduceMotion) { loader.remove(); return; }
  loader.style.animation = "none";

  document.fonts.ready.then(function () {
    smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.1, effects: true, smoothTouch: false });

    // Header: solid after the hero starts scrolling, hides on the way down, returns on the way up.
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var y = self.scroll();
        header.classList.toggle("is-solid", y > 60);
        header.classList.toggle("is-hidden", self.direction === 1 && y > 500);
      }
    });

    // Loader count to 93, then lift away into the hero.
    var heroChars = SplitText.create(".hero-title .line", { type: "words,chars" }).chars;
    gsap.set(heroChars, { yPercent: 115 });
    gsap.set([".hero-top", ".hero-foot"], { autoAlpha: 0, y: 20 });

    var count = { v: 0 };
    var countEl = document.querySelector(".loader-count");
    gsap.timeline()
      .from(".loader-word span", { yPercent: 110, duration: .8, ease: "expo.out" })
      .to(count, { v: 93, duration: 1.5, ease: "power2.inOut", onUpdate: function () { countEl.textContent = Math.round(count.v); } }, "-=.3")
      .to(".loader-bar i", { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, "<")
      // Clip-paths take explicit from/to strings: browsers shorten computed inset() values,
      // which would misalign GSAP's number-by-number interpolation.
      .fromTo(".loader", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut", onComplete: function () { loader.remove(); } }, "+=.15")
      .to(".hero-video", { scale: 1, duration: 2.4, ease: "expo.out" }, "<.2")
      .to(heroChars, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: .022 }, "<.25")
      .to([".hero-top", ".hero-foot"], { autoAlpha: 1, y: 0, duration: .9, ease: "power3.out", stagger: .08 }, "<.5");

    // Hero: the film sinks slower than the page and the title lifts away as you leave.
    gsap.to(".hero-media", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-title", { yPercent: -18, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // Section headings rise line by line.
    document.querySelectorAll(".split-reveal").forEach(function (el) {
      SplitText.create(el, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: .09, scrollTrigger: { trigger: el, start: "top 85%" } });
        }
      });
    });

    // Statement: words brighten as you read.
    var words = SplitText.create(".statement-text", { type: "words" }).words;
    gsap.fromTo(words, { opacity: .13 }, { opacity: 1, ease: "none", stagger: .1, scrollTrigger: { trigger: ".statement", start: "top 75%", end: "bottom 55%", scrub: true } });

    // Marquee rows loop forever; scrolling speeds them up and leans them.
    var rows = gsap.utils.toArray(".mq-track").map(function (track, i) {
      track.innerHTML += track.innerHTML;
      var tween = gsap.fromTo(track, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: i ? 46 : 38, ease: "none", repeat: -1 });
      return { tween: tween, track: track };
    });
    var skewTo = rows.map(function (r) { return gsap.quickTo(r.track, "skewX", { duration: .5, ease: "power3" }); });
    ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = self.getVelocity();
        var boost = gsap.utils.clamp(1, 5, 1 + Math.abs(v) / 500);
        rows.forEach(function (r, i) { gsap.to(r.tween, { timeScale: boost, duration: .25, overwrite: true, onComplete: function () { gsap.to(r.tween, { timeScale: 1, duration: 1.2 }); } }); skewTo[i](gsap.utils.clamp(-8, 8, v / -300)); });
      }
    });
    ScrollTrigger.addEventListener("scrollEnd", function () { skewTo.forEach(function (f) { f(0); }); });

    // Treatment rows rise in.
    gsap.from(".trow", { y: 40, autoAlpha: 0, duration: .9, ease: "power3.out", stagger: .08, scrollTrigger: { trigger: ".tlist", start: "top 80%" } });

    // Medicines: the tulsi sprig draws itself.
    gsap.from(".sprig path", { drawSVG: 0, ease: "none", stagger: .06, scrollTrigger: { trigger: ".medicines", start: "top 65%", end: "center 40%", scrub: 1 } });
    gsap.from(".med-list li", { x: -24, autoAlpha: 0, stagger: .07, duration: .8, ease: "power3.out", scrollTrigger: { trigger: ".med-list", start: "top 85%" } });

    // Footer wordmark rises.
    gsap.from(".foot-word span", { yPercent: 100, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".foot-word", start: "top 90%" } });

    // Magnetic buttons.
    if (finePointer) {
      document.querySelectorAll(".magnetic").forEach(function (btn) {
        var bx = gsap.quickTo(btn, "x", { duration: .5, ease: "power3" });
        var by = gsap.quickTo(btn, "y", { duration: .5, ease: "power3" });
        btn.addEventListener("pointermove", function (e) {
          var r = btn.getBoundingClientRect();
          bx((e.clientX - r.left - r.width / 2) * .3);
          by((e.clientY - r.top - r.height / 2) * .4);
        });
        btn.addEventListener("pointerleave", function () { bx(0); by(0); });
      });
    }

    var mm = gsap.matchMedia();
    var revealClosed = "inset(16% 34% 6% 34% round 40vw 40vw 10px 10px)";
    var revealOpen = "inset(0% 0% 0% 0% round 0vw 0vw 0px 0px)";

    // Desktop: pinned arch that opens to full screen, and the horizontal story.
    mm.add("(min-width: 901px)", function () {
      gsap.timeline({ scrollTrigger: { trigger: ".reveal", start: "top top", end: "+=140%", pin: true, scrub: 1 } })
        .fromTo(".reveal-media", { clipPath: revealClosed }, { clipPath: revealOpen, ease: "none" })
        .to(".reveal-media img", { scale: 1, ease: "none" }, 0)
        .from(".reveal-copy > *", { y: 60, autoAlpha: 0, stagger: .08, ease: "power2.out", duration: .35 }, .6);

      var track = document.querySelector(".story-track");
      var distance = function () { return track.scrollWidth - document.documentElement.clientWidth; };
      var progress = document.querySelector(".story-progress i");
      var horizontal = gsap.to(track, {
        x: function () { return -distance(); }, ease: "none",
        scrollTrigger: {
          trigger: ".story", start: "top top", end: function () { return "+=" + distance(); }, pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { progress.style.transform = "scaleX(" + self.progress + ")"; }
        }
      });
      gsap.utils.toArray(".chap").forEach(function (chap) {
        gsap.fromTo(chap.querySelector("img"), { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: chap, containerAnimation: horizontal, start: "left right", end: "right left", scrub: true } });
        gsap.from(chap.querySelector(".chap-year"), { yPercent: 40, autoAlpha: 0, ease: "power2.out", scrollTrigger: { trigger: chap, containerAnimation: horizontal, start: "left 85%", end: "left 55%", scrub: true } });
      });
    });

    // Small screens: no pins; the arch simply opens as it scrolls through.
    mm.add("(max-width: 900px)", function () {
      gsap.fromTo(".reveal-media", { clipPath: revealClosed }, { clipPath: revealOpen, ease: "none", scrollTrigger: { trigger: ".reveal", start: "top 80%", end: "center center", scrub: true } });
      gsap.to(".reveal-media img", { scale: 1, ease: "none", scrollTrigger: { trigger: ".reveal", start: "top 80%", end: "center center", scrub: true } });
      gsap.utils.toArray(".chap").forEach(function (chap) {
        gsap.from(chap, { y: 50, autoAlpha: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: chap, start: "top 85%" } });
      });
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  });
})();
