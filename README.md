# Tengu Roastery — Frontend (Vite + React)

Tienda online de café de especialidad. SPA en React 18 con Vite, TypeScript estricto y Tailwind 3.

## Stack

- **Vite 6** + **React 18** + **TypeScript estricto**
- **Tailwind CSS 3** con paleta de marca
- **react-router-dom 6**
- **Zustand** (carrito) con persist en localStorage
- **Headless UI** para primitivos accesibles

## Quick start

```powershell
npm install
npm run dev    # http://localhost:5173
```

Necesita el backend corriendo en `http://localhost:8000` (proxy vía Vite). Ver [`tengu-backend`](https://github.com/Value-Data-Next-Gen/tengu-backend).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Servir el build |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm run format` | Prettier escribe |
| `npm run format:check` | Prettier verifica |

## Estructura

```
frontend/
├── src/
│   ├── main.tsx              ← Entrada + BrowserRouter
│   ├── App.tsx               ← Layout + Routes
│   ├── index.css             ← Tailwind directives + base
│   ├── routes/
│   │   ├── Home.tsx          ← Landing con storytelling
│   │   ├── Shop.tsx          ← Catálogo con filtros
│   │   ├── Product.tsx       ← Ficha de producto + JSON-LD
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx      ← Form + redirect a Webpay
│   │   ├── Thanks.tsx        ← Página post-pago
│   │   └── CheckoutError.tsx
│   ├── components/
│   │   ├── Header.tsx        ← Sticky con logo + nav + IG
│   │   ├── Footer.tsx        ← Newsletter + contacto
│   │   ├── ProductCard.tsx
│   │   ├── NewsletterForm.tsx
│   │   ├── NewsletterPopup.tsx
│   │   ├── SocialIcons.tsx   ← IG + WhatsApp + helpers
│   │   └── WhatsAppFab.tsx   ← FAB flotante
│   ├── store/
│   │   └── cart.ts           ← Zustand + persist
│   ├── lib/
│   │   ├── api.ts            ← Cliente fetch del backend
│   │   └── seo.ts            ← useSeo hook + JSON-LD helpers
│   └── types.ts
├── public/
│   ├── product-images/       ← 8 fotos de bolsas
│   ├── logo.png
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
└── index.html                ← Meta + OG + Twitter + JSON-LD Organization
```

## Convenciones

- **Componentes** PascalCase, archivos `.tsx`, default export
- **Hooks custom** prefijo `use`
- **Estilos** solo Tailwind, no CSS-in-JS
- **API** centralizada en `lib/api.ts`
- **State global** solo si lo amerita (carrito → Zustand). Sin Redux
- **Slugs** kebab-case, **CLP** enteros sin decimales

## Paleta de marca

```js
// tailwind.config.js — extend.colors.tengu
{
  ink: '#1F4E9C',      // primary — azul tinta
  mustard: '#C8842A',  // secondary — mostaza
  coral: '#E63946',    // accent / alert
  pink: '#E91E63',     // pink bourbon
  dark: '#0F0F0F',     // hero / footer bg
  cream: '#F5F1EA',    // body bg
}
```

Fonts:
- **Display**: Bungee (títulos)
- **Body**: Inter (cuerpo)

## Deploy — Netlify

El repo trae un [`netlify.toml`](./netlify.toml) listo. Pasos:

1. En Netlify: **Add new site > Import from Git** → conectar este repo (`Value-Data-Next-Gen/tengu-frontend`).
2. Netlify lee `netlify.toml`: `npm run build` + publish `dist/`.
3. **No** hace falta setear `VITE_API_BASE` — el `netlify.toml` proxia `/api/*` y `/uploads/*` al backend Render (`tengu-backend.onrender.com`). Si renombras el servicio en Render, edita el host en `netlify.toml` y commitea.
4. Para analytics, setear opcionalmente `VITE_GA4_ID` o `VITE_GTM_ID` en la UI de Netlify.

> El archivo `vercel.json` queda en el repo por compatibilidad si después quieres deployar en Vercel — Netlify lo ignora.

## License

MIT — ver [LICENSE](LICENSE).
