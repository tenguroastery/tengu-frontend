import MethodPage from '../../components/MethodPage';

export default function Espresso() {
  return (
    <MethodPage
      slug="espresso"
      name="Espresso"
      shortName="Espresso"
      seoTitle="Café espresso en casa: cómo lograr buena extracción"
      seoDescription="Guía para preparar espresso casero. Ratio, molienda, presión y tiempo. Cómo elegir café para espresso y por qué la frescura importa."
      intro="El espresso es exigente: 25 segundos para que el café muestre todo lo que tiene. La buena noticia es que con tu máquina actual y el café correcto, puedes lograr un shot de cafetería en tu cocina. Lo más importante no es la máquina sino la frescura del grano y la molienda."
      params={{
        ratio: '1:2',
        grindSize: 'Fina',
        waterTemp: '90-94 °C',
        totalTime: '25-30 s',
      }}
      equipment={[
        'Máquina de espresso (semiautomática o automática)',
        'Molinillo de espresso (muelas, ajuste fino)',
        'Tamper del diámetro correcto (58 mm es estándar)',
        'Balanza pequeña con precisión 0.1 g',
        'Cronómetro (suele estar en la máquina o el celular)',
        '18-20 g de café para portafilter doble',
      ]}
      steps={[
        {
          title: 'Calienta la máquina',
          body: 'Enciéndela con al menos 15 minutos de anticipación. La máquina necesita estabilidad térmica. Deja el portafilter dentro del grupo para precalentar.',
        },
        {
          title: 'Muele al momento',
          body: 'Muele 18 g de café (para canasta doble) directamente sobre el portafilter. Café molido pierde aroma en minutos: nunca muelas con anticipación.',
        },
        {
          title: 'Distribución y tamping',
          body: 'Asegúrate de que el café esté nivelado. Tampea con presión firme y pareja (~15 kg) hasta que la superficie esté plana. La presión exacta importa menos que la consistencia.',
        },
        {
          time: '0-25 s',
          title: 'Extracción',
          body: 'Pon la balanza con la taza debajo, pulsa start, arranca el cronómetro. Apunta a obtener 36 g de espresso (2x el peso del café) en 25-30 segundos. El primer chorro debe aparecer entre los 8-12 segundos.',
        },
        {
          title: 'Lee el resultado',
          body: 'Si extrajo en menos de 22s o sale aguado: muele más fino. Si demoró más de 35s o sale gotita por gotita: muele más grueso. Ajusta de a pasos pequeños y prueba de nuevo.',
        },
      ]}
      tips={[
        'La molienda de espresso es muy sensible. Cambios de un solo "click" en el molinillo cambian el shot completo.',
        'El café para espresso quiere 7-21 días desde el tueste. Antes está muy gaseado, después pierde dulzor.',
        'Si tu shot está muy ácido: muele más fino o sube la temperatura. Muy amargo: muele más grueso o baja temperatura.',
        'Limpia el portafilter después de cada shot. Los aceites del café se acumulan y arruinan los siguientes.',
      ]}
      recommendedCategory="Espresso"
      recommendationCopy="Los blends Tengu Espresso Blend y Tengu Espresso Beam están perfilados para extracción a presión: cuerpo cremoso, dulzor a chocolate, retrogusto largo. Los cafés de filtrado pueden funcionar también, pero el resultado es más ácido y menos cremoso."
    />
  );
}
