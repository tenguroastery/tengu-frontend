import Breadcrumbs from '../../components/Breadcrumbs';
import { useSeo } from '../../lib/seo';

export default function Privacy() {
  useSeo({
    title: 'Política de privacidad',
    description: 'Política de privacidad de Tengu Roastery y tratamiento de datos personales conforme a la Ley 19.628 de Chile.',
    canonical: '/privacidad',
  });

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Privacidad' }]} />
      <h1 className="mt-6 font-display text-3xl">Política de privacidad</h1>
      <p className="mt-2 text-xs text-tengu-dark/60">Última actualización: mayo 2026</p>

      <section className="prose prose-sm mt-8 max-w-none text-tengu-dark/80">
        <h2 className="font-display text-xl text-tengu-dark">Quién recopila tus datos</h2>
        <p>
          Tengu Roastery {'{{TODO: razón social}}'}, RUT {'{{TODO}}'}, con domicilio en {'{{TODO}}'},
          es responsable del tratamiento de tus datos personales bajo la Ley 19.628 de Protección
          de la Vida Privada de Chile.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Qué datos recopilamos</h2>
        <ul>
          <li>Datos de contacto: nombre, email, teléfono, RUT (necesarios para emitir boleta).</li>
          <li>Dirección de despacho cuando compras.</li>
          <li>Datos de navegación (IP, páginas vistas) si aceptas cookies de analítica.</li>
        </ul>

        <h2 className="font-display text-xl text-tengu-dark">Para qué los usamos</h2>
        <ul>
          <li>Procesar y despachar tu pedido.</li>
          <li>Enviar comunicaciones de marketing si te suscribiste al newsletter (puedes
            desuscribirte en cualquier momento).</li>
          <li>Mejorar el sitio mediante analítica anónima.</li>
        </ul>

        <h2 className="font-display text-xl text-tengu-dark">Cookies</h2>
        <p>
          Usamos cookies propias para mantener tu sesión y carrito, y cookies de Google Analytics
          (solo si aceptas). Puedes rechazar las cookies de analítica en el banner de la primera
          visita.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Tus derechos</h2>
        <p>
          Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos.
          Para ejercer estos derechos escríbenos a <a href="mailto:hola@tenguroastery.cl">hola@tenguroastery.cl</a>.
        </p>

        <h2 className="font-display text-xl text-tengu-dark">Pasarela de pago</h2>
        <p>
          No almacenamos datos de tarjetas. El pago se procesa directamente en Webpay
          (Transbank), Mercado Pago o Khipu, según el método elegido.
        </p>
      </section>
    </article>
  );
}
