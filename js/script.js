/**
 * lituSolar - Script Principal Frontend
 * Conectado con Google Apps Script API & CMS Maestro (Auto-resolución de imágenes)
 */

document.addEventListener('DOMContentLoaded', () => {
  const GOOGLE_API_URL = 'https://script.google.com/macros/s/AKfycbx7EBNs0BdbiorxaLnqtI7--gr_e7fNnBDoZxiO6WQE6vPwW1WORu3hu0LrcBy9-Rfy/exec';

  // 1. Menú móvil
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }

  // 2. Funciones de formato y seguridad
  const formatCLP = (monto) => {
    if (!monto || isNaN(monto) || monto <= 0) return 'A cotizar';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  };

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  };

  // 3. Carga Dinámica del Catálogo con Auto-detector de JPG / JPEG
  const catalogoContainer = document.getElementById('catalogo-container');
  if (catalogoContainer) {
    catalogoContainer.innerHTML = '<p class="text-gray" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">Cargando soluciones solares oficiales de lituSolar...</p>';

    fetch(`${GOOGLE_API_URL}?action=getProducts`)
      .then(res => res.json())
      .then(response => {
        if (!response.success || !response.data || response.data.length === 0) {
          catalogoContainer.innerHTML = '<p class="text-gray" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">No hay kits disponibles en este momento.</p>';
          return;
        }

        catalogoContainer.innerHTML = '';
        response.data.forEach(prod => {
          const card = document.createElement('div');
          card.className = 'product-card';

          const nombreEscapado = escapeHTML(prod.nombre);
          const precioFormateado = formatCLP(prod.precio);
          const descCortaEscapada = escapeHTML(prod.descripcion_corta);
          const imagenUrl = escapeHTML(prod.imagen_url);

          const whatsappTexto = encodeURIComponent(`Hola lituSolar, me interesa cotizar el "${prod.nombre}" (${prod.potencia_total || ''}).`);
          const whatsappUrl = `https://wa.me/56971995226?text=${whatsappTexto}`;

          card.innerHTML = `
            <img src="${imagenUrl}" alt="${nombreEscapado}" loading="lazy" 
                 onerror="if (this.src.endsWith('.jpg')) { this.src = this.src.replace('.jpg', '.jpeg'); } else if (this.src.endsWith('.jpeg')) { this.src = this.src.replace('.jpeg', '.png'); } else { this.src = 'images/logo.png'; }">
            <h3>${nombreEscapado}</h3>
            <p class="text-orange" style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">${precioFormateado}</p>
            <p class="text-gray" style="margin-bottom: 20px; font-size: 0.95rem; flex-grow: 1;">${descCortaEscapada}</p>
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-block">
              Me interesa
            </a>
          `;
          catalogoContainer.appendChild(card);
        });
      })
      .catch(err => {
        console.error('Error al sincronizar con Google API:', err);
        catalogoContainer.innerHTML = '<p class="error-text" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">Error al cargar el catálogo en vivo.</p>';
      });
  }

  // 4. Formulario de Contacto
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