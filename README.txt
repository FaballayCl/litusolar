# lituSolar - Proyecto Web Estático

Este es el repositorio completo para el sitio corporativo estático de **lituSolar**. Diseñado para ser moderno, responsivo y completamente funcional utilizando únicamente tecnologías frontend (HTML5, CSS3, JavaScript), sin necesidad de backend o base de datos.

## Estructura del Proyecto

* `/`: Archivos HTML principales (index.html, nosotros.html, etc.).
* `/css`: Estilos globales y responsivos (`styles.css`).
* `/js`: Lógica del sitio (`script.js`).
* `/data`: Archivos JSON con los datos dinámicos (`productos.json`, `blog.json`).
* `/images`: Carpeta para imágenes (logo, productos, etc.).

## Instalación y Ejecución Local

No requiere instalación de dependencias. Para visualizar el sitio en local:

1. Clona o descarga este repositorio.
2. Abre el archivo `index.html` en tu navegador web.

Alternativamente, para un desarrollo óptimo (carga de JSON), se recomienda usar una extensión como `Live Server` en VS Code para ejecutar un servidor local.

## Cómo Actualizar Contenido

### 1. Agregar Nuevos Productos

Para agregar un producto al catálogo, edita el archivo `data/productos.json`. Agrega un nuevo objeto al array con la siguiente estructura:

```json
[
    {
        "id": [ID UNICO],
        "nombre": "[NOMBRE]",
        "potencia": "[POTENCIA]",
        "descripcion": "[DESCRIPCION]",
        "imagen": "[NOMBRE_IMAGEN.png]"
    },
    ...
]