import Breadcrumbs from '../../components/Breadcrumbs';
import { useSeo } from '../../lib/seo';

export default function Terms() {
  useSeo({
    title: 'Términos y condiciones',
    description: 'Términos y condiciones de venta de Tengu Roastery — café de especialidad. Conforme a la Ley del Consumidor de Chile.',
    canonical: '/terminos',
  });

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Términos' }]} />
      <h1 className="mt-6 font-display text-3xl">Términos y condiciones</h1>
      <p className="mt-2 text-xs text-tengu-dark/60">Última actualización: mayo 2026</p>

      <section className="prose prose-sm mt-8 max-w-none text-tengu-dark/80">
        <h2 className="font-display text-xl text-tengu-dark">Vendedor</h2>
        <p>
          La venta es realizada por Tengu Roastery {'{{TODO: razón social}}'}, RUT {'{{TODO}}'},
          con domicilio en {'{{TODO}}'}, Chile.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Precios y pago</h2>
        <p>
          Todos los precios están expresados en pesos chilenos (CLP) con IVA incluido. Los medios
          de pago aceptados son Webpay (Transbank), Mercado Pago y Khipu.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Despacho</h2>
        <ul>
          <li>Región Metropolitana: 2 a 3 días hábiles.</li>
          <li>Resto de Chile: 3 a 7 días hábiles.</li>
          <li>Retiro en local: coordinamos por WhatsApp.</li>
        </ul>

        <h2 className="font-display text-xl text-tengu-dark">Garantía y devoluciones</h2>
        <p>
          Conforme a la Ley 19.496 de Protección al Consumidor, tienes 10 días corridos desde la
          recepción para ejercer el derecho de retracto si la compra fue realizada a distancia,
          siempre que el producto no haya sido abierto. El reembolso se procesa por la misma vía
          de pago en hasta 14 días.
        </p>
        <p>
          Si recibes un producto en mal estado o no conforme a lo ofrecido, escríbenos a{' '}
          <a href="mailto:hola@tenguroastery.cl">hola@tenguroastery.cl</a> y lo solucionamos.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Frescura del producto</h2>
        <p>
          El café tiene fecha de tueste impresa en cada bolsa. Te recomendamos consumirlo dentro
          de los 60 días siguientes para experiencia óptima.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Propiedad intelectual</h2>
        <p>
          La marca, logos, fotografías y contenido del sitio son propiedad de Tengu Roastery y
          están protegidos por la Ley 17.336 de Propiedad Intelectual.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Cambios en estos términos</h2>
        <p>
          Podemos actualizar estos términos. La versión vigente es la publicada en este sitio.
        </p>
      </section>
    </article>
  );
}
