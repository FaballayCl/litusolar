/**
 * lituSolar - Script Principal Frontend
 * Conectado con Google Apps Script API & CMS Maestro
 */

document.addEventListener('DOMContentLoaded', () => {
  // Endpoint oficial de lituSolar desplegado en Google Apps Script
  const GOOGLE_API_URL = 'https://script.google.com/macros/s/AKfycbx7EBNs0BdbiorxaLnqtI7--gr_e7fNnBDoZxiO6WQE6vPwW1WORu3hu0LrcBy9-Rfy/exec';

  // --- 1. MENÚ MÓVIL (Hamburguesa) ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }

  // --- 2. FUNCIONES AUXILIARES DE SEGURIDAD Y FORMATO ---
  const formatCLP = (monto) => {
    if (!monto || isNaN(monto) || monto <= 0) return 'A cotizar';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  };

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  };

  // --- 3. CARGA DINÁMICA DEL CATÁLOGO (catalogo.html) ---
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
            <img src="${imagenUrl}" alt="${nombreEscapado}" loading="lazy" onerror="this.src='images/logo.png'">
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
        catalogoContainer.innerHTML = '<p class="error-text" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">Error al cargar el catálogo en vivo. Por favor recarga la página o contáctanos por WhatsApp.</p>';
      });
  }

  // --- 4. CARGA DINÁMICA DEL BLOG (blog.html) ---
  const blogContainer = document.getElementById('blog-container') || document.querySelector('.blog-grid');
  if (blogContainer && window.location.pathname.includes('blog')) {
    fetch(`${GOOGLE_API_URL}?action=getBlog`)
      .then(res => res.json())
      .then(response => {
        if (response.success && response.data && response.data.length > 0) {
          blogContainer.innerHTML = '';
          response.data.forEach(articulo => {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.innerHTML = `
              <img src="${escapeHTML(articulo.imagen_url)}" alt="${escapeHTML(articulo.titulo)}" loading="lazy" onerror="this.src='images/logo.png'">
              <span class="text-gray" style="font-size: 0.85rem;">${escapeHTML(articulo.fecha)}</span>
              <h3 style="margin-top: 5px;">${escapeHTML(articulo.titulo)}</h3>
              <p class="text-gray" style="margin-bottom: 15px;">${escapeHTML(articulo.extracto)}</p>
              <a href="contacto.html" class="text-green read-more">Saber más &rarr;</a>
            `;
            blogContainer.appendChild(card);
          });
        }
      })
      .catch(err => console.warn('Aviso: Carga de blog estática de respaldo activa.', err));
  }

  // --- 5. ENVÍO SEGURO DEL FORMULARIO DE CONTACTO (contacto.html) ---
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
          } else {
            alert('¡Muchas gracias! Tu cotización ha sido registrada con éxito.');
          }
        } else {
          alert('Hubo un inconveniente: ' + (result.message || 'Intente nuevamente.'));
        }
      } catch (error) {
        console.error('Error al enviar cotización:', error);
        alert('Mensaje enviado. Si requieres atención inmediata, contáctanos directo al WhatsApp +56 9 7199 5226.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = textoOriginal;
        }
      }
    });
  }
});
