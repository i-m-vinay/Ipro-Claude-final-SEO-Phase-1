/* =====================================================
   I-Pro Solutions + AccellX — main.js v11
   Full null-safety, form validation, GA events,
   popup logic, TM finder, nav, counters, reveals
   ===================================================== */

/* ── CONFIG ─────────────────────────────────────────── */
const SITE_CONFIG = {
  wa:        '919324090425',
  phone:     '+91 93240 90425',
  email:     'help@iprosolutions.co.in',
  formAudit: 'xgonqopg',
  formMain:  'xqeyjedg',
  popupDelay: 10000,
  popupKey:   'ipro_popup_v11',
  promoKey:   'ipro_promo_v11',
};

/* ── GA EVENT HELPER ─────────────────────────────────── */
function gaEvent(action, category, label) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', action, { event_category: category, event_label: label });
    }
  } catch(e) {}
}

/* ── WHATSAPP ────────────────────────────────────────── */
function initWA() {
  const els = document.querySelectorAll('[data-wa]');
  if (!els.length) return;
  els.forEach(el => {
    const msg = el.dataset.wa || 'Hello! I need help.';
    const url = `https://wa.me/${SITE_CONFIG.wa}?text=${encodeURIComponent(msg)}`;
    if (el.tagName === 'A') {
      el.href = url; el.target = '_blank'; el.rel = 'noopener noreferrer';
    } else {
      el.addEventListener('click', e => {
        e.preventDefault();
        gaEvent('whatsapp_click', 'engagement', msg.substring(0,40));
        window.open(url, '_blank', 'noopener');
      });
    }
    el.addEventListener('click', () =>
      gaEvent('whatsapp_click', 'engagement', msg.substring(0,40))
    );
  });
}

/* ── PROMO BAR ───────────────────────────────────────── */
function initPromoBar() {
  const bar = document.getElementById('promo-bar');
  const btn = document.getElementById('promo-bar-x');
  if (!bar) return;
  if (!sessionStorage.getItem(SITE_CONFIG.promoKey)) {
    bar.style.display = 'flex';
  }
  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      bar.style.display = 'none';
      sessionStorage.setItem(SITE_CONFIG.promoKey, '1');
    });
  }
}

/* ── NAV ─────────────────────────────────────────────── */
function initNav() {
  const nav  = document.getElementById('main-nav');
  const ham  = document.getElementById('nav-ham');
  const list = document.getElementById('nav-links');
  if (!nav) return;

  let scrolled = false;
  function onScroll() {
    const s = window.scrollY > 50;
    if (s !== scrolled) { nav.classList.toggle('scrolled', s); scrolled = s; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (ham && list) {
    ham.addEventListener('click', () => {
      const open = list.classList.toggle('open');
      ham.setAttribute('aria-expanded', String(open));
      const spans = ham.querySelectorAll('span');
      if (open) {
        spans[0] && (spans[0].style.cssText = 'transform:rotate(45deg) translateY(6.5px)');
        spans[1] && (spans[1].style.opacity = '0');
        spans[2] && (spans[2].style.cssText = 'transform:rotate(-45deg) translateY(-6.5px)');
      } else {
        spans.forEach(s => s.style.cssText = '');
      }
    });
    list.querySelectorAll('.nav-link').forEach(l =>
      l.addEventListener('click', () => {
        list.classList.remove('open');
        ham.setAttribute('aria-expanded', 'false');
        ham.querySelectorAll('span').forEach(s => s.style.cssText = '');
      })
    );
    document.addEventListener('click', e => {
      if (list.classList.contains('open') && !nav.contains(e.target)) {
        list.classList.remove('open');
        ham.setAttribute('aria-expanded', 'false');
        ham.querySelectorAll('span').forEach(s => s.style.cssText = '');
      }
    });
  }

  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => {
    const h = (l.getAttribute('href') || '').split('/').pop().split('#')[0];
    l.classList.toggle('active', h === cur && h !== '');
  });
}

/* ── MODAL ───────────────────────────────────────────── */
function initModal() {
  const ov = document.getElementById('lead-modal');
  const x  = document.getElementById('modal-x');
  if (!ov) return;

  function openModal(service) {
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    const sel = ov.querySelector('select[name="service"]');
    if (sel && service) {
      for (let o of sel.options) {
        if (o.text.includes(service) || service.includes(o.text.substring(0,8))) {
          sel.value = o.value; break;
        }
      }
    }
    gaEvent('modal_open', 'conversion', service || 'generic');
  }
  function closeModal() {
    ov.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal]').forEach(b =>
    b.addEventListener('click', e => {
      e.preventDefault();
      openModal(b.dataset.service || '');
    })
  );
  if (x) x.addEventListener('click', closeModal);
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ov.classList.contains('open')) closeModal();
  });

  if (!sessionStorage.getItem('ipro_exit_modal')) {
    let fired = false;
    document.addEventListener('mouseleave', e => {
      if (e.clientY < 0 && !fired) {
        fired = true; openModal('');
        sessionStorage.setItem('ipro_exit_modal', '1');
      }
    });
  }
}

/* ── FORM VALIDATION + SUBMISSION ────────────────────── */
function validateForm(form) {
  const errors = [];
  form.querySelectorAll('.form-field-error').forEach(e => e.remove());

  const nameEl  = form.querySelector('[name="name"]');
  const phoneEl = form.querySelector('[name="phone"]');
  const emailEl = form.querySelector('[name="email"]');
  const msgEl   = form.querySelector('[name="message"]');

  function showFieldError(el, msg) {
    if (!el) return;
    el.style.borderColor = '#ef4444';
    const err = document.createElement('p');
    err.className = 'form-field-error';
    err.style.cssText = 'color:#ef4444;font-size:.72rem;margin-top:3px';
    err.textContent = msg;
    el.parentNode.appendChild(err);
    errors.push(msg);
  }

  if (nameEl && nameEl.value.trim().length < 2)
    showFieldError(nameEl, 'Please enter your full name');

  if (phoneEl) {
    const ph = phoneEl.value.replace(/\D/g, '');
    if (ph.length < 10)
      showFieldError(phoneEl, 'Please enter a valid 10-digit mobile number');
  }

  if (emailEl && emailEl.value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim()))
      showFieldError(emailEl, 'Please enter a valid email address');
  }

  if (msgEl && form.dataset.requireMsg && msgEl.value.trim().length < 5)
    showFieldError(msgEl, 'Please describe your requirement');

  return errors.length === 0;
}

function initForms() {
  document.querySelectorAll('.ipro-form').forEach(form => {
    const isAudit = form.dataset.form === 'audit';
    form.action = `https://formspree.io/f/${isAudit ? SITE_CONFIG.formAudit : SITE_CONFIG.formMain}`;

    form.querySelectorAll('.form-inp').forEach(inp => {
      inp.addEventListener('input', () => {
        inp.style.borderColor = '';
        const err = inp.parentNode.querySelector('.form-field-error');
        if (err) err.remove();
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const btn   = form.querySelector('[type=submit]');
      const ok    = form.querySelector('.form-ok');
      const orig  = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body:   new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          if (ok) ok.style.display = 'block';
          form.reset();
          if (btn) btn.textContent = 'Sent ✓';
          gaEvent('form_submit', 'conversion', isAudit ? 'audit' : 'contact');
          setTimeout(() => {
            if (btn) { btn.disabled = false; btn.textContent = orig; }
            const modal = document.getElementById('lead-modal');
            const popup = document.getElementById('welcome-popup');
            if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
            if (popup) popup.classList.remove('open');
          }, 3500);
        } else {
          throw new Error(`Server error ${res.status}`);
        }
      } catch(err) {
        if (btn) { btn.disabled = false; btn.textContent = orig; }
        const errDiv = form.querySelector('.form-submit-error') || document.createElement('p');
        errDiv.className = 'form-submit-error';
        errDiv.style.cssText = 'color:#ef4444;font-size:.78rem;margin-top:8px;text-align:center';
        errDiv.textContent = 'Submission failed. Please try WhatsApp or call us directly.';
        if (!form.contains(errDiv)) form.appendChild(errDiv);
        gaEvent('form_error', 'error', err.message);
      }
    });
  });
}

/* ── FAQ ─────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      if (!item) return;
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

/* ── SCROLL REVEAL ───────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible')); return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── ANIMATED COUNTERS ───────────────────────────────── */
function initCounters() {
  const els = document.querySelectorAll('.counter');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '+';
      const dur    = 1800;
      const t0     = performance.now();
      function step(now) {
        const p    = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val  = Math.floor(ease * target);
        el.textContent = val >= 1000
          ? val.toLocaleString('en-IN') + (p < 1 ? '' : suffix)
          : val + (p < 1 ? '' : suffix);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target >= 1000
          ? target.toLocaleString('en-IN') + suffix : target + suffix;
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });
  els.forEach(el => obs.observe(el));
}

/* ── WELCOME POPUP ───────────────────────────────────── */
function initWelcomePopup() {
  const popup   = document.getElementById('welcome-popup');
  const closeBtn = document.getElementById('popup-x');
  if (!popup) return;
  if (sessionStorage.getItem(SITE_CONFIG.popupKey)) return;

  function closePopup() {
    popup.classList.remove('open');
    document.body.style.overflow = '';
    sessionStorage.setItem(SITE_CONFIG.popupKey, '1');
  }

  setTimeout(() => {
    popup.classList.add('open');
    document.body.style.overflow = 'hidden';
    gaEvent('popup_shown', 'engagement', 'welcome');
  }, SITE_CONFIG.popupDelay);

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popup.classList.contains('open')) closePopup();
  });
}

/* ── ANCHOR SCROLL ───────────────────────────────────── */
function initAnchorScroll() {
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  }
}

/* ── CTA TRACKING ────────────────────────────────────── */
function initCTATracking() {
  document.querySelectorAll('.btn-primary,.btn-orange,[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim().substring(0, 40);
      gaEvent('cta_click', 'conversion', label);
    });
  });
}

/* ── TM CLASS FINDER ─────────────────────────────────── */
const NICE_DATA = {
  1:{name:"Chemicals",color:"#0e7490",desc:"Industrial chemicals, adhesives, fertilizers, scientific preparations, unprocessed resins, preservatives",goods:true,who:"Chemical manufacturers, adhesive brands, fertilizer companies, laboratory suppliers",examples:["Industrial solvents","Adhesives & glue","Agricultural chemicals","Lab reagents","Paint removers"],keywords:["chemical","adhesive","fertilizer","resin","polymer","lab","scientific","preservative","paint remover","coating chemical","bonding"]},
  2:{name:"Paints & Coatings",color:"#b45309",desc:"Paints, varnishes, lacquers, rust preventives, colorants, dyes, inks",goods:true,who:"Paint manufacturers, dye brands, ink companies",examples:["Wall paints","Wood varnish","Industrial coatings","Fabric dyes","Printing inks"],keywords:["paint","varnish","lacquer","dye","pigment","coating","ink","stain","primer","rust preventive"]},
  3:{name:"Cosmetics & Cleaning",color:"#be185d",desc:"Non-medicated cosmetics, cleaning substances, perfumes, soaps, toothpaste, hair care",goods:true,who:"Beauty brands, skincare, cleaning products, personal care",examples:["Face cream","Shampoo","Perfume","Soap","Toothpaste","Detergent","Body lotion","Makeup"],keywords:["cosmetic","soap","shampoo","perfume","beauty","skincare","cleaning","detergent","toothpaste","lotion","cream","makeup","fragrance","hygiene","haircare","face wash","body wash"]},
  5:{name:"Pharmaceuticals",color:"#0f766e",desc:"Medicines, veterinary preparations, dietary supplements, baby food, plasters, bandages",goods:true,who:"Pharma companies, nutraceutical brands, supplement brands",examples:["Medicines","Vitamins","Dietary supplements","Baby formula","Protein powder"],keywords:["medicine","drug","pharmaceutical","supplement","vitamin","healthcare product","baby food","sanitary","pharma","nutraceutical","protein","ayurvedic"]},
  9:{name:"Electronics & Software",color:"#1d4ed8",desc:"Computers, software, apps, phones, electronic devices, cameras",goods:true,who:"Tech startups, app developers, electronics brands, SaaS companies",examples:["Mobile app","Software","Smartphone","Laptop","Headphones","Smart watch","IoT device"],keywords:["software","app","mobile app","computer","electronics","phone","camera","technology","IT","digital","device","tech","startup","saas","platform","hardware","firmware","wearable","ev"]},
  14:{name:"Jewellery & Watches",color:"#92400e",desc:"Precious metals, jewellery, watches, clocks, precious stones",goods:true,who:"Jewellery brands, watchmakers, luxury goods",examples:["Gold jewellery","Diamond rings","Watches","Silver ornaments"],keywords:["jewellery","jewelry","gold","silver","watch","clock","diamond","gemstone","ring","necklace","bracelet","earring","pendant"]},
  16:{name:"Paper & Stationery",color:"#374151",desc:"Paper, books, printed matter, stationery, educational materials",goods:true,who:"Publishers, stationery brands, printing companies",examples:["Books","Notebooks","Pens","Business cards","Magazines"],keywords:["paper","print","book","stationery","pen","pencil","publishing","magazine","newspaper","packaging","cardboard","notebook","diary"]},
  18:{name:"Bags & Leather",color:"#78350f",desc:"Leather goods, luggage, bags, wallets, umbrellas",goods:true,who:"Bag brands, leather goods, luggage companies",examples:["Handbag","Backpack","Wallet","Luggage","Belt","Laptop bag"],keywords:["leather","bag","handbag","wallet","luggage","backpack","purse","briefcase","suitcase","belt","clutch","tote"]},
  25:{name:"Clothing & Apparel",color:"#7c3aed",desc:"Clothing, footwear, headgear, fashion accessories, sportswear",goods:true,who:"Fashion brands, clothing manufacturers, footwear, sportswear brands",examples:["T-shirts","Jeans","Shoes","Kurta","Saree","Sports jerseys","Jackets","Ethnic wear"],keywords:["clothing","clothes","apparel","fashion","garment","shirt","shoe","footwear","hat","dress","t-shirt","jeans","jacket","uniform","sportswear","kurta","saree","wear","boutique","ethnic","innerwear","lingerie"]},
  29:{name:"Food — Packaged",color:"#059669",desc:"Meat, fish, dairy, preserved foods, processed vegetables and fruits, oils",goods:true,who:"FMCG food brands, dairy companies, packaged food makers",examples:["Butter","Cheese","Packaged snacks","Pickles","Frozen food","Cooking oil","Ghee"],keywords:["food","dairy","milk","cheese","butter","egg","vegetable","fruit","preserve","pickle","frozen food","snack","fmcg","packaged food","ghee","oil","paneer"]},
  30:{name:"Food — Staples",color:"#d97706",desc:"Coffee, tea, cocoa, sugar, rice, flour, bread, pasta, spices, salt, sauces",goods:true,who:"Tea/coffee brands, spice companies, bakery brands, FMCG",examples:["Tea","Coffee","Spices","Flour","Rice","Bread","Chocolate","Biscuits","Masala"],keywords:["tea","coffee","spice","flour","bread","bakery","sugar","chocolate","rice","salt","sauce","biscuit","masala","namkeen","chips","instant noodles","ready to eat"]},
  32:{name:"Beverages (non-alcoholic)",color:"#0284c7",desc:"Beer, mineral water, fruit juices, soft drinks, energy drinks",goods:true,who:"Beverage brands, water brands, juice companies",examples:["Mineral water","Cold drink","Fruit juice","Energy drink","Coconut water"],keywords:["beer","mineral water","soft drink","juice","energy drink","water","carbonated","sports drink","beverage","cola","coconut water","health drink"]},
  35:{name:"Advertising & Business",color:"#0a2d6e",desc:"Advertising, business management, retail, trading, import/export, e-commerce, marketing",goods:false,who:"Marketing agencies, trading companies, retailers, e-commerce, distributors",examples:["Digital marketing agency","Trading company","Online store","Import-export","HR consultancy","Marketplace"],keywords:["advertising","marketing","business","retail","trading","import","export","management consulting","ecommerce","hr","recruitment","franchise","distributor","wholesale","sales","shop","online selling","digital marketing","branding","marketplace","b2b","b2c","dropshipping"]},
  36:{name:"Finance & Insurance",color:"#1e40af",desc:"Insurance, financial services, banking, investments, real estate, fintech",goods:false,who:"Banks, NBFCs, insurance companies, fintech startups, investment firms",examples:["Payment app","Insurance company","Investment platform","Loan app","Real estate firm"],keywords:["finance","insurance","banking","investment","loan","fintech","payment","real estate","stock","mutual fund","wealth","crypto","neobank","money transfer","accounting","nbfc","upi","mortgage"]},
  38:{name:"Telecommunications",color:"#0369a1",desc:"Telecom services, internet, broadcasting, streaming, satellite communication",goods:false,who:"ISPs, telecom companies, streaming platforms, broadcasting",examples:["Internet service","Broadband","Streaming platform","Cable TV","5G service"],keywords:["telecom","internet","broadband","streaming","communication","wifi","5g","isp","cable","satellite","broadcasting","ott","vpn"]},
  39:{name:"Transport & Logistics",color:"#065f46",desc:"Transport, courier, delivery, travel agency, freight, storage",goods:false,who:"Logistics companies, courier firms, travel agencies, cab services, airlines",examples:["Courier service","Cab/taxi app","Travel agency","Freight forwarder","Last-mile delivery"],keywords:["transport","logistics","courier","delivery","travel","tourism","shipping","freight","moving","taxi","aviation","bus","railway","cab","ride sharing"]},
  41:{name:"Education & Entertainment",color:"#6d28d9",desc:"Education, training, coaching, entertainment, sports events, publishing",goods:false,who:"Schools, coaching institutes, edtech, entertainment companies, sports academies",examples:["Coaching institute","EdTech app","Online course","Sports academy","Entertainment channel"],keywords:["education","training","school","college","coaching","entertainment","sports","art","publishing","e-learning","online course","media","edtech","tuition","academy","gaming"]},
  42:{name:"IT & Tech Services",color:"#1d4ed8",desc:"Software development, SaaS, cloud computing, IT consulting, cybersecurity, AI/ML",goods:false,who:"IT companies, software firms, SaaS startups, AI companies, web agencies",examples:["Software firm","SaaS product","Cloud platform","AI startup","Cybersecurity","Web design agency"],keywords:["software service","it service","app development","web design","saas","cloud","data","ai","machine learning","cybersecurity","tech consulting","devops","blockchain","web3","erp","crm","api"]},
  43:{name:"Food Service & Hotels",color:"#b45309",desc:"Restaurants, hotels, cafes, catering, food delivery, temporary accommodation",goods:false,who:"Restaurants, hotels, cafes, cloud kitchens, catering, QSRs",examples:["Restaurant chain","Hotel","Cafe","Cloud kitchen","Catering company","Dhaba","QSR"],keywords:["restaurant","hotel","cafe","catering","food service","hospitality","bar","canteen","bakery shop","takeaway","cloud kitchen","qsr","dhaba","fine dining","tiffin"]},
  44:{name:"Medical & Beauty Services",color:"#0f766e",desc:"Medical services, dental, veterinary, beauty salons, spas, healthcare clinics",goods:false,who:"Hospitals, clinics, diagnostic labs, salons, spas, wellness centres",examples:["Hospital chain","Dental clinic","Beauty salon","Spa & wellness","Diagnostic lab","Ayurveda"],keywords:["hospital","clinic","doctor","medical service","veterinary","spa","salon","beauty service","dentist","nursing","ayurveda","wellness","diagnostic","telemedicine","healthtech"]},
  45:{name:"Legal & Security Services",color:"#374151",desc:"Legal services, IP services, security, personal protection",goods:false,who:"Law firms, legal tech, IP consultants, security agencies",examples:["Law firm","Legal tech platform","IP consultancy","Security agency"],keywords:["legal","law firm","legal service","security","ip","trademark","legal tech","attorney","advocate","patent agent","compliance"]},
};
const NICE_EXTRA = {
  6:{name:"Metal & Hardware",desc:"Metal goods, hardware, locks, building materials",keywords:["metal","steel","iron","hardware","lock","safe","screw","nail","pipe","wire","bolt"]},
  7:{name:"Machinery",desc:"Machines, engines, motors, agricultural machinery",keywords:["machine","engine","motor","pump","compressor","generator","agricultural equipment","turbine","drill","lathe"]},
  8:{name:"Hand Tools",desc:"Hand tools, cutlery, razors, scissors, knives",keywords:["tool","knife","scissors","razor","cutlery","fork","spoon","chisel","saw","blade"]},
  10:{name:"Medical Devices",desc:"Surgical instruments, medical devices, dental equipment",keywords:["medical device","surgical","dental","orthopaedic","diagnostic","wheelchair","prosthetics"]},
  11:{name:"Appliances & Lighting",desc:"Lighting, heating, cooling, cooking appliances",keywords:["lighting","lamp","heater","air conditioner","refrigerator","oven","water filter","purifier","fan","geyser"]},
  12:{name:"Vehicles",desc:"Vehicles, automotive parts, electric vehicles",keywords:["vehicle","car","bike","motorcycle","truck","boat","automobile","tyre","ev","scooter","auto parts"]},
  19:{name:"Building Materials",desc:"Non-metallic construction materials, tiles, cement",keywords:["construction","brick","tile","glass","cement","concrete","flooring","roofing","plywood","marble","granite"]},
  20:{name:"Furniture",desc:"Furniture, mirrors, mattresses",keywords:["furniture","chair","table","sofa","mirror","mattress","bedding","shelf","cabinet","wardrobe"]},
  21:{name:"Kitchenware",desc:"Kitchen utensils, glassware, cookware, cleaning tools",keywords:["kitchen","cookware","utensil","cup","bottle","container","brush","broom","household","thermos","tiffin"]},
  24:{name:"Textiles & Fabrics",desc:"Textiles, fabrics, bed and table covers",keywords:["fabric","textile","cloth","linen","curtain","bed sheet","towel","blanket","saree cloth","dupatta","cotton"]},
  28:{name:"Toys, Games & Sports",desc:"Games, toys, sports equipment, gym equipment",keywords:["toy","game","sport","fitness","board game","video game","playground","doll","gym","cycling","cricket","football","badminton"]},
  31:{name:"Agriculture & Plants",desc:"Raw agricultural produce, plants, seeds, animal feed",keywords:["agriculture","plant","seed","flower","fresh fruit","animal feed","farming","nursery","organic","horticulture"]},
  33:{name:"Alcoholic Beverages",desc:"Wines, spirits, whisky, vodka, rum",keywords:["wine","spirits","whisky","vodka","rum","alcohol","liquor"]},
  37:{name:"Construction Services",desc:"Building construction, installation, repair, maintenance services",keywords:["construction service","repair","maintenance","installation","renovation","plumbing","electrical","civil"]},
  40:{name:"Material Treatment",desc:"Manufacturing, printing, tailoring, food processing",keywords:["printing","manufacturing service","recycling","tailoring","dyeing","food processing","fabrication"]},
};

function searchTMClass(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/[\s,\/&+]+/).filter(w => w.length > 1);
  const all = {...NICE_DATA, ...NICE_EXTRA};
  const scored = [];
  Object.entries(all).forEach(([num, cls]) => {
    let score = 0;
    const name = cls.name.toLowerCase();
    const desc = (cls.desc||'').toLowerCase();
    const kws  = cls.keywords||[];
    if (name === q) score += 20;
    else if (name.includes(q)) score += 12;
    if (desc.includes(q)) score += 7;
    kws.forEach(kw => {
      if (kw === q) score += 15;
      else if (kw.startsWith(q)||q.startsWith(kw)) score += 8;
      else if (kw.includes(q)||q.includes(kw)) score += 5;
      words.forEach(w => { if (w.length>2&&(kw.includes(w)||w.includes(kw))) score += 3; });
    });
    if (score > 0) scored.push({ num: parseInt(num), score, ...cls });
  });
  return scored.sort((a,b)=>b.score-a.score).slice(0,6);
}

function initTMFinder() {
  const container = document.getElementById('tm-finder-container');
  if (!container) return;
  const input   = container.querySelector('.tm-search-input');
  const btn     = container.querySelector('.tm-search-btn');
  const results = container.querySelector('.tm-results');
  const cta     = container.querySelector('.tm-cta-bar');

  function renderResults(query) {
    if (!query||query.trim().length<2) {
      if (results) results.innerHTML='<div class="tm-empty"><div class="tm-empty-icon">🔍</div>Type your business activity above</div>';
      if (cta) cta.style.display='none'; return;
    }
    const found = searchTMClass(query);
    if (!found.length) {
      if (results) results.innerHTML='<div class="tm-empty"><div class="tm-empty-icon">🤔</div>No match — try: clothing, software, food, trading, education, finance</div>';
      if (cta) cta.style.display='none'; return;
    }
    if (results) results.innerHTML = found.map(cls => {
      const isFull = !!NICE_DATA[cls.num];
      const tags = ((cls.examples||cls.keywords).slice(0,5)).map(k=>`<span class="tm-example-tag">${k}</span>`).join('');
      const typeTag = cls.goods===undefined?'':cls.goods
        ?'<span style="background:#ecfeff;color:#0891b2;font-size:.62rem;padding:2px 7px;border-radius:100px;font-weight:600;border:1px solid #a5f3fc;margin-left:6px">Goods</span>'
        :'<span style="background:#fff3ee;color:#ff6b2b;font-size:.62rem;padding:2px 7px;border-radius:100px;font-weight:600;border:1px solid #fdd6c3;margin-left:6px">Services</span>';
      const detailHtml = isFull ? `
        <div class="tm-result-detail" id="tmd-${cls.num}">
          ${cls.who?`<div class="tm-detail-section"><h5>Who files here</h5><p>${cls.who}</p></div>`:''}
          ${cls.examples?`<div class="tm-detail-section"><h5>Common examples</h5><div class="tm-detail-examples">${cls.examples.map(e=>`<span class="tm-detail-tag">${e}</span>`).join('')}</div></div>`:''}
          <div class="tm-ai-answer">
            <h5>🔍 Class ${cls.num} for "${query}"</h5>
            <p>Businesses dealing in <strong>${query}</strong> typically register under <strong>Class ${cls.num} (${cls.name})</strong>. ${cls.desc}${cls.who?'. Common filers: '+cls.who:''}</p>
          </div>
          <div class="tm-ext-links">
            <a href="https://ipindiaservices.gov.in/publicsearch/" target="_blank" rel="noopener" class="tm-ext-link">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              IP India Portal
            </a>
            <a href="https://www.google.com/search?q=${encodeURIComponent('trademark class '+cls.num+' '+query+' India registration')}" target="_blank" rel="noopener" class="tm-ext-link">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Search Google
            </a>
            <button class="tm-ext-link" onclick="selectTMClass(${cls.num},'${cls.name.replace(/'/g,"\\'")}');event.stopPropagation()">Register Class ${cls.num} →</button>
          </div>
        </div>` : '';
      return `<div class="tm-result-card" id="tmr-${cls.num}" onclick="toggleTMCard(${cls.num},'${query.replace(/'/g,"\\'")}')">
        <div class="tm-class-num" style="background:${cls.color||'var(--cb-blue)'};flex-shrink:0">${cls.num}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:4px">
            <h4 style="font-size:.87rem;color:var(--text);margin:0">Class ${cls.num} — ${cls.name}</h4>${typeTag}
          </div>
          <p style="font-size:.76rem;color:var(--text3);margin:0 0 6px;line-height:1.5">${cls.desc}</p>
          <div class="tm-class-examples">${tags}</div>
          ${detailHtml}
        </div>
      </div>`;
    }).join('');
    if (cta) cta.style.display='flex';
  }

  if (input) {
    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('keydown', e => { if(e.key==='Enter') renderResults(input.value); });
  }
  if (btn) btn.addEventListener('click', () => { if(input) renderResults(input.value); });
  container.querySelectorAll('.tm-popular-tag').forEach(t =>
    t.addEventListener('click', () => {
      if (input) { input.value = t.textContent; renderResults(t.textContent); input.focus(); }
    })
  );
  renderResults('');
}

window.toggleTMCard = function(num, query) {
  const card   = document.getElementById('tmr-'+num);
  const detail = document.getElementById('tmd-'+num);
  if (!card||!detail) return;
  const open = card.classList.contains('expanded');
  document.querySelectorAll('.tm-result-card.expanded').forEach(c => {
    c.classList.remove('expanded');
    const d = c.querySelector('.tm-result-detail');
    if (d) d.style.display = 'none';
  });
  if (!open) { card.classList.add('expanded'); detail.style.display = 'block'; }
};

window.selectTMClass = function(num, name) {
  const modal = document.getElementById('lead-modal');
  if (!modal) return;
  const note = modal.querySelector('textarea[name="message"],input[name="message"]');
  if (note) note.value = `I need trademark registration in Class ${num} (${name}).`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};


/* ── Sticky CTA — hide on scroll, show after 1s pause ───────
   Works on mobile only (bar is display:none on desktop).
   Uses requestAnimationFrame for smooth performance.          */
function initStickyCTA() {
  const bar = document.querySelector('.sticky-cta-bar');
  if (!bar) return;

  // Only run on mobile where bar is visible
  if (window.innerWidth > 768) return;

  let scrollTimer   = null;
  let lastScrollY   = window.scrollY;
  let isHidden      = false;
  const PAUSE_MS    = 1000; // 1 second pause before reappearing

  function hide() {
    if (!isHidden) {
      bar.classList.add('hidden');
      isHidden = true;
    }
  }

  function show() {
    if (isHidden) {
      bar.classList.remove('hidden');
      isHidden = false;
    }
  }

  window.addEventListener('scroll', () => {
    // Hide immediately when scroll starts
    hide();

    // Clear any pending show timer
    if (scrollTimer) clearTimeout(scrollTimer);

    // Schedule show after 1s of no scrolling
    scrollTimer = setTimeout(show, PAUSE_MS);

    lastScrollY = window.scrollY;
  }, { passive: true });

  // Also re-check on resize in case orientation changes
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      show(); // Always visible on desktop (bar is hidden by CSS anyway)
    }
  }, { passive: true });
}

/* ── BOOT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initWA();
  initPromoBar();
  initNav();
  initModal();
  initForms();
  initFAQ();
  initReveal();
  initCounters();
  initWelcomePopup();
  initTMFinder();
  initAnchorScroll();
  initCTATracking();
  initStickyCTA();
});

/*
 * FORMSPREE SETUP:
 * xgonqopg → audit/modal forms (subject: "Free Audit — I-Pro")
 * xqeyjedg → contact page form (subject: "New Enquiry — I-Pro")
 *
 * TO EDIT PROMO: find id="promo-bar" in any HTML, change text
 * TO DISABLE POPUP: set popupDelay to a very large number in SITE_CONFIG
 * TO CHANGE WA NUMBER: update SITE_CONFIG.wa above
 */
