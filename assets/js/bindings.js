// assets/js/bindings.js
window.addEventListener('DOMContentLoaded', () => {
  (async () => {
    const safeJSON = async (p) => {
      try {
        const r = await fetch(p, { cache: "no-cache" });
        if (!r.ok) throw 0;
        return await r.json();
      } catch {
        return {};
      }
    };

    // Carga configs
    const [TXT, IMG, COL, SEO] = await Promise.all([
      safeJSON('config/textos.json'),
      safeJSON('config/imagenes.json'),
      safeJSON('config/colores.json'),
      safeJSON('config/seo.json'),
    ]);

    const get = (o, path) =>
      String(path || '')
        .split('.')
        .reduce((a, k) => (a && a[k] != null) ? a[k] : undefined, o);

    /* ========== SEO (super básico, desde seo.json) ========== */
    const upsertMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    const upsertLink = (rel, href) => {
      if (!href) return;
      let el = document.head.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    if (SEO && typeof SEO === 'object') {
      if (SEO.title) document.title = SEO.title;
      upsertMeta('name', 'description', SEO.description);
      upsertMeta('name', 'robots', SEO.robots);
      upsertMeta('name', 'theme-color', SEO.themeColor);
      upsertLink('canonical', SEO.canonical);
      upsertLink('icon', SEO.icon);

      // Open Graph
      if (SEO.og) {
        Object.entries(SEO.og).forEach(([k, v]) => {
          if (v != null) upsertMeta('property', `og:${k}`, v);
        });
      }
      // Twitter Card
      if (SEO.twitter) {
        Object.entries(SEO.twitter).forEach(([k, v]) => {
          if (v != null) upsertMeta('name', `twitter:${k}`, v);
        });
      }
      // JSON-LD
      if (SEO.jsonld) {
        let ld = document.getElementById('seo-jsonld');
        if (!ld) {
          ld = document.createElement('script');
          ld.type = 'application/ld+json';
          ld.id = 'seo-jsonld';
          document.head.appendChild(ld);
        }
        ld.textContent = JSON.stringify(SEO.jsonld);
      }
    }

    /* ========== TEXTOS ========== */
    document.querySelectorAll('[data-text]').forEach(el => {
      const v = get(TXT, el.dataset.text);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-html]').forEach(el => {
      const v = get(TXT, el.dataset.html);
      if (v != null) el.innerHTML = v;
    });

    /* ========== IMÁGENES / ENLACES / FONDOS ========== */
    document.querySelectorAll('[data-src]').forEach(el => {
      const v = get(IMG, el.dataset.src);
      if (v) el.setAttribute('src', v);
    });
    document.querySelectorAll('[data-href]').forEach(el => {
      const v = get(IMG, el.dataset.href);
      if (v) el.setAttribute('href', v);
    });
    document.querySelectorAll('[data-bg]').forEach(el => {
      const v = get(IMG, el.dataset.bg);
      if (v) el.style.backgroundImage = `url('${v}')`;
    });

    /* ========== COLORES → variables CSS ========== */
    if (COL && typeof COL === 'object') {
      Object.entries(COL).forEach(([k, v]) => {
        if (v != null) document.documentElement.style.setProperty(`--${k}`, v);
      });
    }

    /* ========== CONTADORES KPI (de 0 a data-count) ========== */
    const animateCount = (el, to, duration = 1200) => {
      const from = Number(el.textContent.replace(/\D/g, '')) || 0;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const val = Math.round(from + (to - from) * t);
        el.textContent = String(val);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const bootCounters = (root = document) => {
      root.querySelectorAll('.kpi[data-count]').forEach((el) => {
        const target = Number(el.getAttribute('data-count')) || 0;
        if (Number(el.textContent) === target) return; // evita re-animar
        animateCount(el, target, 1200);
      });
    };

    // 🔔 Importante: ahora sí, después de hidratar textos/html
    bootCounters();

    // Evento opcional para otros scripts (ej. app.js) que quieran re-escanear
    document.dispatchEvent(new Event('txt:hydrated'));
  })();
});