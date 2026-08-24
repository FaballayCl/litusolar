/**
 * lituSolar v2 - Frontend Script con Carga Instantánea (0s)
 * Caché en memoria + Sincronización en segundo plano con Google Sheets
 */

document.addEventListener('DOMContentLoaded', () => {
  const GOOGLE_API_URL = 'https://script.google.com/macros/s/AKfycbx7EBNs0BdbiorxaLnqtI7--gr_e7fNnBDoZxiO6WQE6vPwW1WORu3hu0LrcBy9-Rfy/exec';

  // Catálogo inicial precargado en memoria (Permite renderizado en 0 milisegundos)
  const INITIAL_PRODUCTS = [
    {
      id: "KIT-4000W-INI",
      nombre: "Tu Primer Kit Solar 4kW",
      precio: 1750000,
      potencia_total: "4000W",
      descripcion_corta: "Inversor 4kW, batería 2.5kW 100A y 3 paneles de 620W. Súper oferta inicial.",
      imagen_url: "images/primer-kit-4000w.jpg"
    },
    {
      id: "BAT-FEL-14",
      nombre: "Batería Litio Felicity 14.3 kWh",
      precio: 2000000,
      potencia_total: "14.3 kWh",
      descripcion_corta: "Batería LiFePO4 de alta eficiencia (51.3V | 280Ah) para respaldo total.",
      imagen_url: "images/bateria-felicity.jpg"
    },
    {
      id: "KIT-6000W-B",
      nombre: "Kit Solar 6000W Básico",
      precio: 2700000,
      potencia_total: "6000W",
      descripcion_corta: "Inversor 6kW, batería litio 5kW y 6 paneles bifaciales de 620W.",
      imagen_url: "images/kit-6000w-basico.jpg"
    },
    {
      id: "KIT-6000W-I",
      nombre: "Kit Solar 6000W Plus",
      precio: 3000000,
      potencia_total: "6000W",
      descripcion_corta: "Mayor captación con 8 paneles bifaciales de 620W y batería 5kW.",
      imagen_url: "images/kit-6000w-intermedio.jpg"
    },
    {
      id: "KIT-6000W-P",
      nombre: "Kit Solar 6000W Premium",
      precio: 3700000,
      potencia_total: "6000W",
      descripcion_corta: "Autonomía superior con batería de 8.75kW y 8 paneles bifaciales.",
      imagen_url: "images/kit-6000w-premium.jpg"
    },
    {
      id: "KIT-8000W-8B",
      nombre: "Kit Solar 8000W (Batería 8.75kW)",
      precio: 5000000,
      potencia_total: "8000W",
      descripcion_corta: "Inversor 8kW, 12 paneles de 620W y batería de litio 8.75kW.",
      imagen_url: "images/kit-8000w-8bateria.jpg"
    },
    {
      id: "KIT-8000W-14B-12P",
      nombre: "Kit Solar 8000W Plus (Batería 14.3kW)",
      precio: 6100000,
      potencia_total: "8000W",
      descripcion_corta: "Inversor 8kW, 12 paneles de 620W y batería de litio 14.3kWh.",
      imagen_url: "images/kit-8000w-14bateria.jpg"
    },
    {
      id: "KIT-8000W-14B-16P",
      nombre: "Kit Solar 8000W Master Pro (16 Paneles)",
      precio: 6800000,
      potencia_total: "8000W",
      descripcion_corta: "Máxima potencia con 16 paneles de 620W y batería de litio 14.3kWh.",
      imagen_url: "images/kit-8000w-16paneles.jpg"
    },
    {
      id: "EST-MONOPOSTE",
      nombre: "Estructura Monoposte para Paneles Solares",
      precio: 0,
      potencia_total: "Soporte 8 / 16 paneles",
      descripcion_corta: "Estructura resistente para 8 o 16 paneles con inclinación óptima.",
      imagen_url: "images/estructura-monoposte.jpg"
    }
  ];

  // --- 1. INTRO ANIMADA (Splash Screen) ---
  const introOverlay = document.getElementById('solar-intro-overlay');
  const skipBtn = document.getElementById('skip-intro');
  if (introOverlay) {
    const hideIntro = () => {
      introOverlay.classList.add('fade-out');
      setTimeout(() => introOverlay.style.display = 'none', 800);
    };
    const introTimer = setTimeout(hideIntro, 2000);
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        clearTimeout(introTimer);
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

  // --- 4. RENDERIZADO INSTANTÁNEO DE PRODUCTOS ---
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
      const imgPath = escapeHTML(prod.imagen_url);
      const whatsappUrl = `https://wa.me/56971995226?text=${encodeURIComponent(`Hola lituSolar, me interesa cotizar el "${prod.nombre}" (${prod.potencia_total || ''}).`)}`;

      card.innerHTML = `
        <img src="${imgPath}" alt="${nombre}" loading="lazy" decoding="async"
             onerror="if (this.src.endsWith('.jpg')) { this.src = this.src.replace('.jpg', '.jpeg'); } else if (this.src.endsWith('.jpeg')) { this.src = this.src.replace('.jpeg', '.png'); } else { this.src = 'images/logo.png'; }">
        <h3>${nombre}</h3>
        <p class="price">${precio}</p>
        <p class="desc">${desc}</p>
        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-block">
          ⚡ Me interesa
        </a>
      `;
      catalogoContainer.appendChild(card);
    });
  };

  // A. Pinta el catálogo en 0 milisegundos desde memoria / caché local
  const cachedData = localStorage.getItem('litusolar_products_cache');
  if (cachedData) {
    try {
      renderProducts(JSON.parse(cachedData));
    } catch (e) {
      renderProducts(INITIAL_PRODUCTS);
    }
  } else {
    renderProducts(INITIAL_PRODUCTS);
  }

  // B. Sincroniza silenciosamente en segundo plano con Google Sheets
  if (catalogoContainer) {
    fetch(`${GOOGLE_API_URL}?action=getProducts`)
      .then(res => res.json())
      .then(response => {
        if (response.success && response.data && response.data.length > 0) {
          localStorage.setItem('litusolar_products_cache', JSON.stringify(response.data));
          renderProducts(response.data);
        }
      })
      .catch(err => console.log('Aviso: Utilizando catálogo precargado offline/rápido.'));
  }

  // --- 5. CALCULADORA SOLAR INTERACTIVA EN TIEMPO REAL ---
  const billSlider = document.getElementById('bill-slider');
  const billAmountDisplay = document.getElementById('bill-amount');
  const annualSavingsDisplay = document.getElementById('annual-savings');
  const suggestedKitDisplay = document.getElementById('suggested-kit');
  const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

  if (billSlider && billAmountDisplay) {
    const updateCalculator = () => {
      const billValue = Number(billSlider.value);
      billAmountDisplay.textContent = formatCLP(billValue);

      const annualSavings = Math.round(billValue * 12 * 0.85);
      annualSavingsDisplay.textContent = formatCLP(annualSavings);

      let kitName = 'Tu Primer Kit Solar 4kW';
      if (billValue >= 180000) kitName = 'Kit Solar 8000W Master Pro (16 Paneles)';
      else if (billValue >= 130000) kitName = 'Kit Solar 8000W (Batería 8.75kW)';
      else if (billValue >= 80000) kitName = 'Kit Solar 6000W Plus (8 Paneles)';
      else if (billValue >= 50000) kitName = 'Kit Solar 6000W Básico';

      suggestedKitDisplay.textContent = `Sugerido: ${kitName}`;

      if (calcWhatsappBtn) {
        const msg = encodeURIComponent(`Hola lituSolar, mi cuenta de luz mensual es de ${formatCLP(billValue)}. La calculadora me recomendó el "${kitName}". Quisiera asesoría técnica.`);
        calcWhatsappBtn.href = `https://wa.me/56971995226?text=${msg}`;
      }
    };

    billSlider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  // --- 6. ENVÍO SEGURO DEL FORMULARIO DE CONTACTO ---
  const contactoForm = document.querySelector('form');
  const alertSuccess = document.querySelector('.alert-success');
  if (contactoForm) {
    contactoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactoForm.querySelector('button[type="submit"]');
      const textoOriginal = submitBtn ? submitBtn.textContent : 'Enviar';

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
        const response = await fetch(GOOGLE_API_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
          contactoForm.reset();
          if (alertSuccess) {
            alertSuccess.classList.add('active');
            alertSuccess.textContent = '¡Muchas gracias! Tu solicitud de cotización ha sido registrada. Un asesor técnico de lituSolar se contactará contigo a la brevedad.';
          }
        }
      } catch (error) {
        console.error('Error al enviar cotización:', error);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = textoOriginal;
        }
      }
    });
  }
});