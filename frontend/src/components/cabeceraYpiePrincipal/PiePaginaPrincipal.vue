<template>
  <footer id="preFooter">
    <a-row type="flex" justify="center" :gutter="[32, 32]">
      
      <a-col :xs="24" :md="12" :xl="6">
        <a-typography-title class="titulosFooter" :level="4">Al Punto</a-typography-title>
        <a-typography-paragraph class="textFooter">
          Cocina honesta y producto fresco desde 1994.
        </a-typography-paragraph>
      </a-col>

      <a-col :xs="24" :md="12" :xl="6">
        <a-space direction="vertical">
          <a-typography-title class="titulosFooter" :level="4">Horario</a-typography-title>
          <a-typography-text class="textFooter">Lunes – Jueves 13:00 – 22:00</a-typography-text>
          <a-typography-text class="textFooter">Viernes – Sábado 13:00 – 23:00</a-typography-text>
          <a-typography-text class="textFooter">Domingo 13:00 – 21:00</a-typography-text>
        </a-space>
      </a-col>

      <a-col :xs="24" :md="12" :xl="6">
        <a-typography-title class="titulosFooter" :level="4">Contacto</a-typography-title>
        <a-space direction="vertical" size="small">
          <a-typography-text class="textFooter">Calle Mayor 12, Salamanca</a-typography-text>
          <a-typography-text class="textFooter" copyable>923 000 000</a-typography-text>
          <a-typography-text class="textFooter" copyable>hola@alpunto.es</a-typography-text>
        </a-space>
      </a-col>
    </a-row>

    <a-divider/>

    <a-row type="flex" justify="center" :gutter="[24, 0]">
      <a-col>
        <a-typography-link>Privacidad</a-typography-link>
      </a-col>
      <a-col>
        <a-typography-link>Aviso legal</a-typography-link>
      </a-col>
    </a-row>
  </footer>
</template>

<style scoped>
#preFooter {
  padding: 60px 20px 30px 20px;
  background-color: var(--color-footer-fondo);
  text-align: center;
}

.textFooter {
  color: var(--color-footer-texto);
  margin-bottom: 0 !important;
}

.titulosFooter {
  color: var(--color-principal) !important;
  margin-bottom: 16px !important;
}



</style>
