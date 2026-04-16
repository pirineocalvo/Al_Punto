<script setup>
import './Historia.css';

defineProps({
  open: Boolean,
});

defineEmits(['update:open']);
</script>

<template>
  <a-modal
    :open="open"
    title="Nuestra Historia"
    :footer="null"
    width="80%"
    @cancel="$emit('update:open', false)"
  >
    <div class="historia-contenido">
      <img
        src="../../../public/images/cocinero-antiguo.jpg"
        alt="cocineor-antiguo"
        class="historia-imagen"
      />
      <a-typography-paragraph>
        Fundado en 1995 por la familia Martínez, nuestro restaurante nació de una pasión
        profunda por la cocina tradicional española. Lo que comenzó como un pequeño local
        en el corazón de la ciudad, se ha convertido con los años en un referente
        gastronómico de la región, reconocido por críticos y comensales por igual.
      </a-typography-paragraph>
      <a-typography-paragraph>
        Desde el primer día, nuestra filosofía ha sido clara: utilizar únicamente
        productos de temporada y de proximidad, trabajando mano a mano con agricultores,
        ganaderos y pescadores de la zona. Creemos firmemente que la calidad de un plato
        comienza mucho antes de llegar a la cocina.
      </a-typography-paragraph>
      <a-typography-paragraph>
        Cada plato que servimos cuenta una historia: la de los agricultores locales que
        cultivan nuestros ingredientes, la de las recetas heredadas de generación en
        generación y la del equipo de cocina que cada día pone su alma en cada elaboración.
        Nuestro chef, formado en las mejores escuelas de Europa, regresó a sus raíces
        para rendir homenaje a la cocina de su abuela con técnicas de vanguardia.
      </a-typography-paragraph>
      <a-typography-paragraph>
        Creemos que comer bien es mucho más que alimentarse. Es un momento para compartir,
        para disfrutar y para conectar con nuestras raíces. Por eso cuidamos cada detalle,
        desde la selección de los productos hasta el ambiente cálido y acogedor que nos
        define. Nuestro salón, decorado con materiales naturales y piezas artesanales,
        invita a ralentizar el ritmo y saborear cada instante.
      </a-typography-paragraph>
      <a-typography-paragraph>
        Nuestra carta cambia con las estaciones, fiel al ritmo de la naturaleza y al
        calendario del mercado. En primavera, los espárragos trigueros y las alcachofas
        protagonizan nuestros entrantes; en verano, los tomates de colgar y los pimientos
        asados llenan de color cada plato; en otoño, las setas y la caza menor nos
        transportan al bosque; y en invierno, los guisos de cuchara y los asados lentos
        reconfortan el alma de quien nos visita.
      </a-typography-paragraph>
      <a-typography-paragraph>
        El equipo que da vida a este proyecto es, sin duda, nuestro mayor orgullo. Contamos
        con más de veinte profesionales apasionados, muchos de ellos formados aquí desde
        cero, que cada día llegan con la misma energía y dedicación. La cocina es un lugar
        de aprendizaje constante, de respeto y de creatividad, y así lo transmitimos también
        en sala, donde cada comensal recibe una atención personalizada y cercana.
      </a-typography-paragraph>
      <img
        src="../../../public/images/cocinero-moderno.jpg"
        alt="cocinero-moderno"
        class="historia-imagen-secundaria"
      />
      <a-typography-paragraph>
        A lo largo de los años hemos tenido el honor de recibir numerosos reconocimientos,
        entre ellos tres nominaciones consecutivas al premio de mejor restaurante tradicional
        de la comunidad. Pero el galardón que más nos enorgullece es la fidelidad de
        nuestros clientes, muchos de los cuales llevan décadas sentándose en estas mismas mesas.
      </a-typography-paragraph>
      <a-typography-paragraph>
        Nuestro compromiso con la sostenibilidad va más allá de la cocina. Hemos reducido
        el desperdicio alimentario en un 60% en los últimos tres años, trabajamos con
        envases biodegradables y colaboramos con bancos de alimentos locales para que
        ningún excedente acabe en la basura. Creemos que un restaurante responsable
        también cuida del entorno que lo rodea.
      </a-typography-paragraph>
      <a-typography-paragraph>
        Treinta años después, seguimos fieles a nuestra esencia: cocina honesta, producto
        de calidad y un trato cercano que hace que nuestros clientes se sientan como en casa.
        El camino continúa, y lo hacemos con la misma ilusión y humildad del primer día.
      </a-typography-paragraph>
    </div>
  </a-modal>
</template>