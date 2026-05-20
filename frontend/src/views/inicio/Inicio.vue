<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import CabeceraPrincipal from '../../components/cabeceraYpiePrincipal/CabeceraPrincipal.vue';
import PiePaginaPrincipal from '../../components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import Historia from '../../components/modales/Historia.vue';
import {getMenu} from '../../services/menuEndpoint';
import { message } from 'ant-design-vue';

const router = useRouter();
const modalVisible = ref(false);
const platosDestacados = ref([]);

onMounted(async () => {
  try {
      buscarPlatos();
    } catch (err) {
        message.error('Error al cargar la página');
    }
})

function irAReservas() {
  const token = localStorage.getItem('loginUserToken');
  if (token) {
    router.push('/reservas');
  } else {
    router.push('/iniciarSesion?redirect=/reservas');
  }
}

async function buscarPlatos() {
  try {
    const listaMenu = await getMenu();

    let listaYaSeleccionado = [];

    while(listaYaSeleccionado.length != 3){
        const elementoAleatorio = listaMenu[Math.floor(Math.random() * listaMenu.length)];
        
        if(!listaYaSeleccionado.includes(elementoAleatorio.id)){
          listaYaSeleccionado.push(elementoAleatorio.id);
        }
    };

    listaMenu.forEach(element => {
      if(listaYaSeleccionado.includes(element.id)){
        platosDestacados.value.push(element);
      }
    });
    console.log(platosDestacados.value);
    
    } catch (err) {
        message.error('Error al cargar la página');
    }
}

</script>

<template>
  <CabeceraPrincipal />
  <a-layout>
    <div id="eslogan">
      <div id="contenidoEslogan">
        <a-typography-title class="colorTxtImagen">Sabores Que Enamoran</a-typography-title>
        <a-typography-paragraph class="colorTxtImagen">
          Experiencia gastronómica de primer nivel en un ambiente refinado y acogedor.
        </a-typography-paragraph>
        <a-button type="primary" size="large" @click="irAReservas">
          Reserva Tu Mesa
        </a-button>
      </div>
    </div>

    <div id="sobreNosotros">
      <div class="subTitulo">
        <a-typography-title :level="2">Nuestra Historia</a-typography-title>
        <a-typography-text>Pasión por la Cocina Tradicional</a-typography-text>
      </div>
      <a-typography-paragraph>Desde 1995, hemos estado sirviendo los platos más exquisitos...</a-typography-paragraph>
      <a-typography-paragraph>Cada plato cuenta una historia...</a-typography-paragraph>
      <a-button type="default" @click="modalVisible = true">Conoce Más</a-button>
    </div>

    <div id="contenedorTarjetas">
      <div class="subTitulo">
        <a-typography-title :level="2">Platos destacados</a-typography-title>
        <a-typography-text>Lo mejor de nuestro servicio</a-typography-text>
      </div>

      <a-row justify="center" :gutter="0">

        <a-col :xs="22" :md="12" :lg="7" class="colTarjeta" v-for="plato in platosDestacados">
          <a-card class="tarjeta" hoverable>
            <div class="imagenTarjeta">
              <img :src="'/images/plates/'+plato.img_src" />
            </div>
            <div class="infoTarjeta">
              <h2>{{ plato.name }}</h2>
              <p>{{ plato.description }}</p>
              <span class="precioPlato">{{plato.price}}€</span>
            </div>
          </a-card>
        </a-col>

      </a-row>
    </div>
  </a-layout>
  <PiePaginaPrincipal />
  <Historia v-model:open="modalVisible" />
</template>

<style scoped>
#eslogan {
  margin-top: 80px;
  height: 700px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

}

.colorTxtImagen{
      color: var(--color-menu-texto) !important;
}

#eslogan::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url('/images/imagenPrincipalMenu.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(6px);
  z-index: 0;
}


#contenidoEslogan {
  width: 50%;
  text-align: center;
    position: relative;
  z-index: 1;
}

#sobreNosotros {
  padding: 80px 20px;
  text-align: center;
}

.subTitulo {
  font-size: 1.2rem;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 20px;
}

#sobreNosotros p {
  max-width: 700px;
  margin: 0 auto 15px auto;
  line-height: 1.6;
}

#sobreNosotros .cta-button {
  margin-top: 20px;
}

#platosDestacado {
  padding: 80px 20px;
}

#contenedorTarjetas {
  margin-bottom: 30px;
}

.tarjeta.ant-card {
  width: 500px;
  border-radius: 15px;
  overflow: hidden;
  text-align: center;

  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 1s ease;
}

.tarjeta .ant-card-body {
  padding: 0;
}

.tarjeta:hover {
  transform: translateY(-15px);
}

.imagenTarjeta img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.infoTarjeta {
  padding: 40px;
  text-align: center;
}

.infoTarjeta h2 {
  margin-bottom: 10px;
}

.infoTarjeta p {
  font-size: 0.9rem;
  color: var(--color-texto-secundario);
  margin-bottom: 15px;
}

.colTarjeta {
  display: flex;
  justify-content: center;
}

.precioPlato {
  font-weight: bold;
  color: var(--color-acento-marron);
  font-size: 1.1rem;
}

.ant-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}
</style>