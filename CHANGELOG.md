# Changelog

## [0.1.0] — 2026-05-10

### Added
- Setup Vite 6 + React 18 + TypeScript estricto + Tailwind 3
- Páginas: Home (storytelling), Shop (filtros), Product (JSON-LD), Cart, Checkout, Thanks, CheckoutError
- Carrito con Zustand + persist localStorage (key versionada `tengu-cart-v1`)
- Newsletter popup (delay 8s, dismiss persiste)
- WhatsApp FAB + íconos sociales (IG + WhatsApp) en header/footer
- SEO: meta tags + OG + Twitter en `index.html`, hook `useSeo` por ruta, JSON-LD Organization + Product, robots.txt, sitemap.xml
- Integración con Webpay sandbox vía form-redirect

### Tooling
- ESLint + Prettier + EditorConfig
- Type-check con `tsc --noEmit`
