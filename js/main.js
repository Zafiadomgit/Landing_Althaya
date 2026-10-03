document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hero background video: respect reduced-motion, and quietly drop it if the
  // source 404s (no footage uploaded yet) so the gradient fallback stays clean.
  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
    }
    heroVideo.addEventListener("error", () => heroVideo.remove());
  }

  // Women-only booking notice: shown the first time someone clicks through
  // to the Zanda booking portal in this browser tab, then skipped for the
  // rest of the session once they've seen and continued past it.
  const notice = document.getElementById("bookingNotice");
  const bookingLinks = document.querySelectorAll('a[href*="zandahealth.com"]');
  if (notice && bookingLinks.length) {
    const continueLink = document.getElementById("bookingNoticeContinue");
    let pendingHref = null;
    let lastFocused = null;

    const openNotice = (href) => {
      pendingHref = href;
      lastFocused = document.activeElement;
      notice.hidden = false;
      document.body.classList.add("notice-open");
      continueLink.focus();
    };

    const closeNotice = () => {
      notice.hidden = true;
      document.body.classList.remove("notice-open");
      pendingHref = null;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    };

    bookingLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        try {
          if (sessionStorage.getItem("althaya-booking-notice-seen") === "1") return;
        } catch (e) {}
        event.preventDefault();
        openNotice(link.href);
      });
    });

    continueLink.addEventListener("click", () => {
      try {
        sessionStorage.setItem("althaya-booking-notice-seen", "1");
      } catch (e) {}
      if (pendingHref) continueLink.href = pendingHref;
      notice.hidden = true;
      document.body.classList.remove("notice-open");
      pendingHref = null;
    });

    notice.querySelectorAll("[data-notice-dismiss]").forEach((el) => {
      el.addEventListener("click", closeNotice);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !notice.hidden) closeNotice();
    });
  }

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    document.documentElement.classList.add("js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
    // Safety net: never let content stay hidden if the observer fails to fire
    // (e.g. automated screenshot/print tools that don't dispatch real scroll frames).
    window.setTimeout(() => {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }, 2000);
  }
});
