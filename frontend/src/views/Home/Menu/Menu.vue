<template>
  <AppHeader />
  <div class="menu-container">
    <h1 v-if="!menu" class="menu-loading">Cargando Menú...</h1>

    <template v-if="menu">
      <h1 class="menu-title">Menú</h1>

      <div v-if="viewPlate" class="plate-card-container">
        <button class="back-btn" @click="viewPlate = null">← Volver</button>
        <PlateCard :item="viewPlate" />
      </div>

      <template v-else>
        <section
          v-for="category in categories"
          :key="category.id"
          class="menu-section"
        >
          <template v-if="platesByCategory[category.id]?.length">

            <div class="menu-section-header">
              <h2 class="menu-section-title">{{ category.name }}</h2>
              <div class="menu-section-line" />
            </div>

            <div class="carousel-wrapper">
              <button
                class="carousel-arrow carousel-arrow--left"
                :disabled="currentPage[category.id] === 0"
                @click="slide(category.id, -1)"
              >‹</button>

              <div class="carousel-viewport" :ref="el => setViewportRef(el, category.id)">
                <div
                  class="carousel-track"
                  :style="{ transform: `translateX(-${currentPage[category.id] * getStep(category.id)}px)` }"
                >
                  <div
                    v-for="(item, index) in platesByCategory[category.id]"
                    :key="index"
                    class="carousel-card"
                    @click="viewPlate = item"
                  >
                    <div class="card-img-wrapper">
                      <img
                        draggable="false"
                        :alt="item.name"
                        :src="'images/plates/' + item.img_src"
                      />
                    </div>
                    <div class="card-body">
                      <h3 class="card-title">{{ item.name }}</h3>
                      <p class="card-description">{{ item.description }}</p>
                      <h6>Ingredientes: </h6>
                      <div class="card-ingredients">
                        <span
                          v-for="(ingredient, i) in item.ingredients"
                          :key="i"
                          class="ingredient-tag"
                        >{{ ingredient }}</span>
                      </div>
                      <p class="card-price">{{ item.price }} €</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                class="carousel-arrow carousel-arrow--right"
                :disabled="isLastPage(category.id)"
                @click="slide(category.id, 1)"
              >›</button>
            </div>

            <div class="carousel-dots">
              <span
                v-for="dot in pageCount(category.id)"
                :key="dot"
                class="carousel-dot"
                :class="{ active: currentPage[category.id] === dot - 1 }"
                @click="currentPage[category.id] = dot - 1"
              />
            </div>

          </template>
        </section>
      </template>
    </template>
  </div>
  <AppFooter />
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import AppHeader from '../../../Components/cabeceraYpiePrincipal/Header.vue'
import AppFooter from '../../../Components/cabeceraYpiePrincipal/Footer.vue'
import PlateCard from './Components/PlateCard.vue'
import { getMenu, getCategories } from '../../../Services/api'
import './Menu.css'

const VISIBLE = 3   

const categories = ref([])

const menu      = ref(null)
const viewPlate = ref(null)

const currentPage = reactive({})

const viewportRefs = reactive({})

function setViewportRef(el, catId) {
  if (el) viewportRefs[catId] = el
}

const platesByCategory = computed(() => {
  if (!menu.value) return {}
  return menu.value.reduce((acc, item) => {
    const cat = item.id_category ?? item.id_menu_category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
})

function getStep(catId) {
  const el = viewportRefs[catId]
  return el ? el.clientWidth : 0
}

function pageCount(catId) {
  const count = platesByCategory.value[catId]?.length ?? 0
  return Math.ceil(count / VISIBLE)
}

function isLastPage(catId) {
  return (currentPage[catId] ?? 0) >= pageCount(catId) - 1
}

function slide(catId, direction) {
  const next = (currentPage[catId] ?? 0) + direction
  currentPage[catId] = Math.max(0, Math.min(next, pageCount(catId) - 1))
}

function onResize() {
  Object.keys(currentPage).forEach(k => {
    currentPage[k] = currentPage[k]
  })
}

onMounted(() => {
  categories.value.forEach(c => { currentPage[c.id] = 0 })
  window.addEventListener('resize', onResize)

  Promise.all([getCategories(), getMenu()])
    .then(([cats, data]) => {
      categories.value = cats  
      cats.forEach(c => { currentPage[c.id] = 0 })

      data.forEach((item) => {
        item.ingredients = item.ingredients.split(',').map(i => i.trim())
      })
      menu.value = data
    })
    .catch((err) => console.error('Error cargando menú:', err))
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>