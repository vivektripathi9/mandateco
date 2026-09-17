(function () {
  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("mobile-menu");
  const hero = document.querySelector(".hero");
  const menuLinks = menu ? menu.querySelectorAll("a") : [];

  function setMenu(open) {
    if (!toggle || !menu) return;

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    if (header) header.classList.toggle("is-menu-open", open);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenu(open);
    });
  }

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  const navCta = document.querySelector(".nav__cta");
  if (navCta) {
    navCta.addEventListener("click", function () {
      setMenu(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (hero) {
    window.requestAnimationFrame(function () {
      hero.classList.add("is-ready");
    });
    startHeroSlideshow();
  }

  const system = document.querySelector(".system");
  const founder = document.querySelector(".founder");
  const journey = document.querySelector(".journey");
  const offer = document.querySelector(".offer");
  const objective = document.querySelector(".objective");
  const why = document.querySelector(".why");
  const voices = document.querySelector(".voices");
  const projects = document.querySelector(".projects");
  const blog = document.querySelector(".blog");
  const closer = document.querySelector(".closer");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function observeReveal(el, onEnter, opts) {
    if (!el) return;

    function enter() {
      const first = !el.classList.contains("is-in");
      el.classList.add("is-in");
      if (first && typeof onEnter === "function") onEnter();
    }

    if (reduceMotion) {
      enter();
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          enter();
          observer.disconnect();
        });
      },
      opts || { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    observer.observe(el);
  }

  observeReveal(system);
  observeReveal(founder);
  observeReveal(journey);
  observeReveal(offer);
  observeReveal(objective);
  observeReveal(why, initWhy(why));
  observeReveal(voices);
  observeReveal(projects, null, {
    threshold: 0.04,
    rootMargin: "0px 0px -8% 0px",
  });
  observeReveal(blog);
  observeReveal(closer);
  initOffer(offer);
  initWhyNet(why);
  initVoices(voices);

  if (projects && location.hash === "#projects") {
    window.requestAnimationFrame(function () {
      projects.classList.add("is-in");
    });
  }

  function initOffer(section) {
    if (!section) return;

    const tabs = section.querySelectorAll(".offer__select button");
    const panel = section.querySelector(".offer__panel");
    const panelIndex = panel.querySelector(".offer__panel-index");
    const panelName = panel.querySelector(".offer__panel-name");
    const panelText = panel.querySelector(".offer__panel-text");
    const mark = section.querySelector(".offer__mark");
    if (!tabs.length || !panel || !panelText || !panelName || !panelIndex) return;

    let swapTimer;

    function labelFrom(button) {
      const indexEl = button.querySelector(".label");
      const index = indexEl ? indexEl.textContent.trim() : "";
      const name = button.textContent.replace(index, "").replace(/\s+/g, " ").trim();
      return {
        index: index,
        name: name,
        copy: button.getAttribute("data-copy") || ""
      };
    }

    function paint(button) {
      const next = labelFrom(button);
      panelIndex.textContent = next.index;
      panelName.textContent = next.name;
      panelText.textContent = next.copy;
      if (mark) mark.textContent = next.index;
    }

    function setActive(button) {
      if (!button || button.classList.contains("is-active")) return;

      tabs.forEach(function (tab) {
        const on = tab === button;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });

      panel.setAttribute("aria-labelledby", button.id);

      if (reduceMotion) {
        paint(button);
        return;
      }

      window.clearTimeout(swapTimer);
      panel.classList.add("is-swap");
      swapTimer = window.setTimeout(function () {
        paint(button);
        panel.classList.remove("is-swap");
      }, 160);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("mouseenter", function () {
        setActive(tab);
      });
      tab.addEventListener("click", function () {
        setActive(tab);
      });
      tab.addEventListener("keydown", function (event) {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        const dir = keys[event.key];
        if (!dir) return;
        event.preventDefault();
        const index = Array.prototype.indexOf.call(tabs, tab);
        const next = tabs[(index + dir + tabs.length) % tabs.length];
        next.focus();
        setActive(next);
      });
    });
  }

  function initWhy(section) {
    if (!section) return;

    const points = section.querySelectorAll(".why__points .why__point");
    if (!points.length) return;

    let index = 0;
    let started = false;
    let timer;
    const dwell = 4300;
    const swapMs = reduceMotion ? 0 : 480;

    function setActive(nextIndex, animate) {
      points.forEach(function (point, i) {
        const on = i === nextIndex;
        point.classList.toggle("is-active", on);
        point.setAttribute("aria-hidden", on ? "false" : "true");
        if (!on) point.classList.remove("is-in");
        if (!animate && on) point.classList.add("is-in");
      });
      index = nextIndex;
    }

    function reveal(point) {
      window.requestAnimationFrame(function () {
        void point.offsetWidth;
        point.classList.add("is-in");
      });
    }

    function next() {
      if (document.body.classList.contains("menu-open")) return;
      if (document.hidden) return;

      const upcoming = (index + 1) % points.length;
      if (reduceMotion) {
        setActive(upcoming, false);
        return;
      }

      const current = points[index];
      current.classList.remove("is-in");

      window.setTimeout(function () {
        current.classList.remove("is-active");
        current.setAttribute("aria-hidden", "true");
        points[upcoming].classList.add("is-active");
        points[upcoming].setAttribute("aria-hidden", "false");
        reveal(points[upcoming]);
        index = upcoming;
      }, swapMs);
    }

    function start() {
      if (started) return;
      started = true;
      setActive(0, false);
      if (!reduceMotion) {
        points[0].classList.remove("is-in");
        window.setTimeout(function () {
          reveal(points[0]);
        }, 280);
      }
      timer = window.setInterval(next, dwell);
    }

    setActive(0, false);
    points[0].classList.remove("is-in");
    return start;
  }

  function initWhyNet(section) {
    const canvas = section ? section.querySelector(".why__net") : null;
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let nodes = [];
    let width = 0;
    let height = 0;
    let running = false;
    let raf = 0;

    function count() {
      if (width < 640) return 42;
      if (width * height > 1400000) return 110;
      return 88;
    }

    function seed() {
      const total = count();
      nodes = [];
      for (let i = 0; i < total; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.26,
          vy: (Math.random() - 0.5) * 0.26,
          r: Math.random() * 1.4 + 1.05
        });
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = section.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length !== count()) seed();
    }

    function range() {
      return Math.min(230, Math.max(140, width * 0.16));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const max = range();
      const max2 = max * max;

      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 > max2) continue;
          const fade = 1 - Math.sqrt(dist2) / max;
          ctx.strokeStyle = "rgba(11, 11, 11," + (0.28 * fade).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        ctx.fillStyle = "rgba(11, 11, 11, 0.52)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      if (!running) return;
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -24) node.x = width + 24;
        else if (node.x > width + 24) node.x = -24;
        if (node.y < -24) node.y = height + 24;
        else if (node.y > height + 24) node.y = -24;
      }
      draw();
      raf = window.requestAnimationFrame(step);
    }

    function start() {
      if (reduce) {
        draw();
        return;
      }
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    function inView() {
      const rect = section.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    }

    resize();
    draw();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(function () {
        resize();
        if (!running) draw();
      });
      ro.observe(section);
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(section);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (inView()) start();
    });
  }

  function startHeroSlideshow() {
    const slides = hero.querySelectorAll(".hero__media img");
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;

    function showSlide(nextIndex) {
      slides.forEach(function (slide, i) {
        const active = i === nextIndex;
        slide.classList.toggle("is-active", active);
        slide.style.opacity = active ? "1" : "0";
      });
      index = nextIndex;
    }

    showSlide(0);

    window.setInterval(function () {
      if (document.body.classList.contains("menu-open")) return;
      showSlide((index + 1) % slides.length);
    }, 6500);
  }

  function initVoices(section) {
    if (!section) return;

    const stage = section.querySelector(".voices__stage");
    const center = section.querySelector(".voices__center");
    const cards = Array.prototype.slice.call(section.querySelectorAll(".voices__card"));
    const mq = window.matchMedia("(min-width: 1100px)");
    const seed0 = Math.floor(Math.random() * 1e9) + 1;
    let seed = seed0;
    let timer;

    function rand() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    function resetSeed() {
      seed = seed0;
    }

    function clear() {
      cards.forEach(function (card) {
        card.style.left = "";
        card.style.top = "";
      });
    }

    function placeInRegion(card, region, bias, align) {
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      let minL = region.l;
      let maxL = region.r - w;
      let minT = region.t;
      let maxT = region.b - h;
      if (maxL < minL) {
        minL = region.l;
        maxL = minL;
      }
      if (maxT < minT) {
        minT = region.t;
        maxT = minT;
      }
      const spanT = maxT - minT;
      let top;
      if (bias === "down") {
        top = minT + spanT * (0.7 + rand() * 0.3);
      } else if (bias === "up") {
        top = minT + spanT * (rand() * 0.3);
      } else {
        top = minT + rand() * spanT;
      }
      let left;
      if (align === "center-right") {
        left = (region.l + region.r) / 2 - w / 2 + 44;
        left = Math.max(minL, Math.min(left, maxL));
      } else {
        left = minL + rand() * (maxL - minL);
      }
      card.style.left = Math.round(left) + "px";
      card.style.top = Math.round(top) + "px";
    }

    function layout() {
      if (!mq.matches) {
        clear();
        return;
      }

      resetSeed();

      const styles = window.getComputedStyle(stage);
      const padL = parseFloat(styles.paddingLeft) || 0;
      const padR = parseFloat(styles.paddingRight) || 0;
      const padT = parseFloat(styles.paddingTop) || 0;
      const padB = parseFloat(styles.paddingBottom) || 0;
      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;
      const gap = 56;
      const pairGap = 16;
      const cw = center.offsetWidth;
      const ch = center.offsetHeight;
      const cx = (stageW - cw) / 2;
      const cy = (stageH - ch) / 2;
      const meet = cy + ch * 0.5;
      const midL = cx;
      const midR = cx + cw;
      const leftR = cx - gap;
      const rightL = cx + cw + gap;

      placeInRegion(cards[0], { l: padL, t: padT, r: leftR, b: meet - pairGap / 2 }, "down");
      placeInRegion(cards[1], { l: midL, t: padT, r: midR, b: cy - gap }, null, "center-right");
      placeInRegion(cards[2], { l: rightL, t: padT, r: stageW - padR, b: meet - pairGap / 2 }, "down");
      placeInRegion(cards[3], { l: padL, t: meet + pairGap / 2, r: leftR, b: stageH - padB }, "up");
      placeInRegion(cards[4], { l: midL, t: cy + ch + gap, r: midR, b: stageH - padB }, null, "center-right");
      placeInRegion(cards[5], { l: rightL, t: meet + pairGap / 2, r: stageW - padR, b: stageH - padB }, "up");
    }

    function onResize() {
      window.clearTimeout(timer);
      timer = window.setTimeout(layout, 80);
    }

    function start() {
      layout();
      window.requestAnimationFrame(layout);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    window.addEventListener("resize", onResize);
    if (window.ResizeObserver) {
      new window.ResizeObserver(onResize).observe(stage);
    }
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", layout);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(layout);
    }

    const reviews = [
      {
        quote: "They sold the inventory we had",
        text: "Site visits started converting once the team knew the product as well as we did.",
        name: "Arjun M.",
        role: "Developer, Bengaluru",
        initials: "AM"
      },
      {
        quote: "Not another channel partner",
        text: "We didn’t need more people on the floor. We needed someone who owned the funnel.",
        name: "Priya K.",
        role: "Project Head",
        initials: "PK"
      },
      {
        quote: "The numbers finally meant something",
        text: "Weekly reports showed stuck leads, not activity. Closures followed.",
        name: "Rahul S.",
        role: "Director, Sales",
        initials: "RS"
      },
      {
        quote: "Our brand. Their process.",
        text: "They sat on our site, sold as us, and didn’t drop the booking after the handshake.",
        name: "Meera N.",
        role: "Managing Partner",
        initials: "MN"
      },
      {
        quote: "Launch stopped being the finish line",
        text: "After launch, the sale kept moving. Every enquiry had a next step.",
        name: "Vikram D.",
        role: "Developer",
        initials: "VD"
      },
      {
        quote: "We stayed on the product",
        text: "Mandateco ran the sales floor. We ran construction. That split was the win.",
        name: "Ananya R.",
        role: "Principal, Residential",
        initials: "AR"
      },
      {
        quote: "Site visits started to close",
        text: "Interest turned into a conversation on site, then a booking, without us chasing it.",
        name: "Kabir T.",
        role: "Project Director",
        initials: "KT"
      },
      {
        quote: "One team. One funnel.",
        text: "Leads stopped getting lost between marketing, the site and the closer.",
        name: "Sneha P.",
        role: "Head of Sales",
        initials: "SP"
      },
      {
        quote: "They owned the next step",
        text: "Every enquiry had a follow-up. Nothing sat in a WhatsApp thread.",
        name: "Dev R.",
        role: "Developer, Mysuru",
        initials: "DR"
      },
      {
        quote: "Reporting we could act on",
        text: "We could see what was stuck and move it the same week.",
        name: "Nisha L.",
        role: "COO",
        initials: "NL"
      },
      {
        quote: "The floor finally felt like ours",
        text: "They sold in our brand, on our site, against our target.",
        name: "Harsh V.",
        role: "Partner",
        initials: "HV"
      },
      {
        quote: "Closures without the scramble",
        text: "The sale ran to a process. We stopped living on last-minute follow-ups.",
        name: "Diya S.",
        role: "Residential Lead",
        initials: "DS"
      }
    ];

    function paintCard(card, review) {
      const quote = card.querySelector(".voices__quote");
      const text = card.querySelector(".voices__text");
      const avatar = card.querySelector(".voices__avatar");
      const name = card.querySelector(".voices__name");
      const role = card.querySelector(".voices__role");
      if (quote) quote.textContent = "“" + review.quote + "”";
      if (text) text.textContent = review.text;
      if (avatar) avatar.textContent = review.initials;
      if (name) name.textContent = review.name;
      if (role) role.textContent = review.role;
    }

    function shownIndexes() {
      return cards.map(function (card) {
        return Number(card.getAttribute("data-review"));
      });
    }

    function nextIndex(current) {
      const used = shownIndexes();
      let index = (current + 1) % reviews.length;
      let hops = 0;
      while (used.indexOf(index) !== -1 && hops < reviews.length) {
        index = (index + 1) % reviews.length;
        hops += 1;
      }
      return index;
    }

    cards.forEach(function (card, index) {
      card.setAttribute("data-review", String(index));
      paintCard(card, reviews[index]);
      card.addEventListener("mouseenter", function () {
        card.setAttribute("data-hold", "true");
      });
      card.addEventListener("mouseleave", function () {
        card.removeAttribute("data-hold");
      });
    });

    let rotateAt = 0;
    let swapping = false;

    function rotateOne() {
      if (swapping) return;
      if (!section.classList.contains("is-in")) return;
      if (document.body.classList.contains("menu-open")) return;
      if (document.hidden) return;
      if (reduceMotion) return;

      const card = cards[rotateAt % cards.length];
      rotateAt += 1;
      if (card.getAttribute("data-hold") === "true") return;

      const current = Number(card.getAttribute("data-review"));
      const upcoming = nextIndex(current);
      if (upcoming === current) return;

      swapping = true;
      card.classList.add("is-swap");
      window.setTimeout(function () {
        card.setAttribute("data-review", String(upcoming));
        paintCard(card, reviews[upcoming]);
        card.classList.remove("is-swap");
        swapping = false;
      }, 420);
    }

    window.setInterval(rotateOne, 3200);
  }
})();
