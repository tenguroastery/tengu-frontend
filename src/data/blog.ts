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
    slug: 'cafe-para-espresso-en-casa',
    title: 'Café para espresso en casa: 5 opciones que funcionan',
    excerpt:
      'No todo café "tostado oscuro" es bueno para espresso. Qué buscar en el grano para sacar un shot decente desde tu máquina.',
    metaDescription:
      'Los mejores cafés para preparar espresso en casa: perfiles, cuerpo y dulzor. Selección Tengu Roastery con envío en Chile.',
    cover: '/uploads/tengu-espresso-blend.jpg',
    publishedAt: '2026-05-17',
    readingMinutes: 5,
    author: 'Equipo Tengu',
    tags: ['Espresso', 'Guía'],
    body: `## El problema del "café para espresso" en supermercado

Las bolsas con etiqueta "espresso" del super suelen ser café tostado muy oscuro para esconder defectos del grano. Cuando lo pasas por una máquina decente, te entrega una taza amarga, plana y con muy poco cuerpo. Café de especialidad para espresso es otra cosa.

## Qué buscar realmente

Para que un café funcione bien en espresso, miramos cinco cosas:

- **Frescura**: entre 7 y 21 días desde el tueste. Antes está muy gaseado (cuesta extraer). Después pierde dulzor.
- **Tueste medio o medio-oscuro**: lo justo para resaltar caramelos y cacao sin matar la dulzura natural del grano.
- **Cuerpo medio-alto**: te lo da el proceso lavado bien hecho, o un natural bien controlado.
- **Variedades comprobadas**: Caturra, Bourbon, Castillo, Catimor — funcionan especialmente bien a presión.
- **Single origin o blend**: depende. Un blend te da más cuerpo y consistencia; un single origin te da más complejidad pero puede ser más quisquilloso con la receta.

## Nuestras 5 recomendaciones

### 1. [Tengu Espresso Blend](/cafe/tengu-espresso-blend) — Perú
Cooperativa Pangoa, Caturra y Bourbon. Sedoso, chocolate, panela, frutos secos. Es nuestro blend más versátil — si recién armas tu cafetera espresso, empieza acá.

### 2. [Tengu Espresso Beam](/cafe/tengu-espresso-beam) — Colombia
Castillo + Caturra de Caldas. Más intenso que el Blend, con caramelo y chocolate amargo. Para quien quiere un shot más oscuro sin perder dulzor.

### 3. [Colombia Corazón](/cafe/colombia-corazon)
Tabi y Caturra de Risaralda. Es un café perfilado como filtrado, pero **funciona muy bien en espresso** porque tiene cuerpo y dulzor a nueces. Si te gustan los flat white o latte, este es excelente.

### 4. [Familia Zambrano](/cafe/familia-zambrano-colombia)
Proceso natural, Huila. Es más "experimental" — frutos amarillos y vainilla en taza. Recomendable si ya tienes la receta calibrada y quieres jugar con algo más frutal.

### 5. [Caldas Manzanares C.](/cafe/caldas-manzanares)
Limpio, balanceado, chocolate y caramelo. Si quieres una opción discreta pero correcta, este nunca falla.

## Receta básica para empezar

Calibra con esta receta y desde ahí ajustas:

- **Dosis**: 18 g de café
- **Yield**: 36 g de espresso (1:2)
- **Tiempo**: 25–30 segundos
- **Temperatura**: 92–94 °C
- **Molienda**: fina (más fina que sal de mesa, menos fina que talco)

Si te sale en menos de 22s o aguado: muele más fino. Si demora más de 35s o sale gota a gota: muele más grueso. Cambio de un solo "click" a la vez.

## Última recomendación

Si nunca probaste café fresco en tu máquina espresso, la diferencia con el super va a ser obvia desde el primer shot. La taza tendrá crema real, dulzor sin azúcar agregada y un final que dura. Esa es la promesa del café de especialidad.

Y si tienes dudas con tu máquina específica, [escríbenos por WhatsApp](https://wa.me/56950013366) — te ayudamos con la calibración.`,
  },
  {
    slug: 'cafe-para-v60',
    title: 'Café para V60: cómo elegir el grano correcto',
    excerpt:
      'El V60 te muestra todo del café — para bien y para mal. Qué buscar en el grano para sacarle el máximo provecho.',
    metaDescription:
      'Cómo elegir café para V60: acidez, tueste claro, notas brillantes. Receta básica y recomendaciones Tengu Roastery.',
    cover: '/uploads/rwanda-marie-gorette-natural.jpg',
    publishedAt: '2026-05-24',
    readingMinutes: 5,
    author: 'Equipo Tengu',
    tags: ['V60', 'Filtrado', 'Guía'],
    body: `## El V60 no perdona

A diferencia del espresso, donde la presión y la grasa del aceite "compensan" un café mediocre, el V60 te lo entrega todo limpio. Es la mejor cafetera para descubrir lo que un café realmente tiene — y también la peor para esconder defectos.

Por eso elegir bien el grano no es opcional acá: es donde más se nota.

## Qué hace bueno a un café para V60

Tres cosas:

- **Tueste claro o medio-claro**. Buscas resaltar acidez y notas frutales/florales, no quemar el azúcar del grano. Si el tueste se ve casi negro, ese café no es para V60.
- **Acidez bien expresada**. No nos referimos a algo ácido como un limón, sino a brillo en la taza: cítricos, frutas maduras, manzana, mandarina. Es lo que hace al café "complejo".
- **Procesamiento limpio**. Lavados o naturales bien controlados. Procesos sucios o sobre-fermentados se notan mucho en V60.

## Altitud importa

Más altura = café más denso, más complejo, más acidez. Para V60 buscamos cafés sobre 1.500 m.s.n.m. Idealmente 1.700+. Los cafés de Rwanda y Colombia que tenemos arrancan en 1.600.

## Nuestras 3 recomendaciones

### 1. [Marie Gorette — Rwanda Natural](/cafe/rwanda-natural)
1.600-2.100 m.s.n.m., Bourbon Rojo, natural anaeróbico. Es nuestro favorito para V60. Frutos rojos, mandarina, chocolate con leche. Café brillante y dulce a la vez.

### 2. [Marie Gorette — Rwanda Lavado](/cafe/rwanda-lavado)
Misma productora, proceso lavado. Más cítrico, más limpio. Durazno, flor de jamaica, pomelo. Si te gusta la acidez clara y los aromas florales, este.

### 3. [Familia Zambrano — Colombia](/cafe/familia-zambrano-colombia)
Variedad Colombia, proceso natural. Más dulce que ácido — frutos amarillos, chocolate, caramelo. Buena entrada al mundo del filtrado si vienes de espresso.

## Receta para empezar

- **Ratio**: 1:16 (15 g de café por 240 g de agua)
- **Molienda**: media (como sal de mesa gruesa)
- **Agua**: 92–94 °C (no hirviendo)
- **Tiempo total**: 3:00 minutos

[Receta paso a paso completa →](/metodos/v60)

## Tips honestos

- Si te sale aguado: muele más fino.
- Si te sale astringente o amargo: muele más grueso o baja la temperatura.
- Usa agua filtrada o embotellada. El agua de la llave chilena varía mucho y arruina cafés delicados.
- Apunta la receta. V60 es muy sensible a pequeños cambios — la consistencia viene de no improvisar.

## Conclusión

Si quieres descubrir lo que un café realmente tiene para ofrecer, V60 es el método. Empezar con un café honesto — fresco, de altura, bien procesado — hace toda la diferencia. La cafetera importa, pero el grano importa más.`,
  },
  {
    slug: 'mejor-cafe-en-grano-chile',
    title: 'Mejor café en grano de Chile: cómo comparar antes de comprar',
    excerpt:
      'No todos los "cafés gourmet" del super son iguales. 5 criterios reales para comparar antes de gastar tu plata.',
    metaDescription:
      'Cómo comparar café en grano honestamente: frescura, trazabilidad, precio por kilo, reseñas. Guía sin venderte humo.',
    cover: '/uploads/familia-zambrano-colombia.jpg',
    publishedAt: '2026-05-31',
    readingMinutes: 4,
    author: 'Equipo Tengu',
    tags: ['Guía', 'Comparativa'],
    body: `## El problema

Buscas "mejor café en grano Chile" en Google y te aparecen 30 opciones, todas diciendo "tueste premium", "selección especial", "grano gourmet". Cero información concreta para decidir.

Acá te dejamos los **5 criterios reales** que usamos en la industria para comparar café, ordenados por importancia:

## 1. Fecha de tueste impresa en la bolsa

Si no está impresa, no es café de especialidad. Punto.

El café se oxida desde que sale del tostador. Idealmente lo tomas entre los 7 y 30 días post-tueste. Después pierde aromas notablemente.

**Test rápido**: revisa la bolsa en el super. Si solo dice "consumir antes del [fecha 18 meses en el futuro]", ese café tiene meses encima.

## 2. Trazabilidad

¿Qué dice la bolsa sobre el café?

- **Genérico**: "100% arábica de las mejores tierras". → comercial, podría ser cualquier cosa.
- **País**: "Café de Colombia 100%". → mejor, pero aún muy amplio.
- **Región**: "Huila, Colombia". → ya estamos hablando.
- **Finca o productor**: "Finca Los Zambrano, Huila, Variedad Colombia, Proceso Natural". → café de especialidad real.

Cuanto más específica la información, más probable que sea café trabajado con cuidado.

## 3. Precio por kilo (no por bolsa)

Las bolsas de 250 g cuestan menos en términos absolutos pero más por kilo. Para comparar honestamente, mira siempre el precio/kg:

- Café industrial: ~$18.000–$22.000 / kg
- Café "gourmet" supermercado: ~$25.000–$35.000 / kg
- Café de especialidad real: ~$40.000–$80.000 / kg

Sí, el de especialidad es más caro. Pero un kilo te dura ~50 tazas, así que el costo por taza son $1.000–$1.500. Menos que pedir café en un local.

## 4. Cuerpo, acidez, notas de cata

Si en la bolsa solo dice "intenso" o "suave", están vendiendo emoción, no información.

Lo correcto es ver datos tipo:
- **Cuerpo**: ligero / medio / cremoso / pesado
- **Acidez**: cítrica / málica / brillante / suave
- **Notas**: chocolate, caramelo, mandarina, frutos rojos, etc.

Estos datos vienen de cata profesional. Si la marca los pone, está mostrando que sabe lo que vende.

## 5. Reseñas honestas

Buscar el café en Google + "review" o en foros. Una bolsa que no tiene NINGUNA reseña podría ser que recién salió, o que nadie la ha tomado en serio.

Nuestros productos tienen comentarios en Instagram (@tenguroastery) — léelos antes de comprar.

## Comparativa rápida

| Criterio | Café comercial | Café gourmet super | Café de especialidad real |
|----------|----------------|---------------------|---------------------------|
| Fecha tueste | ✗ | A veces | Siempre |
| Trazabilidad | ✗ | País | Finca + productor |
| Precio/kg | $18–22k | $25–35k | $40–80k |
| Cuerpo/acidez/notas | ✗ | A veces | Sí |
| Frescura al comprar | meses | semanas | días |

## En Tengu Roastery

Todos nuestros [8 cafés](/tienda) tienen:
- Fecha de tueste impresa en la bolsa
- Productor, finca, altitud, variedad y proceso visibles
- Notas de cata profesionales
- Precio/kg visible junto al precio total

Si después de leer un comparativo así sigues pensando "todos los cafés son iguales", lo entendemos. Pero recomendamos probar uno bueno antes de descartarlo. La diferencia se siente desde la primera taza.`,
  },
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
