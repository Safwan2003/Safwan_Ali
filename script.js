(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Motion-gated effects ---------- */
  if (!reduced) {
    root.classList.add("motion");
    initPortal();
    initReveal();
    initStatementDrift();
  }

  /* The deck is an interactive control — available in every render. */
  initDeck();

  /* ============ Portal: scroll-position driven, fully reversible ============ */
  function initPortal() {
    var portal = document.querySelector(".portal");
    var stage = document.querySelector(".portal-stage");
    if (!portal || !stage) return;
    var ticking = false;

    function apply() {
      ticking = false;
      var rect = portal.getBoundingClientRect();
      var dist = portal.offsetHeight - window.innerHeight;
      var p = dist > 0 ? clamp(-rect.top / dist, 0, 1) : 0;
      stage.style.setProperty("--p", p.toFixed(4));
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", apply);
    apply();
  }

  /* ============ Reveal: fires once, never un-reveals ============ */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ============ Statement orb: drift + rotate on scroll ============ */
  function initStatementDrift() {
    var orb = document.querySelector(".statement-orb");
    var sec = document.querySelector(".statement");
    if (!orb || !sec) return;
    var ticking = false;

    function apply() {
      ticking = false;
      var r = sec.getBoundingClientRect();
      var span = window.innerHeight + r.height;
      var prog = clamp((window.innerHeight - r.top) / span, 0, 1);
      var t = (prog - 0.5);
      orb.style.transform = "translateY(" + (t * 90).toFixed(1) + "px) rotate(" + (t * 44).toFixed(1) + "deg)";
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", apply);
    apply();
  }

  /* ============ Throwable card deck ============ */
  function initDeck() {
    var deck = document.getElementById("deck");
    if (!deck) return;
    var cards = Array.prototype.slice.call(deck.querySelectorAll(".deck-card"));
    if (!cards.length) return;
    var dotsWrap = document.getElementById("deckDots");
    var order = cards.map(function (_, i) { return i; });

    var dragging = false, startX = 0, startY = 0, pid = null, current = null, busy = false;
    var THROW_MS = reduced ? 140 : 480;

    var dots = [];
    if (dotsWrap) {
      cards.forEach(function () {
        var d = document.createElement("span");
        d.className = "deck-dot";
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    function stackTransform(pos) {
      var sign = pos % 2 ? 1 : -1;
      return "translate(" + (pos * 7) + "px, " + (pos * -5) + "px) scale(" +
        (1 - pos * 0.035).toFixed(3) + ") rotate(" + (sign * pos * 0.9).toFixed(2) + "deg)";
    }

    function layout(withTransition) {
      order.forEach(function (cardIdx, pos) {
        var c = cards[cardIdx];
        c.style.transition = withTransition ? "transform .45s cubic-bezier(.22,1,.36,1), opacity .3s" : "none";
        c.style.transform = stackTransform(pos);
        c.style.opacity = pos > 4 ? "0" : "1";
        c.style.zIndex = String(cards.length - pos);
        c.style.pointerEvents = pos === 0 ? "auto" : "none";
        c.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-on", i === order[0]); });
    }

    function topCard() { return cards[order[0]]; }

    function throwOut(dir) {
      if (busy) return;
      busy = true;
      var c = topCard();
      var w = deck.offsetWidth || 400;
      c.style.transition = "transform " + THROW_MS + "ms cubic-bezier(.4,0,.2,1), opacity " + THROW_MS + "ms";
      c.style.transform = "translate(" + (dir * w * 1.25) + "px, -52px) rotate(" + (dir * 20) + "deg) scale(1.03)";
      c.style.opacity = "0";
      window.setTimeout(function () {
        order.push(order.shift());
        layout(false);
        // next frame: re-enable transitions for subsequent moves
        requestAnimationFrame(function () { requestAnimationFrame(function () { layout(true); busy = false; }); });
      }, THROW_MS - 10);
    }

    deck.addEventListener("pointerdown", function (e) {
      if (busy || e.target.closest("a")) return;
      dragging = true;
      current = topCard();
      pid = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      current.style.transition = "none";
      try { deck.setPointerCapture(pid); } catch (_) {}
    });

    deck.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      current.style.transform =
        "translate(" + dx + "px, " + (dy * 0.4) + "px) rotate(" + (dx * 0.05).toFixed(2) + "deg) scale(1.02)";
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      try { deck.releasePointerCapture(pid); } catch (_) {}
      var dx = (e.clientX || startX) - startX;
      var w = deck.offsetWidth || 400;
      if (Math.abs(dx) > w * 0.1) {
        throwOut(dx < 0 ? -1 : 1);
      } else {
        current.style.transition = "transform .3s cubic-bezier(.22,1,.36,1)";
        current.style.transform = stackTransform(0);
      }
      current = null;
    }
    deck.addEventListener("pointerup", endDrag);
    deck.addEventListener("pointercancel", function () {
      if (!dragging) return;
      dragging = false;
      try { deck.releasePointerCapture(pid); } catch (_) {}
      layout(true);
      current = null;
    });

    deck.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); throwOut(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); throwOut(-1); }
    });

    window.addEventListener("resize", function () { if (!dragging && !busy) layout(true); });
    layout(true);
  }
})();
