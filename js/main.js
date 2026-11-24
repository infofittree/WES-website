// Westmount Energy Solutions — Interactive Scripts
document.addEventListener("DOMContentLoaded", () => {
  // Init AOS (scroll reveal animations)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
      offset: 30,
    });
  }

  // Mobile menu toggle
  const btn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector("nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const active = nav.classList.toggle("active");
      btn.setAttribute("aria-expanded", active);
    });
    document.querySelectorAll("nav a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Navbar scrolled state + scroll progress
  const header = document.querySelector("header");
  const progress = document.querySelector(".scroll-progress");
  const updateScroll = () => {
    const y = window.scrollY;
    if (header) {
      if (y > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = `${Math.min(100, pct)}%`;
    }
  };
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  // Back to top button
  const btt = document.querySelector(".back-to-top");
  if (btt) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) btt.classList.add("visible");
      else btt.classList.remove("visible");
    }, { passive: true });
    btt.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Animated stat counters
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10) || 0;
          const suffix = el.dataset.suffix || "";
          const duration = 1600;
          let start = 0;
          const startTime = performance.now();
          const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
            const val = Math.floor(start + (target - start) * ease);
            el.textContent = val + suffix;
            if (t < 1) requestAnimationFrame(step);
            else {
              el.textContent = target + suffix;
              el.style.textShadow = '0 0 20px rgba(14, 79, 60, 0.4)';
              el.style.transition = 'text-shadow 0.8s ease';
              setTimeout(() => { el.style.textShadow = ''; }, 800);
            }
          };
          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll(".stat-number[data-target]").forEach((el) => observer.observe(el));

  // Contact form validation + sanitization + feedback
  const form = document.querySelector(".contact-form");
  if (form) {
    // Client-side sanitization helper to strip script/HTML tags
    const sanitize = (str) => str.replace(/<[^>]*>?/gm, '').trim();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check anti-spam honeypot
      const honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn("Spam submission suppressed.");
        return;
      }

      const required = form.querySelectorAll("[required]");
      let valid = true;
      required.forEach((field) => {
        const val = sanitize(field.value);
        field.value = val;
        if (!val) {
          valid = false;
          field.style.borderColor = "#dc2626";
          field.style.boxShadow = "0 0 0 4px rgba(220, 38, 38, 0.15)";
        } else {
          field.style.borderColor = "";
          field.style.boxShadow = "";
        }
      });

      if (!valid) {
        const btn = form.querySelector(".btn-submit");
        const original = btn.textContent;
        btn.textContent = "Please fill required fields";
        btn.style.background = "#dc2626";
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = "";
        }, 1600);
        return;
      }

      const btn = form.querySelector(".btn-submit");
      const original = btn.textContent;
      btn.textContent = "Sending…";
      btn.style.opacity = "0.85";
      setTimeout(() => {
        btn.textContent = "Sent! We'll get back to you";
        btn.style.background = "#15803d";
        form.reset();
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = "";
          btn.style.opacity = "1";
        }, 2000);
      }, 1200);
    });
  }

  // Active nav link highlighting
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a:not(.nav-cta)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.style.color = 'var(--primary)';
      link.style.fontWeight = '700';
    }
  });

  // Subtle parallax on hero background image
  const heroImg = document.querySelector('.hero-bg img');
  if (heroImg) {
    heroImg.style.animation = 'none';
    let pTicking = false;
    window.addEventListener('scroll', () => {
      if (!pTicking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.5) {
            heroImg.style.transform = `scale(${1 + y * 0.00015}) translateY(${y * 0.2}px)`;
          }
          pTicking = false;
        });
        pTicking = true;
      }
    }, { passive: true });
  }

  // Optimized 3D card tilt on hover (cached geometry + rAF throttling)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.service-card, .equip-card').forEach(card => {
      let rect = null;
      let ticking = false;

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        card.style.transitionProperty = 'box-shadow, border-color';
      }, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (!rect || ticking) return;
        ticking = true;
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-8px)`;
          ticking = false;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        rect = null;
        card.style.transitionProperty = '';
        card.style.transform = '';
      }, { passive: true });
    });
  }

  // Re-refresh AOS on load for images
  window.addEventListener("load", () => AOS.refresh());
});
