<script setup>
import { RouterView } from 'vue-router';
import { ConfigProvider } from 'ant-design-vue';
import { getAntdTheme } from './theme/themeConfig';

const temaActual = getAntdTheme('light');
</script>
<template>
      <a-config-provider :theme="temaActual">
            <RouterView />
      </a-config-provider>
</template>