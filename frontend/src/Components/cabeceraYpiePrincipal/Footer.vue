<template>
  <footer id="preFooter">
    <a-row>
      <a-col :span="6">
        <a-typography-title :level="4" class="">Al Punto</a-typography-title>
        <a-typography-paragraph class="footer-desc">Cocina honesta y producto fresco desde
          1994.</a-typography-paragraph>
      </a-col>
      <a-col :span="6">
        <a-typography-title :level="5" class="">Horario</a-typography-title>
        <div class=""><span>Lunes – Jueves</span><span class="">13:00 – 22:00</span></div>
        <div class=""><span>Viernes – Sábado</span><span class="">13:00 – 23:00</span></div>
        <div class=""><span>Domingo</span><span class="">13:00 – 21:00</span></div>
      </a-col>
      <a-col :span="6">
        <a-typography-title :level="5" class="">Contacto</a-typography-title>
        <a-space direction="vertical" size="small">
          <a-typography-text class="">Calle Mayor 12, Salamanca</a-typography-text>
          <a-typography-text class="">923 000 000</a-typography-text>
          <a-typography-text class="">hola@alpunto.es</a-typography-text>
        </a-space>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-flex>
          <a-typography-link class="">Privacidad</a-typography-link>
          <a-typography-link class="">Aviso legal</a-typography-link>
        </a-flex>
      </a-col>
    </a-row>
  </footer>
</template>

<script setup>
import { } from '@ant-design/icons-vue'
import './Footer.css'
</script>
