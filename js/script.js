document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica para el menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 2. Lógica para cargar el Catálogo Dinámico
    const catalogoContainer = document.getElementById('catalogo-container');
    
    if (catalogoContainer) {
        fetch('data/productos.json')
            .then(response => response.json())
            .then(productos => {
                catalogoContainer.innerHTML = ''; 
                
                productos.forEach(producto => {
                    // Convertimos el número a formato de dinero chileno ($)
                    const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(producto.precio.monto);

                    const card = `
                        <div class="product-card card-style">
                            <img src="${producto.imagen_url}" alt="${producto.nombre}">
                            <h3>${producto.nombre}</h3>
                            <p class="power text-green" style="font-weight: bold; font-size: 1.2rem;">${precioFormateado}</p>
                            <p class="desc">${producto.descripcion_corta}</p>
                            <a href="https://wa.me/56971995226?text=Hola,%20me%20interesa%20el%20${encodeURIComponent(producto.nombre)}" target="_blank" class="btn btn-secondary" style="margin-top: 15px;">Me interesa</a>
                        </div>
                    `;
                    catalogoContainer.innerHTML += card;
                });
            })
            .catch(error => {
                console.error('Error:', error);
                catalogoContainer.innerHTML = '<p>Error al cargar el catálogo.</p>';
            });
    }
});
