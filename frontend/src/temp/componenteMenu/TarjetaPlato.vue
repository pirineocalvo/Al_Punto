<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <a-badge :count="item.price + ' €'">
    <a-card hoverable>
      <template #cover>
        <img draggable="false" :alt="item.name" :src="'images/plates/' + item.img_src" />
      </template>

      <a-card-meta>
        <template #title>
          <a-typography-title :level="5">{{ item.name }}</a-typography-title>
        </template>
        <template #description>
          <a-typography-text>{{ item.description }}</a-typography-text>
        </template>
      </a-card-meta>

        <a-typography-title :level="5"  class="ingredientesTitulo">Ingredientes</a-typography-title>
        <div class="ingredientesDatos">
          <a-tag v-for="(ingredient, i) in item.ingredients" :key="i" :bordered="false">
            {{ ingredient }}
          </a-tag>
        </div>

    </a-card>
  </a-badge>
</template>

<style scoped>

.ingredientesTitulo {
  font-size: 0.75rem;
  font-weight: inherit;
  text-transform: uppercase;
  color: var(--color-texto-suave);
  letter-spacing: 1px;
  margin: 16px 0 8px 0;
}

.ingredientesDatos {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>