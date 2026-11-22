// Runs in the page before any of its scripts. The site itself never opens
// windows or sends you to another site from script, so anything that tries
// is an ad.
(() => {
  // This file runs on every site and does nothing unless the page is YanHH3D:
  // a host with "yanhh3d" in it, or a domain the extension has learned, where
  // force.js sets __noadsForce (before or after this file runs).
  if (/yanhh3d/i.test(location.hostname) || window.__noadsForce) return start();
  Object.defineProperty(window, "__noadsForce", { configurable: true, set(v) { if (v) start(); } });

  function start() {
    if (window.__noadsOn) return;
    window.__noadsOn = true;

    const home = location.hostname.replace(/^www\./, "");
    const isHome = (url) => {
      try {
        const h = new URL(url, location.href).hostname;
        return h === home || h.endsWith("." + home);
      } catch {
        return false;
      }
    };
    const log = (what, url) => console.info("[noads] chặn", what, String(url || ""));

    // window.open: popunders open a new tab with the ad, or open the site in a
    // new tab and send this one to the ad.
    const guardWindow = (w) => {
      const realOpen = w.open;
      const open = function (url) {
        if (url && url !== "about:blank" && isHome(url)) return realOpen.apply(this, arguments);
        log("window.open", url);
        return null;
      };
      Object.defineProperty(w, "open", { value: open, writable: false, configurable: false });

      // A script-made click on a link to another site.
      const A = w.HTMLAnchorElement.prototype;
      const realClick = A.click;
      A.click = function () {
        if (this.href && !isHome(this.href)) return log("link.click", this.href);
        return realClick.apply(this, arguments);
      };
      const realDispatch = w.EventTarget.prototype.dispatchEvent;
      w.EventTarget.prototype.dispatchEvent = function (ev) {
        const a = ev && /click/.test(ev.type) && this instanceof w.Element && this.closest("a[href]");
        if (a && !isHome(a.href)) { log("synthetic click", a.href); return false; }
        return realDispatch.apply(this, arguments);
      };
    };
    guardWindow(window);

    // Ad scripts take a clean window.open from a fresh about:blank iframe.
    const cw = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow");
    Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
      configurable: true,
      get() {
        const w = cw.get.call(this);
        try {
          if (w && w.location.href === "about:blank" && !w.__noads) { w.__noads = 1; guardWindow(w); }
        } catch {}
        return w;
      },
    });

    // Sending this tab to another site from script ("tab-under"). Links you
    // click yourself are user-initiated and still work.
    if (window.navigation) {
      navigation.addEventListener("navigate", (e) => {
        if (!e.userInitiated && e.cancelable && !isHome(e.destination.url)) {
          log("redirect", e.destination.url);
          e.preventDefault();
        }
      });
    }

    // Ad iframes laid over the page open tabs from inside, where this script
    // cannot reach. The only iframes the site uses are the player and Facebook.
    const okFrame = (f) => {
      if (f.closest("#video-player")) return true;
      const src = f.getAttribute("src") || "";
      if (!src || src === "about:blank") return false;
      try {
        const h = new URL(src, location.href).hostname;
        return isHome(src) || h === "facebook.com" || h.endsWith(".facebook.com");
      } catch {
        return false;
      }
    };
    new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (!(n instanceof Element)) continue;
        for (const f of n.tagName === "IFRAME" ? [n] : n.querySelectorAll("iframe")) {
          if (!okFrame(f)) { log("iframe", f.src); f.remove(); }
        }
      }
    }).observe(document, { childList: true, subtree: true });

    // The site's own ad slots.
    const css = document.createElement("style");
    css.textContent = '#catfish-ads, #header-ads, #popup-ads, #banner-view-ads, #popup-giua-man-hinh, [class^="__cld-"] { display: none !important; }';
    (document.head || document.documentElement).appendChild(css);

    // Invisible links laid over the page so your first click lands on an ad.
    addEventListener("click", (e) => {
      const a = e.target instanceof Element && e.target.closest("a[href]");
      if (!a || isHome(a.href)) return;
      const s = getComputedStyle(a);
      const r = a.getBoundingClientRect();
      const covers = r.width * r.height > innerWidth * innerHeight * 0.3;
      if (covers || Number(s.opacity) < 0.1 || s.visibility === "hidden") {
        log("overlay", a.href);
        e.preventDefault();
        e.stopImmediatePropagation();
        a.remove();
      }
    }, true);
  }
})();
