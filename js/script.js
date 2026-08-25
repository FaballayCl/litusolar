/**
 * lituSolar v2.4 - Frontend Script
 * Motor Matemático de Dimensionamiento Solar Exacto + Lightbox + API Google
 */

document.addEventListener('DOMContentLoaded', () => {
  const GOOGLE_API_URL = 'https://script.google.com/macros/s/AKfycbx7EBNs0BdbiorxaLnqtI7--gr_e7fNnBDoZxiO6WQE6vPwW1WORu3hu0LrcBy9-Rfy/exec';

  const INITIAL_PRODUCTS = [
    { id: "KIT-4000W-INI", nombre: "Tu Primer Kit Solar 4kW", precio: 1750000, potencia_total: "4000W", descripcion_corta: "Inversor 4kW, batería 2.5kW 100A y 3 paneles de 620W. Súper oferta inicial.", imagen_url: "images/primer-kit-4000w.jpg" },
    { id: "BAT-FEL-14", nombre: "Batería Litio Felicity 14.3 kWh", precio: 2000000, potencia_total: "14.3 kWh", descripcion_corta: "Batería LiFePO4 de alta eficiencia (51.3V | 280Ah) para respaldo total.", imagen_url: "images/bateria-felicity.jpg" },
    { id: "KIT-6000W-B", nombre: "Kit Solar 6000W Básico", precio: 2700000, potencia_total: "6000W", descripcion_corta: "Inversor 6kW, batería litio 5kW y 6 paneles bifaciales de 620W.", imagen_url: "images/kit-6000w-basico.jpg" },
    { id: "KIT-6000W-I", nombre: "Kit Solar 6000W Plus", precio: 3000000, potencia_total: "6000W", descripcion_corta: "Mayor captación con 8 paneles bifaciales de 620W y batería 5kW.", imagen_url: "images/kit-6000w-intermedio.jpg" },
    { id: "KIT-6000W-P", nombre: "Kit Solar 6000W Premium", precio: 3700000, potencia_total: "6000W", descripcion_corta: "Autonomía superior con batería de 8.75kW y 8 paneles bifaciales.", imagen_url: "images/kit-6000w-premium.jpg" },
    { id: "KIT-8000W-8B", nombre: "Kit Solar 8000W (Batería 8.75kW)", precio: 5000000, potencia_total: "8000W", descripcion_corta: "Inversor 8kW, 12 paneles de 620W y batería de litio 8.75kW.", imagen_url: "images/kit-8000w-8bateria.jpg" },
    { id: "KIT-8000W-14B-12P", nombre: "Kit Solar 8000W Plus (Batería 14.3kW)", precio: 6100000, potencia_total: "8000W", descripcion_corta: "Inversor 8kW, 12 paneles de 620W y batería de litio 14.3kWh.", imagen_url: "images/kit-8000w-14bateria.jpg" },
    { id: "KIT-8000W-14B-16P", nombre: "Kit Solar 8000W Master Pro (16 Paneles)", precio: 6800000, potencia_total: "8000W", descripcion_corta: "Máxima potencia con 16 paneles de 620W y batería de litio 14.3kWh.", imagen_url: "images/kit-8000w-16paneles.jpg" },
    { id: "EST-MONOPOSTE", nombre: "Estructura Monoposte para Paneles Solares", precio: 0, potencia_total: "Soporte 8 / 16 paneles", descripcion_corta: "Estructura resistente para 8 o 16 paneles con inclinación óptima.", imagen_url: "images/estructura-monoposte.jpg" }
  ];

  // --- 1. INTRO SPLASH SCREEN ---
  const introOverlay = document.getElementById('solar-intro-overlay');
  const skipBtn = document.getElementById('skip-intro');
  if (introOverlay) {
    const hideIntro = () => {
      introOverlay.classList.add('fade-out');
      setTimeout(() => introOverlay.style.display = 'none', 700);
    };
    const timer = setTimeout(hideIntro, 1800);
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        clearTimeout(timer);
        hideIntro();
      });
    }
  }

  // --- 2. MENÚ MÓVIL ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('active')));
  }

  // --- 3. UTILIDADES DE FORMATO Y SEGURIDAD ---
  const formatCLP = (monto) => {
    if (!monto || isNaN(monto) || monto <= 0) return 'A cotizar';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto);
  };

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  };

  const sanitizeUrl = (url) => {
    if (!url) return 'images/logo.png';
    const clean = String(url).trim();
    if (clean.startsWith('images/') || clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    return 'images/logo.png';
  };

  // --- 4. LIGHTBOX MODAL ---
  let lightbox = document.getElementById('image-lightbox-modal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox-modal';
    lightbox.className = 'lightbox-modal';
    lightbox.style.display = 'none';
    lightbox.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <img src="" alt="" class="lightbox-img">
    `;
    document.body.appendChild(lightbox);

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      setTimeout(() => {
        if (!lightbox.classList.contains('active')) lightbox.style.display = 'none';
      }, 300);
    };

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  const openLightbox = (src) => {
    if (!src || src.includes('logo.png')) return;
    const imgElement = lightbox.querySelector('.lightbox-img');
    imgElement.src = src;
    lightbox.style.display = 'flex';
    requestAnimationFrame(() => lightbox.classList.add('active'));
  };

  // --- 5. CARGA INSTANTÁNEA DEL CATÁLOGO ---
  const catalogoContainer = document.getElementById('catalogo-container');

  const renderProducts = (productos) => {
    if (!catalogoContainer || !productos || productos.length === 0) return;
    catalogoContainer.innerHTML = '';

    productos.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const nombre = escapeHTML(prod.nombre);
      const precio = formatCLP(prod.precio);
      const desc = escapeHTML(prod.descripcion_corta);
      const imgPath = sanitizeUrl(prod.imagen_url);
      const whatsappUrl = `https://wa.me/56971995226?text=${encodeURIComponent(`Hola lituSolar, me interesa cotizar el "${prod.nombre}" (${prod.potencia_total || ''}).`)}`;

      card.innerHTML = `
        <div class="product-img-wrapper" title="Haz clic para ampliar">
          <img src="${imgPath}" alt="${nombre}" loading="lazy" decoding="async" class="product-clickable-img"
               onerror="if (this.src.endsWith('.jpg')) { this.src = this.src.replace('.jpg', '.jpeg'); } else if (this.src.endsWith('.jpeg')) { this.src = this.src.replace('.jpeg', '.png'); } else { this.src = 'images/logo.png'; }">
          <span class="expand-icon">🔍 Ampliar</span>
        </div>
        <h3>${nombre}</h3>
        <p class="price">${precio}</p>
        <p class="desc">${desc}</p>
        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-block">
          ⚡ Me interesa
        </a>
      `;

      card.querySelector('.product-img-wrapper').addEventListener('click', () => {
        const img = card.querySelector('img');
        if (img && img.src) openLightbox(img.src);
      });

      catalogoContainer.appendChild(card);
    });
  };

  const cachedData = localStorage.getItem('litusolar_products_cache');
  if (cachedData) {
    try { renderProducts(JSON.parse(cachedData)); } catch (e) { renderProducts(INITIAL_PRODUCTS); }
  } else {
    renderProducts(INITIAL_PRODUCTS);
  }

  if (catalogoContainer) {
    fetch(`${GOOGLE_API_URL}?action=getProducts`)
      .then(res => res.json())
      .then(response => {
        if (response.success && response.data && response.data.length > 0) {
          localStorage.setItem('litusolar_products_cache', JSON.stringify(response.data));
          renderProducts(response.data);
        }
      })
      .catch(() => console.log('Catálogo servido desde caché local.'));
  }

  // ========================================================================
  // 6. MOTOR MATEMÁTICO DE DIMENSIONAMIENTO SOLAR EXACTO
  // ========================================================================
  const tabBtnBoleta = document.getElementById('tab-btn-boleta');
  const tabBtnEquipos = document.getElementById('tab-btn-equipos');
  const viewBoleta = document.getElementById('view-boleta');
  const viewEquipos = document.getElementById('view-equipos');

  const inputGastoLuz = document.getElementById('input-gasto-luz');
  const selectTipoSistema = document.getElementById('select-tipo-sistema');
  const applianceChecks = document.querySelectorAll('.appliance-check');

  const resConsumoKwh = document.getElementById('res-consumo-kwh');
  const resAhorroAnual = document.getElementById('res-ahorro-anual');
  const resKitNombre = document.getElementById('res-kit-nombre');
  const resKitDetalles = document.getElementById('res-kit-detalles');
  const resKitPrecio = document.getElementById('res-kit-precio');
  const calcWhatsappBtn = document.getElementById('calc-exacta-whatsapp-btn');

  let modoCalculo = 'boleta'; // 'boleta' o 'equipos'

  // Conmutador de Pestañas
  if (tabBtnBoleta && tabBtnEquipos) {
    tabBtnBoleta.addEventListener('click', () => {
      modoCalculo = 'boleta';
      tabBtnBoleta.classList.add('active');
      tabBtnEquipos.classList.remove('active');
      viewBoleta.classList.add('active');
      viewEquipos.classList.remove('active');
      ejecutarCalculoExacto();
    });

    tabBtnEquipos.addEventListener('click', () => {
      modoCalculo = 'equipos';
      tabBtnEquipos.classList.add('active');
      tabBtnBoleta.classList.remove('active');
      viewEquipos.classList.add('active');
      viewBoleta.classList.remove('active');
      ejecutarCalculoExacto();
    });
  }

  function ejecutarCalculoExacto() {
    if (!resKitNombre) return;

    // Tarifa promedio actual en Chile Central (~$175 CLP / kWh)
    const TARIFA_KWH = 175;
    let consumoMensualKwh = 0;
    let gastoMensualClp = 0;
    let esOffgrid = false;
    let tieneBombaPozo = false;

    if (modoCalculo === 'boleta') {
      gastoMensualClp = Math.max(15000, Number(inputGastoLuz ? inputGastoLuz.value : 100000) || 100000);
      consumoMensualKwh = Math.round(gastoMensualClp / TARIFA_KWH);
      const tipo = selectTipoSistema ? selectTipoSistema.value : 'ongrid';
      esOffgrid = (tipo === 'offgrid');
    } else {
      // Sumatoria de consumo diario de artefactos
      let kwhDiarios = 0;
      applianceChecks.forEach(chk => {
        if (chk.checked) {
          kwhDiarios += parseFloat(chk.getAttribute('data-kwh') || 0);
          if (chk.id === 'appliance-bomba') tieneBombaPozo = true;
        }
      });
      // Asegurar consumo base mínimo
      kwhDiarios = Math.max(2.5, kwhDiarios);
      consumoMensualKwh = Math.round(kwhDiarios * 30);
      gastoMensualClp = Math.round(consumoMensualKwh * TARIFA_KWH);
      esOffgrid = true; // Por artefactos se asume autonomía con batería
    }

    // Reglas Matemáticas de Emparejamiento con el Catálogo Oficial
    let kitElegido = {
      nombre: "Kit Solar 6000W Plus",
      detalles: "Inversor Híbrido 6kW · 8 Paneles Bifaciales 620W · Bat. Litio 5kW",
      precio: 3000000
    };

    if (consumoMensualKwh >= 1000 || gastoMensualClp >= 250000) {
      kitElegido = {
        nombre: "Kit Solar 8000W Master Pro (16 Paneles)",
        detalles: "Inversor Híbrido 8kW · 16 Paneles 620W · Bat. Litio Industrial 14.3kWh",
        precio: 6800000
      };
    } else if (consumoMensualKwh >= 750 || gastoMensualClp >= 180000 || (esOffgrid && tieneBombaPozo && consumoMensualKwh >= 600)) {
      kitElegido = {
        nombre: "Kit Solar 8000W Plus (Batería 14.3kW)",
        detalles: "Inversor Híbrido 8kW · 12 Paneles 620W · Bat. Litio 14.3kWh",
        precio: 6100000
      };
    } else if (consumoMensualKwh >= 550 || gastoMensualClp >= 130000 || tieneBombaPozo) {
      kitElegido = {
        nombre: "Kit Solar 8000W (Batería 8.75kW)",
        detalles: "Inversor Híbrido 8kW · 12 Paneles 620W · Bat. Litio 8.75kW",
        precio: 5000000
      };
    } else if (consumoMensualKwh >= 400 || gastoMensualClp >= 100000 || (esOffgrid && consumoMensualKwh >= 350)) {
      kitElegido = {
        nombre: "Kit Solar 6000W Premium",
        detalles: "Inversor Híbrido 6kW · 8 Paneles Bifaciales 620W · Bat. Litio 8.75kW",
        precio: 3700000
      };
    } else if (consumoMensualKwh >= 280 || gastoMensualClp >= 70000) {
      kitElegido = {
        nombre: "Kit Solar 6000W Plus",
        detalles: "Inversor Híbrido 6kW · 8 Paneles Bifaciales 620W · Bat. Litio 5kW",
        precio: 3000000
      };
    } else if (consumoMensualKwh >= 150 || gastoMensualClp >= 40000) {
      kitElegido = {
        nombre: "Kit Solar 6000W Básico",
        detalles: "Inversor Híbrido 6kW · 6 Paneles Bifaciales 620W · Bat. Litio 5kW",
        precio: 2700000
      };
    } else {
      kitElegido = {
        nombre: "Tu Primer Kit Solar 4kW",
        detalles: "Inversor Híbrido 4kW · 3 Paneles 620W · Bat. Litio 2.5kW",
        precio: 1750000
      };
    }

    // Ahorro proyectado anual (85% de reducción)
    const ahorroAnualClp = Math.round(gastoMensualClp * 12 * 0.85);

    // Actualización visual en el panel
    if (resConsumoKwh) resConsumoKwh.textContent = `${consumoMensualKwh} kWh/mes`;
    if (resAhorroAnual) resAhorroAnual.textContent = `${formatCLP(ahorroAnualClp)}/año`;
    if (resKitNombre) resKitNombre.textContent = kitElegido.nombre;
    if (resKitDetalles) resKitDetalles.textContent = kitElegido.detalles;
    if (resKitPrecio) resKitPrecio.innerHTML = `${formatCLP(kitElegido.precio)} <span style="font-size: 0.75rem; color: #64748B; font-weight: normal;">(Instalación Incluida)</span>`;

    // Enlace dinámico a WhatsApp
    if (calcWhatsappBtn) {
      const msg = encodeURIComponent(`Hola lituSolar, realicé el dimensionamiento en la web: mi consumo es de ${consumoMensualKwh} kWh/mes (${formatCLP(gastoMensualClp)}/mes). La calculadora me recomendó el "${kitElegido.nombre}". Quisiera coordinar una visita técnica a terreno.`);
      calcWhatsappBtn.href = `https://wa.me/56971995226?text=${msg}`;
    }
  }

  // Listeners de eventos de cálculo
  if (inputGastoLuz) inputGastoLuz.addEventListener('input', ejecutarCalculoExacto);
  if (selectTipoSistema) selectTipoSistema.addEventListener('change', ejecutarCalculoExacto);
  applianceChecks.forEach(chk => chk.addEventListener('change', ejecutarCalculoExacto));

  // Inicializar cálculo al cargar la página
  ejecutarCalculoExacto();

  // --- 7. FORMULARIO DE CONTACTO ---
  const contactoForm = document.querySelector('form');
  const alertSuccess = document.querySelector('.alert-success');
  if (contactoForm) {
    contactoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactoForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Enviar';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando solicitud...';
      }

      const payload = {
        nombre: contactoForm.querySelector('#nombre')?.value || '',
        email: contactoForm.querySelector('#email')?.value || '',
        telefono: contactoForm.querySelector('#telefono')?.value || '',
        mensaje: contactoForm.querySelector('#mensaje')?.value || '',
        _hp_check: contactoForm.querySelector('#_hp_check')?.value || ''
      };

      try {
        const res = await fetch(GOOGLE_API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await res.json();
        if (result.success) {
          contactoForm.reset();
          if (alertSuccess) {
            alertSuccess.classList.add('active');
            alertSuccess.textContent = '¡Muchas gracias! Tu solicitud ha sido registrada con éxito. Un asesor técnico te contactará a la brevedad.';
          }
        } else {
          alert(result.message || 'Error al enviar.');
        }
      } catch (err) {
        alert('Error de conexión. Escríbenos a info@litusolar.cl o al +56 9 7199 5226.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }
});
