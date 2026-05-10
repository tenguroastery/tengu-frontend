export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** Imagen de cover root-relative, ej "/uploads/colombia-corazon.jpg" */
  cover: string;
  publishedAt: string; // ISO
  readingMinutes: number;
  author: string;
  tags: string[];
  /** Cuerpo en Markdown */
  body: string;
  /** SEO meta description (≤155ch) */
  metaDescription: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'como-elegir-cafe-de-especialidad-chile',
    title: 'Cómo elegir café de especialidad en Chile',
    excerpt:
      'Una guía honesta para no perderte entre marcas. Frescura, origen, tueste y método: lo que sí importa al elegir tu próxima bolsa.',
    metaDescription:
      'Guía 2026 para elegir café de especialidad en Chile: origen, tueste, frescura y métodos. Sin marketing, con criterios reales.',
    cover: '/uploads/rwanda-marie-gorette-natural.jpg',
    publishedAt: '2026-05-10',
    readingMinutes: 6,
    author: 'Equipo Tengu',
    tags: ['Guía', 'Para empezar'],
    body: `## ¿Qué es realmente un café de "especialidad"?

En Chile la palabra se usa con bastante libertad. Técnicamente, un café de especialidad es uno que obtuvo **84 puntos o más** en una cata profesional bajo el sistema de la Specialty Coffee Association (SCA). Pero más importante que el puntaje: viene de un productor identificado, una variedad específica y un proceso conocido.

Si la bolsa que compras dice "100% arábica" pero no menciona nada más — ni finca, ni proceso, ni cosecha — probablemente no es café de especialidad. Es café comercial bien empaquetado.

## Cómo leer una bolsa de café

Una bolsa decente debe darte:

- **Origen específico**: país + región + finca o cooperativa.
- **Variedad**: Bourbon, Caturra, Castillo, Tabi, Typica, etc.
- **Proceso**: Lavado, Natural, Honey, Anaeróbico.
- **Altitud**: importa porque a más altura, café más complejo.
- **Cosecha**: el año cuenta. Café del 2023 ya está cansado.
- **Fecha de tueste**: la más importante. Veremos por qué.

## Tueste fresco: por qué importa

El café tostado **se oxida**. Eso pasa siempre, aunque la bolsa tenga válvula. La curva de sabor:

- **0-5 días**: muy gaseado, cuesta extraer bien.
- **5-21 días**: ventana ideal. Sabor pleno, dulzor activo.
- **21-45 días**: empieza a perder aromáticos.
- **+45 días**: notable degradación. Tomable pero plano.

Por eso te recomendamos comprar café que diga la fecha de tueste en la bolsa. Si no la dice, asume que tiene meses.

## Origen vs blend: ¿cuál elegir?

Un **single origin** te muestra el carácter de un lugar: el frutos rojos brillante de Rwanda, el chocolate denso de Colombia, la cítrica de Perú. Es café para entender de dónde viene tu taza.

Un **blend** combina dos o más cafés buscando un balance. Bien hecho, un blend tiene **más cuerpo y consistencia que cualquier single origin**. Mal hecho, es solo café revuelto.

Recomendación práctica:
- Si vas a hacer **filtrado** (V60, AeroPress, Chemex): compra single origin.
- Si vas a hacer **espresso**: arranca con un blend bien perfilado, después prueba single origins espresso.

## Cómo guardarlo

Cuatro enemigos del café: oxígeno, luz, humedad, calor. La bolsa con válvula que viene de fábrica ya es buen empaque. Solo guárdala:

- Cerrada (apretando el aire antes de cerrar).
- En lugar fresco y oscuro (no encima del refrigerador, no al sol).
- **No** en el freezer (humedad mata el aroma cuando lo sacas).

Si tienes un frasco hermético opaco, mejor. Pero la bolsa original sirve.

## Empieza simple

Si nunca probaste café de especialidad, te sugerimos partir por un **filtrado lavado** — es el perfil más limpio para apreciar las diferencias. Nuestros [Marie Gorette Rwanda](/cafe/rwanda-natural) o [Familia Zambrano Colombia](/cafe/familia-zambrano-colombia) son buenas primeras tazas.

Si ya tomas espresso en casa, prueba el [Tengu Espresso Beam](/cafe/tengu-espresso-beam): chocolate amargo, frutos secos, cuerpo medio-alto.

¿Dudas? Escríbenos por WhatsApp y te recomendamos según tu cafetera.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function listPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
