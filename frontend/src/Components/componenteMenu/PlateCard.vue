<script setup>

defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>
<template>
  <a-card hoverable>
    <a-row>
      <a-col>
        <img draggable="false" :alt="item.name" :src="'images/plates/' + item.img_src" />
      </a-col>
      <a-col :span="6">
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
      </a-col>
    </a-row>
  </a-card>
</template>
<style scoped>
.ingredientlist-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.ingredientlist-table th {
  text-align: left;
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding-bottom: 4px;
}

.ingredientlist-table-row-cell {
  font-size: 0.82rem;
  color: var(--text-primary);
  padding: 2px 0;
}
</style>