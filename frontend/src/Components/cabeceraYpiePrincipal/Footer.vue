<template>
  <footer id="preFooter">
    <a-row>
      <a-col :xs="24" :md="12" :xl="6">
        <a-typography-title class="titulosFooter" :level="4">Al Punto</a-typography-title>
        <a-typography-paragraph class="txtFooter">Cocina honesta y producto fresco desde 1994.</a-typography-paragraph>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-space direction="vertical">
          <a-typography-title class="titulosFooter" :level="4">Horario</a-typography-title>
          <a-typography-text class="txtFooter">Lunes – Jueves 13:00 – 22:00</a-typography-text>
          <a-typography-text class="txtFooter">Viernes – Sábado 13:00 – 23:00</a-typography-text>
          <a-typography-text class="txtFooter">Domingo 13:00 – 21:00</a-typography-text>
        </a-space>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-typography-title class="titulosFooter" :level="4">Contacto</a-typography-title>
        <a-space direction="vertical" size="small">
          <a-typography-text class="txtFooter">Calle Mayor 12, Salamanca</a-typography-text>
          <a-typography-text class="txtFooter" copyable>923 000 000</a-typography-text>
          <a-typography-text class="txtFooter" copyable>hola@alpunto.es</a-typography-text>
        </a-space>
      </a-col>
    </a-row>
    <a-row>
      <a-col>
        <a-typography-link>Privacidad</a-typography-link>
      </a-col>
      <a-col>
        <a-typography-link>Aviso legal</a-typography-link>
      </a-col>
    </a-row>
  </footer>
</template>

<script setup>
import { } from '@ant-design/icons-vue'
import './Footer.css'
</script>
