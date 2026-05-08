<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AppHeader from '../../../Components/cabeceraYpiePrincipal/Header.vue';
import AppFooter from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import PlateCard from '../../../Components/componenteMenu/PlateCard.vue';
import { getMenu, getCategories, getReviewsByDish } from '../../../Services/api';

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
    resenias.value = await getReviewsByDish(plato.id);
  } catch (err) {
    console.error('Error cargando reseñas:', err);
  } finally {
    cargandoResenias.value = false;
  }
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

        <!-- Sección de reseñas -->
        <div class="reviews-section">
          <a-flex align="center" gap="middle" class="reviews-header">
            <a-typography-title :level="3" style="margin: 0 !important;">
              Comentarios
            </a-typography-title>
            <div class="menu-section-line" />
          </a-flex>

          <a-spin v-if="cargandoResenias" />

          <template v-else-if="resenias.length">
            <div v-for="resenia in resenias" :key="resenia.id" class="review-card">
              <a-flex justify="space-between" align="center">
                <a-typography-text strong>
                  {{ resenia.first_name }} {{ resenia.last_name }}
                </a-typography-text>
                <a-rate :value="resenia.puntuacion" disabled allow-half />
              </a-flex>
              <a-typography-paragraph class="review-text">
                {{ resenia.descripcion }}
              </a-typography-paragraph>
              <a-typography-text type="secondary" class="review-date">
                {{ resenia.created_at ? new Date(resenia.created_at).toLocaleDateString('es-ES') : '' }}
              </a-typography-text>
            </div>
          </template>

          <a-empty v-else description="Este plato aún no tiene comentarios" />
        </div>
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
                <div
                  v-for="(grupo, indiceGrupo) in dividirEnGrupos(platosPorCategoria[categoria.id], tarjetasPorSlide)"
                  :key="indiceGrupo"
                  class="carousel-slide"
                >
                  <div
                    v-for="(plato, indicePlato) in grupo"
                    :key="indicePlato"
                    class="carousel-card"
                    :style="{ width: `${100 / tarjetasPorSlide}%` }"
                    @click="seleccionarPlato(plato)"
                  >
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
                        <a-tag
                          v-for="(ingrediente, indiceIngrediente) in plato.ingredients"
                          :key="indiceIngrediente"
                          class="ingredient-tag"
                        >{{ ingrediente }}</a-tag>
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

<style>
.menuContainer {
  padding: 100px 48px 80px;
  min-height: 100vh;
}

.menu-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--color-primary) 0%, transparent 100%);
  opacity: 0.35;
}

.carousel-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.menu-carousel {
  flex: 1;
  min-width: 0;
}

.carousel-slide {
  display: flex !important;
  gap: 20px;
  padding: 4px 2px 24px;
}

.carousel-card {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  background: transparent;
  min-width: 0;
}

.carousel-arrow {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-sutil);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1.6rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  padding: 0;
  margin-bottom: 20px;
}

.card-img-wrapper {
  width: 100%;
  height: 190px;
  overflow: hidden;
  background: var(--bg-secondary);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
  border: 1px solid var(--border-sutil);
  border-bottom: none;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.card-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.carousel-card:hover .card-img-wrapper img {
  transform: scale(1.05);
}

.carousel-card:hover .card-img-wrapper {
  border-color: var(--color-primary);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
}

.card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--border-sutil);
  border-top: none;
  border-radius: 0 0 12px 12px;
  flex: 1;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.carousel-card:hover .card-body {
  border-color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-title {
  margin: 0 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary) !important;
}

.card-description {
  font-size: 0.83rem !important;
  margin: 0 !important;
  line-height: 1.45 !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ingredient-tag {
  font-size: 0.72rem !important;
  border-radius: 999px !important;
  background: var(--bg-secondary) !important;
  color: var(--text-secondary) !important;
  border-color: var(--border-sutil) !important;
  white-space: nowrap;
  margin: 0 !important;
}

.card-price {
  font-size: 1.1rem !important;
  color: var(--color-primary) !important;
  margin-top: 4px;
}

.plate-card-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reviews-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.reviews-header {
  margin-bottom: 4px;
}

.review-card {
  padding: 16px 20px;
  border: 1px solid var(--border-sutil);
  border-radius: 12px;
  background: var(--bg-card, #fff);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.2s;
}

.review-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.review-text {
  margin: 0 !important;
  color: var(--text-primary);
  line-height: 1.6 !important;
}

.review-date {
  font-size: 0.78rem !important;
}
</style>