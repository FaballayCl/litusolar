/**
 * lituSolar v2 - Frontend Script Interactivo
 * Splash Intro + Calculadora Solar en Vivo + API Google con Auto-detector de fotos
 */

document.addEventListener('DOMContentLoaded', () => {
  const GOOGLE_API_URL = 'https://script.google.com/macros/s/AKfycbx7EBNs0BdbiorxaLnqtI7--gr_e7fNnBDoZxiO6WQE6vPwW1WORu3hu0LrcBy9-Rfy/exec';

  // --- 1. CONTROL DE LA INTRO ANIMADA (Splash Screen) ---
  const introOverlay = document.getElementById('solar-intro-overlay');
  const skipBtn = document.getElementById('skip-intro');

  if (introOverlay) {
    const hideIntro = () => {
      introOverlay.classList.add('fade-out');
      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 800);
    };

    const introTimer = setTimeout(hideIntro, 2200);

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

  // --- 4. CARGA DINÁMICA DEL CATÁLOGO DESDE GOOGLE APPS SCRIPT ---
  const catalogoContainer = document.getElementById('catalogo-container');
  if (catalogoContainer) {
    fetch(`${GOOGLE_API_URL}?action=getProducts`)
      .then(res => res.json())
      .then(response => {
        if (!response.success || !response.data || response.data.length === 0) {
          catalogoContainer.innerHTML = '<p class="text-gray" style="grid-column: 1/-1; text-align: center; padding: 40px;">No hay kits disponibles por el momento.</p>';
          return;
        }

        catalogoContainer.innerHTML = '';
        response.data.forEach(prod => {
          const card = document.createElement('div');
          card.className = 'product-card';

          const nombre = escapeHTML(prod.nombre);
          const precio = formatCLP(prod.precio);
          const desc = escapeHTML(prod.descripcion_corta);
          const imgPath = prod.imagen_url.startsWith('http') ? prod.imagen_url : `../${prod.imagen_url}`;
          const whatsappUrl = `https://wa.me/56971995226?text=${encodeURIComponent(`Hola lituSolar, me interesa cotizar el "${prod.nombre}" (${prod.potencia_total || ''}).`)}`;

          card.innerHTML = `
            <img src="${imgPath}" alt="${nombre}" loading="lazy" 
                 onerror="if (this.src.endsWith('.jpg')) { this.src = this.src.replace('.jpg', '.jpeg'); } else if (this.src.endsWith('.jpeg')) { this.src = this.src.replace('.jpeg', '.png'); } else { this.src = '../images/logo.png'; }">
            <h3>${nombre}</h3>
            <p class="price">${precio}</p>
            <p class="desc">${desc}</p>
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-block">
              ⚡ Me interesa
            </a>
          `;
          catalogoContainer.appendChild(card);
        });
      })
      .catch(err => {
        console.error('Error al cargar catálogo en v2:', err);
        catalogoContainer.innerHTML = '<p class="error-text" style="grid-column: 1/-1; text-align: center; padding: 40px;">Error al conectar con el catálogo en línea.</p>';
      });
  }

  // --- 5. CALCULADORA SOLAR INTERACTIVA EN VIVO ---
  const billSlider = document.getElementById('bill-slider');
  const billAmountDisplay = document.getElementById('bill-amount');
  const annualSavingsDisplay = document.getElementById('annual-savings');
  const suggestedKitDisplay = document.getElementById('suggested-kit');
  const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

  if (billSlider && billAmountDisplay) {
    const updateCalculator = () => {
      const billValue = Number(billSlider.value);
      billAmountDisplay.textContent = formatCLP(billValue);

      // Estimación del 85% de ahorro promedio anual
      const annualSavings = Math.round(billValue * 12 * 0.85);
      annualSavingsDisplay.textContent = formatCLP(annualSavings);

      let kitName = 'Tu Primer Kit Solar 4kW';
      if (billValue >= 180000) {
        kitName = 'Kit Solar 8000W Master Pro (16 Paneles)';
      } else if (billValue >= 130000) {
        kitName = 'Kit Solar 8000W (Batería 8.75kW)';
      } else if (billValue >= 80000) {
        kitName = 'Kit Solar 6000W Plus (8 Paneles)';
      } else if (billValue >= 50000) {
        kitName = 'Kit Solar 6000W Básico';
      }

      suggestedKitDisplay.textContent = `Sugerido: ${kitName}`;

      if (calcWhatsappBtn) {
        const msg = encodeURIComponent(`Hola lituSolar, mi cuenta de luz mensual es de ${formatCLP(billValue)}. La calculadora me recomendó el "${kitName}". Quisiera asesoría técnica.`);
        calcWhatsappBtn.href = `https://wa.me/56971995226?text=${msg}`;
      }
    };

    billSlider.addEventListener('input', updateCalculator);
    updateCalculator();
  }
});