import MethodPage from '../../components/MethodPage';

export default function V60() {
  return (
    <MethodPage
      slug="v60"
      name="Hario V60"
      shortName="V60"
      seoTitle="Café V60 paso a paso para preparar en casa"
      seoDescription="Receta de pour over V60 con ratio, molienda, temperatura y tiempo. Guía simple para hacer café de filtrado en casa con resultado de cafetería."
      intro="El V60 es la forma más limpia y aromática de tomar café de filtrado en casa. Con un ratio bien medido y una molienda media, vas a sacar todas las notas que el productor trabajó: cítricos, frutos rojos, chocolate. La curva de aprendizaje es corta — en 3 tazas vas a tomar el café V60 que más has disfrutado."
      params={{
        ratio: '1:16',
        grindSize: 'Media',
        waterTemp: '92-94 °C',
        totalTime: '3:00 min',
      }}
      equipment={[
        'Dripper Hario V60 (plástico, cerámica o vidrio)',
        'Filtros de papel V60',
        'Tetera cuello de cisne (gooseneck)',
        'Balanza con cronómetro',
        'Molinillo (idealmente de muelas, no de cuchillas)',
        '15-20 g de café (rinde 1-2 tazas)',
      ]}
      steps={[
        {
          time: '0:00',
          title: 'Calienta y enjuaga el filtro',
          body: 'Dobla el filtro por la línea sellada y ponlo en el dripper. Vierte agua caliente sobre el filtro hasta que escurra: limpia el sabor a papel y precalienta la taza/jarra. Bota esa agua.',
        },
        {
          time: '0:00',
          title: 'Pesa y muele',
          body: 'Pesa 15 g de café y muele a textura media (similar a sal de mesa gruesa). Pon el café molido sobre el filtro y dale un pequeño toque para nivelar.',
        },
        {
          time: '0:00 — 0:30',
          title: 'Bloom: 30 g de agua',
          body: 'Vierte 30 g de agua (el doble del peso del café) en círculos lentos desde el centro hacia afuera. Espera 30 segundos. Verás cómo el café "florece" — está liberando CO2.',
        },
        {
          time: '0:30 — 1:15',
          title: 'Primera vertida: hasta 120 g',
          body: 'Vierte agua en círculos suaves hasta llegar a 120 g totales. Demórate ~45 segundos. No mojes el filtro directamente, mantén el chorro en el café.',
        },
        {
          time: '1:15 — 2:00',
          title: 'Segunda vertida: hasta 240 g',
          body: 'Espera que baje el nivel de agua. Cuando ya casi no haya agua sobre el café, vierte hasta llegar a 240 g totales. Sigue moviendo en círculos.',
        },
        {
          time: '2:00 — 3:00',
          title: 'Drenado y servir',
          body: 'Deja que termine de drenar (~1 minuto más). Si demora más de 3:30 totales, la próxima vez muele un poco más grueso. Si baja en menos de 2:30, muele más fino.',
        },
      ]}
      tips={[
        'Si el café sabe ácido o aguado: muele más fino o usa más café.',
        'Si sabe amargo o astringente: muele más grueso o baja la temperatura del agua.',
        'Usa agua filtrada o embotellada — el agua de la llave puede arruinar un buen café.',
        'El café recién tostado (5-21 días) tiene mejor bloom y aroma. Mira la fecha en la bolsa.',
      ]}
      recommendedCategory="Filtrado"
      recommendationCopy="Para V60 funcionan especialmente bien los cafés naturales y lavados con perfil filtrado: notas brillantes, dulzor cristalino, cuerpo medio. Te recomendamos los cafés de Rwanda, Colombia Corazón o Familia Zambrano."
    />
  );
}
