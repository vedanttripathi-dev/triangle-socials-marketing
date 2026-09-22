/* Triangle Socials: behaviour. Vanilla JS, no dependencies.
   Reads SITE_CONFIG from js/config.js (loaded first). Everything here is progressive
   enhancement: the content, the FAQ and anchor navigation work without it. */
(() => {
  "use strict";

  /* If config.js ever fails to load, fall back to an empty object rather than
     throwing: the contact links are already written into the HTML, and the nav,
     scroll-spy and reveals below keep working. */
  const C = typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG : {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const SVG_NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const digits = (v) => String(v || "").replace(/\D/g, "");
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return /^https?:$/.test(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };

  /* ---- Contact details (WhatsApp, email, VedicVox) ------------------------ */
  const waLink = (text) => `https://wa.me/${digits(C.whatsappNumber)}?text=${encodeURIComponent(text)}`;

  /* Each block below only overwrites the markup when config.js actually supplies
     the value. index.html already carries the real WhatsApp link, number and
     email, so a missing or blank setting leaves the working HTML in place
     instead of replacing it with an empty one. */
  if (digits(C.whatsappNumber)) {
    $$("[data-wa]").forEach((el) => {
      const service = el.dataset.waService;
      const message = service
        ? `Hi ${C.companyName || "Triangle Socials"}, I would like to discuss ${service}.`
        : C.whatsappMessage;
      if (!service && !message) return;
      el.href = waLink(message);
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }
  if (C.whatsappDisplay) {
    $$("[data-whatsapp-display]").forEach((el) => { el.textContent = C.whatsappDisplay; });
  }
  if (C.email) {
    $$("[data-email]").forEach((a) => {
      a.href = `mailto:${C.email}`;
      if (a.hasAttribute("data-email-text")) a.textContent = C.email;
    });
  }
  const vedicVox = safeUrl(C.vedicVoxUrl);
  if (vedicVox) {
    $$("[data-vedicvox]").forEach((a) => { a.href = vedicVox; a.target = "_blank"; a.rel = "noopener noreferrer"; });
  }

  /* ---- Social links: only platforms with a real URL are rendered ------------ */
  const SOCIAL_LABELS = {
    instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn",
    youtube: "YouTube", twitter: "X (Twitter)", tiktok: "TikTok"
  };
  const iconLink = (url, key, label, showText) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const icon = document.createElementNS(SVG_NS, "svg");
    icon.setAttribute("class", "icon");
    icon.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#i-${key === "twitter" ? "x" : key}`);
    icon.appendChild(use);
    a.appendChild(icon);
    if (showText) a.append(label); else a.setAttribute("aria-label", label);
    return a;
  };

  const socials = Object.entries(C.social || {})
    .map(([key, value]) => [key, safeUrl(value)])
    .filter(([key, url]) => url && SOCIAL_LABELS[key]);

  $$("[data-socials]").forEach((list) => {
    socials.forEach(([key, url]) => list.appendChild(iconLink(url, key, SOCIAL_LABELS[key], true)));
    const wrap = list.closest("[data-socials-wrap]");
    if (wrap && socials.length) wrap.hidden = false;
  });

  $$("[data-founder]").forEach((card) => {
    const founder = (C.founders || [])[Number(card.dataset.founder)];
    const box = $("[data-founder-links]", card);
    if (!founder || !founder.links || !box) return;
    Object.entries(founder.links).forEach(([key, value]) => {
      const url = safeUrl(value);
      if (url && SOCIAL_LABELS[key]) box.appendChild(iconLink(url, key, `${founder.name} on ${SOCIAL_LABELS[key]}`, false));
    });
    if (box.children.length) box.hidden = false;
  });

  /* ---- Structured data: add only the details you have actually provided ---- */
  const orgScript = $("#ld-organization");
  if (orgScript) {
    try {
      const data = JSON.parse(orgScript.textContent);
      if (socials.length) data.sameAs = socials.map(([, url]) => url);
      if (C.email) {
        data.email = C.email;
        if (data.contactPoint) data.contactPoint.email = C.email;
      }
      if (data.contactPoint && digits(C.whatsappNumber)) data.contactPoint.telephone = `+${digits(C.whatsappNumber)}`;
      orgScript.textContent = JSON.stringify(data);
    } catch { /* leave the static markup untouched */ }
  }

  /* ---- Navbar: more opaque after scrolling --------------------------------- */
  const header = $("#site-header");
  if (header) {
    let scrolled = false;
    const onScroll = () => {
      const now = window.scrollY > 8;
      if (now !== scrolled) { scrolled = now; header.classList.toggle("is-scrolled", now); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile navigation ---------------------------------------------------- */
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const root = document.documentElement;
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      root.classList.toggle("nav-open", open);   // hides the floating WhatsApp button
    };
    toggle.addEventListener("click", () => setOpen(!isOpen()));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("click", (e) => { if (isOpen() && !e.target.closest(".site-header")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 1040px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---- Scroll-spy: highlight the nav link for the section in view ----------- */
  const navLinks = $$(".site-nav__list a");
  if ("IntersectionObserver" in window && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = `#${entry.target.id}`;
        navLinks.forEach((a) => {
          if (a.getAttribute("href") === target) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach((section) => spy.observe(section));
  }

  /* ---- Idle hero motion runs only while the hero is actually on screen ------
     The floating chips and triangles loop forever. Left alone they keep the
     compositor busy (and the battery draining) for the whole page, so the
     .hero-live class that drives them is removed as soon as the hero scrolls
     away. CSS handles prefers-reduced-motion separately. */
  const hero = $(".hero");
  if (hero && "IntersectionObserver" in window) {
    const live = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("hero-live", entry.isIntersecting);
    }, { rootMargin: "80px" });
    live.observe(hero);
  } else if (hero) {
    hero.classList.add("hero-live");
  }

  /* ---- Scroll reveal: only blocks that start below the fold are hidden ------ */
  if ("IntersectionObserver" in window && !reduceMotion) {
    $$("[data-stagger]").forEach((parent) => {
      const revealParent = parent.hasAttribute("data-reveal");
      $$(parent.dataset.stagger, parent).forEach((el, i) => {
        el.style.setProperty("--d", `${Math.min(i, 5) * 70}ms`);
        if (!revealParent) el.dataset.reveal = "once";   // children reveal individually
      });
    });

    const finish = (el) => {
      el.classList.add("is-visible");
      if (el.dataset.reveal === "keep") return;
      // hand the element back to its own hover transitions once the reveal is done
      const delay = parseInt(el.style.getPropertyValue("--d"), 10) || 0;
      setTimeout(() => {
        el.classList.remove("reveal", "is-visible");
        el.style.removeProperty("--d");
      }, 900 + delay);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        finish(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    $$("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) {
        el.classList.add("reveal");
        observer.observe(el);
      }
    });
  }

  /* ---- Service cards: soft glow that follows the pointer (mouse only) ------- */
  const grid = $(".services__grid");
  if (grid && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let frame = 0;
    grid.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - box.left}px`);
        card.style.setProperty("--my", `${e.clientY - box.top}px`);
      });
    });
  }

  /* A no-op touch listener makes :active press effects fire on older iOS Safari */
  document.addEventListener("touchstart", () => {}, { passive: true });

  /* ---- Analytics (opt-in via config.js, loaded after page load) ------------- */
  const A = C.analytics || {};
  const loadAnalytics = () => {
    const add = (src, attrs = {}) => {
      const s = document.createElement("script");
      s.async = true;
      s.src = src;
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
      document.head.appendChild(s);
    };
    window.dataLayer = window.dataLayer || [];

    if (A.cloudflareToken) {
      add("https://static.cloudflareinsights.com/beacon.min.js", { "data-cf-beacon": JSON.stringify({ token: A.cloudflareToken }) });
    }
    if (A.ga4Id) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", A.ga4Id);
      add(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(A.ga4Id)}`);
    }
    if (A.gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      add(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(A.gtmId)}`);
    }
    // MARKED LOCATION: Meta Pixel / LinkedIn Insight Tag.
    // Paste the vendor's loader here as JavaScript (not a <script> tag) and add its
    // domains to the Content-Security-Policy in _headers.
  };
  if (A.cloudflareToken || A.ga4Id || A.gtmId) {
    window.addEventListener("load", () => {
      if ("requestIdleCallback" in window) requestIdleCallback(loadAnalytics);
      else setTimeout(loadAnalytics, 2000);
    });
  }
})();
