const CONTENT = {
  opening: {
    heading: "Happy Birthday, Freddie!",
    intro: "May ginawa akong something something para sa birthday mo",
    button: "Start the Surprise"
  },

  gift: {
    prompt: "Tap the box.",
    popupTitle: "You found it!",
    popupText: "Eme.",
    popupButton: "Continue"
  },

  letter: {
    prompt: "Ito fr na. Tap to open.",
    greeting: "Freddie,",
    paragraphs: [
      "Tanda mo na pre, nagiisip nga ako kung tungkod na lang ireregalo ko sayo.",
      "Ang sama ko naman kung ganun kaya ginawan na lang kita nito."
    ],
    signoff: "Malapit na makalbo kakacode nito,",
    name: "Geon Layosa",
    button: "Continue"
  },

  timeline: {
    question: "Kelan tayo unang nagkita?",
    hint: "Pick a month.",
    // PWEDE KA PA DUMAGDAG KASO BAKA MAKALBO KA NA
    responses: [
      "Pwede na yan."
    ],
    popupButton: "Continue",
    startYear: 2023, startMonth: 8,  
    endYear: 2024,   endMonth: 7     
  },

  cards: {
    heading: "A few things I wanted to tell you",
    hint: "Tap each note to open it.",
    tapLabel: "Tap to open",
    button: "Continue",
    items: [
      { label: "Something I appreciate about you", message: "I really appreciate na lagi mo akong sinasama sa mga plano niyo, and I hope alam niyo na thankful ako for that." },
      { label: "A random memory",                   message: "Yung nawala ka nung nagswimming tayo" },
      { label: "Something I wish for you",          message: "Sana tuloy-tuloy na pagiging IT mo at di ka bumagsak" },
      { label: "One thing I wanted to say",         message: "Gurang ka na boi" }
    ]
  },

  surprise: {
    heading: "Okay, may isa pa.",
    button: "Show me",
    popupTitle: "One last surprise",
    popupText: "Ready?",
    popupButton: "Show me"
  },

  video: {
    heading: "For you, Freddie",
    errorText: "The video didn't load.",
    skipButton: "Go to the ending"
  },

  final: {
    heading: "Happy Birthday, Freddie.",
    paragraphs: [
      "I hope you know how much I appreciate our friendship. I hope this birthday brings you a lot of happiness, good memories, and more moments with the people who care about you. Happy birthday, pre! Thank you for always making me feel included. Here’s to more gala, more kwentuhan, and more memories together."
    ],
    signoff: "Geon Layosa",
    button: "Start over"
  }
};


const VIDEO_SOURCES = [
  "assets/video/HAPPY BIRTHDAY BOI.mp4"
];

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));

  const placeholders = [];
  const isPlaceholder = (s) => typeof s === "string" && /^\s*\[[\s\S]*\]\s*$/.test(s);

  function put(el, text, where) {
    el.textContent = text;
    if (isPlaceholder(text)) {
      el.classList.add("is-placeholder");
      placeholders.push(where);
    }
  }

  function makeP(text, where, cls) {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    put(p, text, where);
    return p;
  }



  $$("[data-c]").forEach((el) => {
    const key = el.dataset.c;
    const val = key.split(".").reduce((o, k) => (o ? o[k] : undefined), CONTENT);
    if (typeof val === "string") put(el, val, key);
  });

  //"Happy Birthday"
  (function buildTitle() {
    const h = $("#open-heading");
    const full = CONTENT.opening.heading;
    const cut = full.lastIndexOf(",");
    if (cut > 0) {
      const a = document.createElement("span");
      a.className = "t-small";
      a.textContent = full.slice(0, cut + 1);
      const b = document.createElement("span");
      b.className = "t-big";
      b.textContent = full.slice(cut + 1).trim();
      h.append(a, b);
    } else {
      h.innerHTML = "";
      const b = document.createElement("span");
      b.className = "t-big";
      b.textContent = full;
      h.append(b);
    }
    h.setAttribute("aria-label", full);
  })();

  function popup({ title, text, confirm }) {
    if (window.Swal) {
      return window.Swal.fire({
        title,
        text,
        confirmButtonText: confirm,
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: true,
        backdrop: "rgba(58, 43, 69, 0.45)",
        showClass: { popup: "sw-in" },
        hideClass: { popup: "sw-out" },
        customClass: {
          popup: "sw-popup",
          title: "sw-title",
          htmlContainer: "sw-text",
          actions: "sw-actions",
          confirmButton: "btn btn-primary sw-confirm"
        }
      });
    }

    return new Promise((resolve) => {
      const back = document.createElement("div");
      back.className = "fb-backdrop";
      back.innerHTML =
        '<div class="fb-dialog sw-popup sw-in" role="dialog" aria-modal="true">' +
        '<h2 class="sw-title"></h2><p class="sw-text"></p>' +
        '<div class="sw-actions"><button type="button" class="btn btn-primary sw-confirm"></button></div></div>';
      $(".sw-title", back).textContent = title;
      $(".sw-text", back).textContent = text;
      const btn = $(".sw-confirm", back);
      btn.textContent = confirm;
      const close = () => {
        back.remove();
        document.removeEventListener("keydown", onKey);
        resolve({ isConfirmed: true });
      };
      const onKey = (e) => { if (e.key === "Escape") close(); };
      btn.addEventListener("click", close);
      document.addEventListener("keydown", onKey);
      document.body.append(back);
      btn.focus();
    });
  }

// FRANKENSTEIN STACKOVERFLOW CONFETTI
  const Confetti = (() => {
    const canvas = $("#confetti");
    const ctx = canvas.getContext("2d");
    const colors = ["#F2C9CE", "#C9788A", "#DCD1EC", "#5E4270", "#C4A05A", "#FFF6E6"];
    let parts = [];
    let raf = null;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    function piece(x, y, vx, vy) {
      return {
        x, y, vx, vy,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0,
        max: 140 + Math.random() * 90
      };
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts = parts.filter((p) => p.life < p.max && p.y < window.innerHeight + 40);
      for (const p of parts) {
        p.life++;
        p.vy += 0.16;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        const fade = Math.max(0, 1 - p.life / p.max);
        ctx.save();
        ctx.globalAlpha = Math.min(1, fade * 2);
        ctx.translate(p.x * dpr, p.y * dpr);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.life * 0.12));
        ctx.fillStyle = p.color;
        ctx.fillRect((-p.w / 2) * dpr, (-p.h / 2) * dpr, p.w * dpr, p.h * dpr);
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : null;
      if (!raf) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function start() { if (!raf) raf = requestAnimationFrame(tick); }

    return {
      burst(x, y, count = 70) {
        if (reduceMotion) return;
        for (let i = 0; i < count; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
          const s = 5 + Math.random() * 7;
          parts.push(piece(x, y, Math.cos(a) * s, Math.sin(a) * s));
        }
        start();
      },
      rain(count = 80) {
        if (reduceMotion) return;
        for (let i = 0; i < count; i++) {
          const p = piece(Math.random() * window.innerWidth, -20 - Math.random() * window.innerHeight * 0.5,
            (Math.random() - 0.5) * 1.5, 1 + Math.random() * 2);
          p.max = 320;
          parts.push(p);
        }
        start();
      }
    };
  })();



  (function buildSky() {
    const sky = $(".sky");
    const balloonSVG = (fill) =>
      '<svg viewBox="0 0 60 118" aria-hidden="true">' +
      '<path d="M30 2C45 2 56 15 56 31c0 18-14 34-26 36C18 65 4 49 4 31 4 15 15 2 30 2z" fill="' + fill + '"/>' +
      '<path d="M26.5 66.5h7l-3.5 5z" fill="' + fill + '"/>' +
      '<ellipse cx="20" cy="20" rx="5" ry="9" fill="#fff" opacity=".35" transform="rotate(-20 20 20)"/>' +
      '<path d="M30 71c-6 10 5 16-1 26s4 14 1 20" fill="none" stroke="#5E4270" stroke-opacity=".35" stroke-width="1.2"/>' +
      "</svg>";

    const balloons = [
      { left: "5%",  top: "14%", w: "clamp(44px, 8vw, 78px)", fill: "#F2C9CE", dur: "7.5s", delay: "-2s" },
      { left: "15%", top: "58%", w: "clamp(34px, 6vw, 58px)", fill: "#DCD1EC", dur: "9s",   delay: "-5s" },
      { left: "83%", top: "10%", w: "clamp(40px, 7vw, 70px)", fill: "#DCD1EC", dur: "8s",   delay: "-1s" },
      { left: "90%", top: "55%", w: "clamp(46px, 8vw, 82px)", fill: "#C9788A", dur: "10s",  delay: "-4s" },
      { left: "72%", top: "76%", w: "clamp(30px, 5vw, 50px)", fill: "#E8CF9C", dur: "8.5s", delay: "-3s" }
    ];
    balloons.forEach((b) => {
      const el = document.createElement("div");
      el.className = "balloon";
      el.style.left = b.left;
      el.style.top = b.top;
      el.style.setProperty("--w", b.w);
      el.style.setProperty("--dur", b.dur);
      el.style.setProperty("--delay", b.delay);
      el.style.marginLeft = "calc(" + b.w + " / -2)";
      el.innerHTML = balloonSVG(b.fill);
      sky.append(el);
    });


    const spots = [
      [12, 30], [24, 12], [30, 80], [40, 22], [58, 14], [66, 86],
      [76, 34], [88, 78], [94, 26], [8, 86], [50, 92], [20, 44]
    ];
    spots.forEach(([x, y], i) => {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = x + "%";
      s.style.top = y + "%";
      s.style.setProperty("--s", (7 + (i % 4) * 3) + "px");
      s.style.setProperty("--c", i % 3 === 0 ? "#DCD1EC" : i % 3 === 1 ? "#C4A05A" : "#F2C9CE");
      s.style.setProperty("--dur", (3.4 + (i % 5) * 0.7) + "s");
      s.style.setProperty("--delay", (-(i * 0.9)) + "s");
      sky.append(s);
    });
  })();



  let current = "open";
  const onEnter = {};

  function goTo(name) {
    if (name === current) return;
    const from = $("#scene-" + current);
    const to = $("#scene-" + name);

    from.classList.remove("is-active");
    from.classList.add("is-leaving");
    setTimeout(() => {
      from.classList.remove("is-leaving");
      if (!from.classList.contains("is-active")) from.hidden = true;
    }, reduceMotion ? 0 : 500);

    if (current === "video") pauseVideo();

    to.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => to.classList.add("is-active")));
    document.body.dataset.scene = name;
    window.scrollTo(0, 0);
    current = name;

    const focusEl = $("[data-focus]", to);
    if (focusEl) {
      focusEl.setAttribute("tabindex", "-1");
      setTimeout(() => focusEl.focus({ preventScroll: true }), 80);
    }
    if (onEnter[name]) onEnter[name]();
  }



  $("#btn-start").addEventListener("click", () => goTo("gift"));



  const gift = $("#gift");
  let giftBusy = false;

  gift.addEventListener("click", async () => {
    if (giftBusy) return;
    giftBusy = true;
    gift.classList.add("is-open");
    gift.setAttribute("aria-label", "Gift box, opened");
    await wait(450);
    const r = gift.getBoundingClientRect();
    Confetti.burst(r.left + r.width / 2, r.top + r.height * 0.3, 80);
    await wait(650);
    await popup({ title: CONTENT.gift.popupTitle, text: CONTENT.gift.popupText, confirm: CONTENT.gift.popupButton });
    goTo("letter");
  });


  const envelope = $("#envelope");
  const envWrap = $("#envelope-wrap");
  const letter = $("#letter");
  const letterBody = $("#letter-body");
  const letterNext = $("#letter-next");
  let letterBusy = false;
  let skipReveal = false;

  function buildLetter() {
    letterBody.innerHTML = "";
    const L = CONTENT.letter;
    letterBody.append(makeP(L.greeting, "letter.greeting"));
    L.paragraphs.forEach((t, i) => letterBody.append(makeP(t, "letter.paragraphs[" + i + "]")));
    const sign = makeP(L.signoff, "letter.signoff", "sign");
    const name = document.createElement("span");
    put(name, L.name, "letter.name");
    sign.append(document.createElement("br"), name);
    letterBody.append(sign);
  }
  buildLetter();

  envelope.addEventListener("click", async () => {
    if (letterBusy) return;
    letterBusy = true;
    skipReveal = false;
    envelope.classList.add("is-open");
    await wait(1100);
    envWrap.classList.add("is-gone");
    await wait(450);
    envWrap.hidden = true;
    letter.hidden = false;
    letterBody.focus({ preventScroll: true });

    const lines = $$("p", letterBody);
    for (const p of lines) {
      p.classList.add("shown");
      if (skipReveal) continue;
      const len = p.textContent.length;
      await wait(Math.min(2200, 650 + len * 9));
    }
    letterNext.hidden = false;
  });

  letterBody.addEventListener("click", () => {
    skipReveal = true;
    $$("p", letterBody).forEach((p) => p.classList.add("shown"));
  });

  letterNext.addEventListener("click", () => goTo("timeline"));


  const timeline = $("#timeline");
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  let timelineBusy = false;

  (function buildTimeline() {
    const T = CONTENT.timeline;
    let y = T.startYear;
    let m = T.startMonth;
    while (y < T.endYear || (y === T.endYear && m <= T.endMonth)) {
      const li = document.createElement("li");
      li.className = "tl-item";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tl-tag";
      const full = monthNames[m - 1] + " " + y;
      btn.dataset.label = full;
      btn.setAttribute("aria-label", full);
      btn.innerHTML = '<span class="tl-month"></span><span class="tl-year"></span>';
      $(".tl-month", btn).textContent = monthNames[m - 1].slice(0, 3);
      $(".tl-year", btn).textContent = y;
      li.append(btn);
      timeline.append(li);
      m++;
      if (m > 12) { m = 1; y++; }
    }
  })();

  timeline.addEventListener("click", async (e) => {
    const tag = e.target.closest(".tl-tag");
    if (!tag || timelineBusy) return;
    timelineBusy = true;
    $$(".tl-tag", timeline).forEach((t) => t.classList.toggle("is-picked", t === tag));
    timeline.classList.add("has-pick");
    await wait(450);
    const R = CONTENT.timeline.responses;
    await popup({
      title: tag.dataset.label,
      text: R[(Math.random() * R.length) | 0],
      confirm: CONTENT.timeline.popupButton
    });
    goTo("cards");
  });


  const notes = $("#notes");
  const cardsNext = $("#cards-next");
  const cardsCount = $("#cards-count");
  const opened = new Set();

  (function buildNotes() {
    CONTENT.cards.items.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "note";
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML =
        '<span class="note-inner">' +
        '<span class="note-face note-front"><span class="note-label"></span><span class="note-tap"></span></span>' +
        '<span class="note-face note-back" aria-hidden="true"><span class="note-kicker"></span><span class="note-msg"></span></span>' +
        "</span>";
      $(".note-label", btn).textContent = item.label;
      $(".note-tap", btn).textContent = CONTENT.cards.tapLabel;
      $(".note-kicker", btn).textContent = item.label;
      put($(".note-msg", btn), item.message, "cards.items[" + i + "].message");

      btn.addEventListener("click", () => {
        const open = !btn.classList.contains("is-open");
        btn.classList.toggle("is-open", open);
        btn.setAttribute("aria-pressed", String(open));
        $(".note-back", btn).setAttribute("aria-hidden", String(!open));
        $(".note-front", btn).setAttribute("aria-hidden", String(open));
        if (open && !opened.has(i)) {
          opened.add(i);
          updateCount();
        }
      });
      notes.append(btn);
    });
    updateCount();
  })();

  function updateCount() {
    const total = CONTENT.cards.items.length;
    cardsCount.textContent = "(" + opened.size + " of " + total + ")";
    cardsNext.disabled = opened.size < total;
  }

  cardsNext.addEventListener("click", () => goTo("surprise"));


  $("#btn-surprise").addEventListener("click", async () => {
    const S = CONTENT.surprise;
    await popup({ title: S.popupTitle, text: S.popupText, confirm: S.popupButton });
    goTo("video");
  });


  const video = $("#bday-video");
  const frame = $("#video-frame");
  const playBtn = $("#video-play");
  const videoError = $("#video-error");
  let srcIndex = -1;
  let videoReady = false;

  function tryNextSource() {
    srcIndex++;
    if (srcIndex >= VIDEO_SOURCES.length) {
      console.error("[birthday] Could not load the video. Tried:", VIDEO_SOURCES,
        "Set the correct filename at the top of VIDEO_SOURCES in js/script.js.");
      frame.hidden = true;
      videoError.hidden = false;
      return;
    }
    video.src = VIDEO_SOURCES[srcIndex];
    video.load();
  }

  video.addEventListener("error", () => { if (!videoReady) tryNextSource(); });

  video.addEventListener("loadedmetadata", () => {
    videoReady = true;
    if (video.videoWidth && video.videoHeight) {
      frame.style.setProperty("--ar-num", (video.videoWidth / video.videoHeight).toFixed(4));
    }
  });

  video.addEventListener("play", () => { playBtn.hidden = true; });
  video.addEventListener("pause", () => { if (!video.ended) playBtn.hidden = false; });

  playBtn.addEventListener("click", () => {
    const p = video.play();
    if (p && p.catch) p.catch(() => { playBtn.hidden = false; });
  });

  video.addEventListener("ended", async () => {
    playBtn.hidden = true;
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
      else if (video.webkitDisplayingFullscreen && video.webkitExitFullscreen) video.webkitExitFullscreen();
    } catch (_) { /* ignore */ }
    await wait(700);
    goTo("final");
  });

  function pauseVideo() { if (!video.paused) video.pause(); }

  // start fetching metadata a little early, while he's on the "may isa pa" screen
  onEnter.surprise = () => { if (srcIndex < 0) tryNextSource(); };
  onEnter.video = () => { if (srcIndex < 0) tryNextSource(); };

  $("#video-skip").addEventListener("click", () => goTo("final"));


  (function buildFinal() {
    const F = CONTENT.final;
    const body = $("#final-body");
    F.paragraphs.forEach((t, i) => body.append(makeP(t, "final.paragraphs[" + i + "]")));
    body.append(makeP(F.signoff, "final.signoff", "sign"));
  })();

  onEnter.final = () => {
    setTimeout(() => Confetti.rain(90), 500);
  };

  $("#btn-replay").addEventListener("click", () => {
    // reset 
    giftBusy = false;
    gift.classList.remove("is-open");
    gift.setAttribute("aria-label", "Open the gift box");

    letterBusy = false;
    envelope.classList.remove("is-open");
    envWrap.classList.remove("is-gone");
    envWrap.hidden = false;
    letter.hidden = true;
    letterNext.hidden = true;
    $$("p", letterBody).forEach((p) => p.classList.remove("shown"));

    timelineBusy = false;
    timeline.classList.remove("has-pick");
    $$(".tl-tag", timeline).forEach((t) => t.classList.remove("is-picked"));

    opened.clear();
    $$(".note", notes).forEach((n) => {
      n.classList.remove("is-open");
      n.setAttribute("aria-pressed", "false");
      $(".note-back", n).setAttribute("aria-hidden", "true");
      $(".note-front", n).removeAttribute("aria-hidden");
    });
    updateCount();

    if (videoReady) video.currentTime = 0;
    playBtn.hidden = false;

    goTo("open");
  });


  if (placeholders.length) {
    console.warn("[birthday] Still placeholder text in js/script.js ->", placeholders.join(", "));
  }
})();
