<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import CabeceraPrincipal from '../../../components/cabeceraYpiePrincipal/CabeceraPrincipal.vue';
import PiePaginaPrincipal from '../../../components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import TarjetaPlato from '../../../components/componenteMenu/TarjetaPlato.vue';
import { obtenerReseniasPorPlato } from '../../../services/comentariosEndpoint';
import { obtenerMenu, obtenerCategorias } from '../../../services/menuEndpoint';
import { RightOutlined, LeftOutlined } from '@ant-design/icons-vue';

const categorias = ref([]);
const menu = ref(null);
const platoSeleccionado = ref(null);
const resenias = ref([]);
const cargandoResenias = ref(false);
const referenciasCarrusel = ref({});
const anchoVentana = ref(window.innerWidth);

const platosPorCategoria = computed(() => {
  if (!menu.value) return {};
  return menu.value.reduce((acumulador, plato) => {
    const categoria = plato.id_category ?? plato.id_menu_category;
    if (!acumulador[categoria]) acumulador[categoria] = [];
    acumulador[categoria].push(plato);
    return acumulador;
  }, {});
});

function dividirEnGrupos(arr, tamanio) {
  const grupos = [];
  for (let i = 0; i < arr.length; i += tamanio) {
    grupos.push(arr.slice(i, i + tamanio));
  }
  return grupos;
}

function anterior(idCategoria) {
  referenciasCarrusel.value[idCategoria]?.prev();
}

const actualizarAncho = () => {
  anchoVentana.value = window.innerWidth;
};

const tarjetasPorSlide = computed(() => {
  if (anchoVentana.value < 640) return 1;
  if (anchoVentana.value < 1024) return 2;
  return 3;
});

function siguiente(idCategoria) {
  referenciasCarrusel.value[idCategoria]?.next();
}

async function seleccionarPlato(plato) {
  platoSeleccionado.value = plato;
  resenias.value = [];
  cargandoResenias.value = true;
  try {
    resenias.value = await obtenerReseniasPorPlato(plato.id);
  } catch (err) {
    console.error('Error cargando reseñas:', err);
  } finally {
    cargandoResenias.value = false;
  }
}

onMounted(() => {
  window.addEventListener('resize', actualizarAncho);

  Promise.all([obtenerCategorias(), obtenerMenu()])
    .then(([cats, datos]) => {
      categorias.value = cats;
      datos.forEach(plato => {
        plato.ingredients = plato.ingredients.split(',').map(i => i.trim());
      });
      menu.value = datos;
    })
    .catch(err => console.error('Error cargando menú:', err));
});

onUnmounted(() => {
  window.removeEventListener('resize', actualizarAncho);
});
</script>

<template>
  <CabeceraPrincipal />

  <a-layout class="contenedorMenu">
    <a-flex v-if="!menu" vertical align="center" justify="center">
      <a-spin size="large" />
      <a-typography-text type="secondary">Cargando Menú...</a-typography-text>
    </a-flex>

    <template v-else>
      <a-typography-title :level="1">Menú</a-typography-title>

      <div v-if="platoSeleccionado">
        <a-flex vertical gap="large">
          <a-flex>
            <a-button @click="platoSeleccionado = null">
              <LeftOutlined /> Volver
            </a-button>
          </a-flex>
          <a-flex justify="center">
            <TarjetaPlato :item="platoSeleccionado" />
          </a-flex>

          <div class="seccionResenias">
            <a-divider orientation="left">
              <a-typography-title :level="3">Opiniones</a-typography-title>
            </a-divider>

            <a-flex v-if="cargandoResenias" justify="center">
              <a-spin />
            </a-flex>

            <a-row v-else-if="resenias.length" :gutter="[0, 16]">
              <a-col :span="24" v-for="resenia in resenias" :key="resenia.id">
                <div class="tarjetaResenia">
                  <a-flex align="center" gap="small">
                    <div class="avatarResenia">
                      {{ resenia.first_name?.[0] }}
                    </div>
                    <div>
                      <a-typography-text strong>
                        {{ resenia.first_name }} {{ resenia.last_name }}
                      </a-typography-text>
                      <br />
                      <a-typography-text type="secondary">
                        {{ resenia.created_at ? new Date(resenia.created_at).toLocaleDateString('es-ES') : '' }}
                      </a-typography-text>
                    </div>
                  </a-flex>

                  <a-rate :value="resenia.puntuacion" disabled allow-half />

                  <hr class="divisorResenia" />

                  <a-typography-paragraph>
                    {{ resenia.descripcion }}
                  </a-typography-paragraph>
                </div>
              </a-col>
            </a-row>

            <a-empty v-else description="Este plato aún no tiene comentarios. ¡Sé el primero!" />
          </div>
        </a-flex>
      </div>

      <template v-else>
        <div v-for="categoria in categorias" :key="categoria.id" class="seccionMenu">
          <template v-if="platosPorCategoria[categoria.id]?.length">

            <a-divider orientation="left">
              <a-typography-title :level="3">{{ categoria.name }}</a-typography-title>
            </a-divider>

            <div class="envoltorioCarrusel">
              <button class="flechaCarrusel" @click="anterior(categoria.id)">
                <LeftOutlined />
              </button>

              <a-carousel :ref="el => { if (el) referenciasCarrusel[categoria.id] = el }" class="carruselMenu"
                :dots="false">
                <div v-for="(grupo, indiceGrupo) in dividirEnGrupos(platosPorCategoria[categoria.id], tarjetasPorSlide)"
                  :key="indiceGrupo">

                  <a-flex gap="middle" align="stretch" :style="{ padding: '10px 5px 30px' }">
                    <a-card v-for="(plato, indicePlato) in grupo" :key="indicePlato" hoverable
                      :style="{ width: `${100 / tarjetasPorSlide}%`, display: 'flex', flexDirection: 'column' }"
                      @click="seleccionarPlato(plato)">
                      <template #cover>
                        <img :alt="plato.name" :src="'images/plates/' + plato.img_src" class="imagenTarjeta" />
                      </template>

                      <div class="cuerpoTarjeta" :style="{ flex: 1, display: 'flex', flexDirection: 'column' }">
                        <a-typography-title :level="5" class="tituloTarjeta">
                          {{ plato.name }}
                        </a-typography-title>
                        <a-typography-paragraph type="secondary" class="descripcionTarjeta">
                          {{ plato.description }}
                        </a-typography-paragraph>

                        <div :style="{ marginTop: 'auto' }">
                          <a-typography-text strong size="small">Ingredientes:</a-typography-text>
                          <div class="ingredientesTarjeta">
                            <a-tag v-for="ing in plato.ingredients" :key="ing" class="etiquetaIngrediente">{{ ing
                            }}</a-tag>
                          </div>
                          <a-typography-text strong class="precioTarjeta">
                            {{ plato.price }} €
                          </a-typography-text>
                        </div>
                      </div>
                    </a-card>
                  </a-flex>

                </div>
              </a-carousel>

              <button class="flechaCarrusel" @click="siguiente(categoria.id)">
                <RightOutlined />
              </button>
            </div>
          </template>
        </div>
      </template>
    </template>
  </a-layout>

  <PiePaginaPrincipal />
</template>

<style>
.contenedorMenu {
  padding: 100px 48px 80px;
  min-height: 100vh;
}

.seccionMenu {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.envoltorioCarrusel {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.carruselMenu {
  flex: 1;
  min-width: 0;
}

.flechaCarrusel {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid grey;
  background: white;
  font-size: 1.6rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 20px;
}

.imagenTarjeta {
  width: 100%;
  height: 190px;
  object-fit: cover;
  display: block;
}

.cuerpoTarjeta {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-fondo-blanco);
  flex: 1;
}

.tituloTarjeta {
  margin: 0 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.descripcionTarjeta {
  font-size: 0.83rem !important;
  margin: 0 !important;
  line-height: 1.45 !important;
}

.ingredientesTarjeta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.etiquetaIngrediente {
  font-size: 0.72rem !important;
  border-radius: 999px !important;
  white-space: nowrap;
  margin: 0 !important;
}

.precioTarjeta {
  font-size: 1.1rem !important;
  margin-top: 4px;
  display: block;
}

.seccionResenias {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

.tarjetaResenia {
  background: var(--color-fondo-blanco);
  border-radius: 0 12px 12px 0;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatarResenia {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-fondo-naranja-suave);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
}

.divisorResenia {
  border: none;
  margin: 2px 0;
}
</style>