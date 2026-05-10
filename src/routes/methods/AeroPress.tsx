import MethodPage from '../../components/MethodPage';

export default function AeroPress() {
  return (
    <MethodPage
      slug="aeropress"
      name="AeroPress"
      shortName="AeroPress"
      seoTitle="Café AeroPress: receta clásica e invertida"
      seoDescription="Cómo preparar café AeroPress en casa. Receta clásica e invertida con ratio, molienda y tiempo. Versátil entre filtrado y espresso."
      intro="La AeroPress es la cafetera más versátil que existe: rápida, robusta, viaja bien, y se puede preparar en estilo filtrado limpio o tipo espresso concentrado. Es nuestra recomendación si no quieres comprar más de un equipo y quieres tomar buen café desde la primera vez."
      params={{
        ratio: '1:14',
        grindSize: 'Media-fina',
        waterTemp: '85-90 °C',
        totalTime: '1:30 min',
      }}
      equipment={[
        'AeroPress (original o Go)',
        'Filtros de papel AeroPress',
        'Tetera o hervidor de agua',
        'Balanza con cronómetro',
        'Molinillo de muelas',
        '14-17 g de café',
      ]}
      steps={[
        {
          time: '0:00',
          title: 'Posición invertida y enjuague',
          body: 'Pon la AeroPress invertida (cilindro hacia arriba). Coloca el filtro en la tapa por separado y enjuágalo con agua caliente sobre la taza para precalentar y eliminar el sabor a papel.',
        },
        {
          time: '0:00',
          title: 'Café y agua',
          body: 'Pesa 15 g de café molido medio-fino (más fino que V60, más grueso que espresso). Vierte en la AeroPress invertida. Agrega 50 g de agua a 87 °C. Revuelve 5 veces.',
        },
        {
          time: '0:30',
          title: 'Llena hasta 220 g',
          body: 'A los 30 segundos, completa con agua hasta llegar a 220 g totales. Pon la tapa con el filtro mojado y atornilla.',
        },
        {
          time: '1:00',
          title: 'Da vuelta y prensa',
          body: 'Al minuto, da vuelta la AeroPress sobre la taza con cuidado. Presiona suavemente hasta sentir resistencia y oír el "hiss". Total: ~30 segundos de prensado.',
        },
        {
          time: '1:30',
          title: 'Listo',
          body: 'Saca la AeroPress y disfruta. Si quieres tipo americano, agrega agua caliente al gusto. Para flat white: agrega leche vaporizada.',
        },
      ]}
      tips={[
        'La posición invertida da más control que la regular: el café no empieza a colarse hasta que tú decides.',
        'Si te gusta más concentrado, usa 1:10 (15 g café, 150 g agua).',
        'Para principiantes: prueba la "Receta del Campeonato Mundial 2018" → 35 g café, 200 g agua, molienda media-fina, 80 °C.',
        'La AeroPress permite mucha experimentación. Cambia un solo parámetro a la vez para entender qué hace cada uno.',
      ]}
      recommendedCategory="Filtrado"
      recommendationCopy="La AeroPress brilla con cafés de notas frutales y florales (Rwanda Natural, Pink Bourbon) pero también acepta los más chocolatosos (Caldas Manzanares, Familia Zambrano). Su versatilidad la hace ideal si tienes solo 1-2 cafés en casa."
    />
  );
}
