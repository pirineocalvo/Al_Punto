<template>
  <AppHeader />
  <div class="menu-container">
    <h1>Cargando Menú...</h1>
    <template v-if="menu">
      <h1>Menú</h1>
      <div v-if="viewPlate" class="plate-card-container">
        <a-button @click="viewPlate = null">Volver</a-button>
        <PlateCard :item="viewPlate" />
      </div>
      <a-row v-else :gutter="[16, 16]">
        <a-col v-for="(item, index) in menu" :key="index" :span="12">
          <div class="menu-item-card">
            <a-card hoverable @click="viewPlate = item">
              <img draggable="false" :alt="item.name" :src="'images/plates/' + item.img_src" />
              <a-card-meta :title="item.name" :description="item.description" />
              <table class="ingredientlist-table">
                <thead><tr><th>Ingredientes</th></tr></thead>
                <tbody>
                  <tr v-for="(ingredient, i) in item.ingredients" :key="i" class="ingredientlist-table-row">
                    <td class="ingredientlist-table-row-cell">{{ ingredient }}</td>
                  </tr>
                </tbody>
              </table>
              <p>{{ item.price }} €</p>
            </a-card>
          </div>
        </a-col>
      </a-row>
    </template>
  </div>
  <AppFooter />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '../../../Components/cabeceraYpiePrincipal/Header.vue';
import AppFooter from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import PlateCard from './Components/PlateCard.vue'
import { getMenu } from '../../../Services/api'
import './Menu.css'

const menu = ref(null)
const viewPlate = ref(null)

onMounted(() => {
  getMenu()
    .then((data) => {
      data.forEach((item) => {
        item.ingredients = item.ingredients.split(',')
      })
      menu.value = data
    })
    .catch((err) => console.error('Error en getMenu:', err))
})
</script>
