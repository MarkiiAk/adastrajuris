// Año en footer

/* ====================== */
/*  ADDED: Empuje de body */
/* ====================== */
(function(){
  const header = document.getElementById('site-header');
  if(!header) return;

  function pushBody(){
    const h = header.offsetHeight || 0;
    // Para anclas nativas (scrollIntoView, hash, etc.)
    document.documentElement.style.scrollPaddingTop = h + 'px';
    // Para que el contenido no quede debajo del header fijo
    document.body.style.paddingTop = h + 'px';
  }

  // Llamada inicial
  pushBody();
  // En cambios de tamaño de ventana
  window.addEventListener('resize', pushBody);

  // Si la altura del header cambia dinámicamente (clases, etc.)
  if('ResizeObserver' in window){
    const ro = new ResizeObserver(pushBody);
    ro.observe(header);
  }
})();

// Mobile nav
(function(){
  const toggle = document.querySelector('.nav__toggle');
  const nav = document.getElementById('primary-nav');
  if(!toggle) return;

  toggle.addEventListener('click', ()=>{
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Cierra al hacer click en un link (mobile)
  nav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> nav.classList.remove('is-open'));
  });
})();

// Smooth scroll + scrollspy
(function(){
  const header = document.getElementById('site-header');
  const links = document.querySelectorAll('.nav__link');

  function setActive(id){
    links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
  }

  links.forEach(link=>{
    link.addEventListener('click', (e)=>{
      const href = link.getAttribute('href');
      if(href?.startsWith('#')){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el){
          const y = el.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 6;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        setActive(e.target.id);
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  document.querySelectorAll('section[id]').forEach(sec=> observer.observe(sec));

  // Header shrink style
  const onScroll = ()=>{
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

// Reveal on scroll (IntersectionObserver, fallback a jQuery si no hay soporte)
(function(){
  const els = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el=> io.observe(el));
  } else {
    // Fallback simple con jQuery
    const $w = $(window);
    function check(){
      const wt = $w.scrollTop(), wb = wt + $w.height();
      $('.reveal').each(function(){
        const $el = $(this), et = $el.offset().top, eb = et + $el.height();
        if(eb >= wt && et <= wb){ $el.addClass('is-visible'); }
      });
    }
    check(); $(window).on('scroll', check);
  }
})();

// KPIs counter
(function(){
  const counters = document.querySelectorAll('.kpi[data-count]');
  const ease = t => 1 - Math.pow(1-t,3);
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const start = performance.now();
      const dur = 1400 + Math.random()*600;

      function tick(now){
        const p = Math.min(1, (now - start)/dur);
        el.textContent = Math.floor(ease(p)*target).toLocaleString('es-MX');
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  },{threshold:0.6});

  counters.forEach(c=> obs.observe(c));
})();

// Filtros de propiedades (jQuery)
(function(){
  const $filters = $('.filter');
  const $cards = $('.prop');

  function apply(filter){
    $filters.removeClass('is-active').attr('aria-selected','false');
    $filters.filter(`[data-filter="${filter}"]`).addClass('is-active').attr('aria-selected','true');

    if(filter === 'all'){ $cards.show(); return; }
    $cards.each(function(){
      const $c = $(this);
      $c.toggle($c.data('type') === filter);
    });
  }

  $filters.on('click', function(){
    apply($(this).data('filter'));
  });
})();

// Carousel básico testimonios
(function(){
  const track = document.querySelector('.carousel__track');
  if(!track) return;
  const prev = document.querySelector('.carousel__btn.prev');
  const next = document.querySelector('.carousel__btn.next');

  function scrollByAmount(dir){
    const w = track.clientWidth * 0.8;
    track.scrollBy({ left: dir * w, behavior:'smooth' });
  }
  prev.addEventListener('click', ()=> scrollByAmount(-1));
  next.addEventListener('click', ()=> scrollByAmount(1));
})();

// Back to top (tecla Home/Fin accesible)
(function(){
  const topLink = document.querySelector('.backtotop');
  topLink?.addEventListener('click', (e)=>{
    e.preventDefault();
    window.scrollTo({ top:0, behavior:'smooth' });
  });
})();

// Prefill contacto desde "Ver detalles" y scroll a #contacto
// Prefill contacto desde "Ver detalles" y scroll a #contacto
(function(){
  const list = document.querySelector('.properties');
  const header = document.getElementById('site-header');

  function scrollToContacto(){
    const sec = document.getElementById('nav8');
    if(!sec) return;
    const y = sec.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 0) + 6;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function buildMensaje(card){
    const title = card?.querySelector('.prop__title')?.textContent?.trim();
    const meta  = card?.querySelector('.prop__meta')?.textContent?.trim();
    const price = card?.querySelector('.prop__price')?.textContent?.trim();

    let msg = `Me gustaría asesoramiento sobre ${title ? ` "${title}"` : ""}. `;
    if(meta)  msg += meta + ". ";
    if(price) msg += `Precio: ${price}. `;
    msg += "¿Podrían agendar una consulta?";
    return msg;
  }

  list?.addEventListener('click', function(e){
    const link = e.target.closest('a.link');
    if(!link) return;

    e.preventDefault();

    const card = link.closest('.prop');
    const textarea = document.getElementById('msg');
    const sendBtn = document.querySelector('#contacto button[type="submit"], #contacto .formBtn');

    if(textarea){
      textarea.value = buildMensaje(card);

      // Detecta si es móvil/touch
      if('ontouchstart' in window){
        // En móviles → focus en el botón para evitar teclado
        sendBtn?.focus();
      } else {
        // En desktop → focus en el textarea
        textarea.focus({ preventScroll: true });
      }
    }

    scrollToContacto();
  });
})();


// FAB Back-to-Top flotante (muestra/oculta y scroll suave)
(function(){
  const btn = document.querySelector('.toTopFab');
  if(!btn) return;

  const showAt = 280; // px de scroll para mostrar el botón
  function onScroll(){
    btn.classList.toggle('is-visible', window.scrollY > showAt);
  }

  // Mostrar estado inicial y en scroll
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Click -> arriba suave
  btn.addEventListener('click', function(e){
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// Toggle de tema (oscuro/claro) con persistencia + cambio de imagen del hero
(function(){
  const STORAGE_KEY = 'theme';
  const btn = document.querySelector('.themeFab');
  const icon = btn?.querySelector('.material-symbols-outlined');
  const docEl = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  // Cambia la(s) imagen(es) marcadas como .hero-img según el tema
  function updateHeroImages(theme){
    const imgs = document.querySelectorAll('.hero-img');
    imgs.forEach(img=>{
      const next = img.dataset[theme === 'dark' ? 'srcDark' : 'srcLight'];
      if(next && img.src !== next){
        // Preload para evitar parpadeo
        const pre = new Image();
        pre.src = next;
        pre.onload = ()=> { img.src = next; };
      }
    });
  }

  function getStoredTheme(){ return localStorage.getItem(STORAGE_KEY); }
  function systemTheme(){ return mq.matches ? 'dark' : 'light'; }
  function currentTheme(){ return docEl.getAttribute('data-theme') || 'dark'; }

  function applyTheme(theme){
    docEl.setAttribute('data-theme', theme);
    if(icon){
      icon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
      btn?.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      btn?.setAttribute('title', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    }
    updateHeroImages(theme);
  }

  function initTheme(){
    const stored = getStoredTheme();
    const theme = stored || systemTheme();
    applyTheme(theme);
  }

  function toggleTheme(){
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Init
  initTheme();

  // Si el user NO eligió manual, respeta cambio del sistema
  mq.addEventListener?.('change', (e)=>{
    if(!getStoredTheme()){
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Click FAB
  btn?.addEventListener('click', (e)=>{
    e.preventDefault();
    toggleTheme();
  });
})();