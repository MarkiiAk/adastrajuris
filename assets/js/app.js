// Año en footer
document.getElementById('year').textContent = new Date().getFullYear();

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
(function(){
  const list = document.querySelector('.properties');
  const header = document.getElementById('site-header');

  function scrollToContacto(){
    const sec = document.getElementById('contacto');
    if(!sec) return;
    const y = sec.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 0) + 6;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function buildMensaje(card){
    const title = card?.querySelector('.prop__title')?.textContent?.trim();
    const meta  = card?.querySelector('.prop__meta')?.textContent?.trim();
    const price = card?.querySelector('.prop__price')?.textContent?.trim();

    let msg = `Me gustaría cotizar la propiedad${title ? ` "${title}"` : ""}. `;
    if(meta)  msg += meta + ". ";
    if(price) msg += `Precio: ${price}. `;
    msg += "¿Podrían darme más detalles?";
    return msg;
  }

  list?.addEventListener('click', function(e){
    const link = e.target.closest('a.link');
    if(!link) return;

    // Evita navegación del "#" y maneja todo aquí
    e.preventDefault();

    const card = link.closest('.prop');
    const textarea = document.getElementById('msg');
    if(textarea){
      textarea.value = buildMensaje(card);
      textarea.focus({ preventScroll: true });
    }

    scrollToContacto();
  });
})();
