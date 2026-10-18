# Pollería · Catálogo e Inventario (Frontend)

SPA en **React 18 + Vite 5 + Tailwind CSS 3** con visor 3D (**@react-three/fiber + @react-three/drei**) que consume la API REST:

`https://polleria-api-2itc.onrender.com`

## Funcionalidades

- **Catálogos dinámicos** — `GET /api/v1/catalogos` llena los selectores de Medida (`id_medida`), Tipo de producto (`id_tipo_producto`) y Sucursal (`id_polleria`).
- **Registro de productos** — `POST /api/v1/products` con validación en cliente; al registrar limpia el formulario, refresca el listado y muestra un toast. Los errores 422 de FastAPI se muestran campo por campo.
- **Catálogo** — `GET /api/v1/products` en tabla o tarjetas, con búsqueda, filtro por categoría e indicador de stock.
- **Plato Estrella 3D** — modelo geométrico (plato, presas, papas, ensalada, ají) con `OrbitControls`, auto-rotación, hover y clic para pausar. Se carga de forma diferida (lazy) para no penalizar la carga inicial.

## Desarrollo

```bash
npm install
cp .env.example .env   # opcional
npm run dev            # http://localhost:5173
npm run build          # genera dist/
npm run preview
```

## Variables de entorno

| Variable       | Default                                   |
| -------------- | ----------------------------------------- |
| `VITE_API_URL` | `https://polleria-api-2itc.onrender.com`  |

Se usa en `src/api/client.js`: `import.meta.env.VITE_API_URL || 'https://polleria-api-2itc.onrender.com'`.

## Despliegue en Vercel

1. Sube este proyecto a GitHub e impórtalo en Vercel (detecta Vite automáticamente; `vercel.json` ya define build `npm run build` y salida `dist`, más el rewrite SPA).
2. (Opcional) En *Settings → Environment Variables* define `VITE_API_URL`.
3. Deploy. También puedes usar la CLI: `npx vercel --prod`.

> La API en Render (plan free) puede tardar ~50 s en responder si estaba dormida; la UI muestra estados de carga y permite reintentar.

## Estructura

```
src/
  api/client.js              # fetch + manejo de errores + VITE_API_URL
  hooks/useAsync.js          # carga/recarga de datos
  components/
    Header.jsx
    ProductForm.jsx          # formulario + validación
    ProductList.jsx          # tabla / tarjetas
    PlatoEstrella3D.jsx      # visor 3D (R3F + drei)
    Toast.jsx                # notificaciones
    Spinner.jsx
  App.jsx
  main.jsx
```
