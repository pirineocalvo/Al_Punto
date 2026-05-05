<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AppHeader from '../../../Components/cabeceraYpiePrincipal/Header.vue';
import AppFooter from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import PlateCard from '../../../Components/componenteMenu/PlateCard.vue';
import { getMenu, getCategories } from '../../../Services/api';
import './Menu.css';

const categorias = ref([]);
const menu = ref(null);
const platoSeleccionado = ref(null);
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

onMounted(() => {
  window.addEventListener('resize', actualizarAncho);

  Promise.all([getCategories(), getMenu()])
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
  <AppHeader />

  <a-layout class="menuContainer">

    <a-spin v-if="!menu" size="large">
      <template #tip>
        <a-typography-text type="secondary">Cargando Menú...</a-typography-text>
      </template>
    </a-spin>

    <template v-else>
      <a-typography-title :level="1">Menú</a-typography-title>
      <div v-if="platoSeleccionado" class="plate-card-container">
        <a-button @click="platoSeleccionado = null">← Volver</a-button>
        <PlateCard :item="platoSeleccionado" />
      </div>

      <template v-else>
        <div v-for="categoria in categorias" :key="categoria.id" class="menu-section">
          <template v-if="platosPorCategoria[categoria.id]?.length">

            <a-flex align="center" gap="middle">
              <a-typography-title :level="3">
                {{ categoria.name }}
              </a-typography-title>
              <div class="menu-section-line" />
            </a-flex>

            <div class="carousel-wrapper">
              <button class="carousel-arrow" @click="anterior(categoria.id)">‹</button>

              <a-carousel :ref="el => { if (el) referenciasCarrusel[categoria.id] = el }" class="menu-carousel">
                <div v-for="(grupo, indiceGrupo) in dividirEnGrupos(platosPorCategoria[categoria.id], tarjetasPorSlide)"
                  :key="indiceGrupo" class="carousel-slide">
                  <div v-for="(plato, indicePlato) in grupo" :key="indicePlato" class="carousel-card"  :style="{ width: `${100 / tarjetasPorSlide}%` }"
                    @click="platoSeleccionado = plato">
                    <div class="card-img-wrapper">
                      <img draggable="false" :alt="plato.name" :src="'images/plates/' + plato.img_src" />
                    </div>
                    <div class="card-body">
                      <a-typography-title :level="5" class="card-title">
                        {{ plato.name }}
                      </a-typography-title>
                      <a-typography-paragraph type="secondary" class="card-description">
                        {{ plato.description }}
                      </a-typography-paragraph>
                      <a-typography-title strong :level="5">
                        Ingredientes:
                      </a-typography-title>
                      <div class="card-ingredients">
                        <a-tag v-for="(ingrediente, indiceIngrediente) in plato.ingredients" :key="indiceIngrediente"
                          class="ingredient-tag">{{ ingrediente }}</a-tag>
                      </div>
                      <a-typography-text strong class="card-price">
                        {{ plato.price }} €
                      </a-typography-text>
                    </div>
                  </div>
                </div>
              </a-carousel>

              <button class="carousel-arrow" @click="siguiente(categoria.id)">›</button>
            </div>

          </template>
        </div>
      </template>
    </template>
  </a-layout>

  <AppFooter />
</template>