<script setup>
import AppHeader from './Components/Header.vue';
import AppFooter from './Components/Footer.vue';
import './Home.css';
import { Button, Card, Row, Col, Typography } from 'ant-design-vue';
import { h } from 'vue'
</script>

<template><!--TODO: tamaño textos-->
  <AppHeader />
  <main>
    <div id="eslogan">
      <div id="contenidoEslogan">
        <a-typography-title>Sabores Que Enamoran</a-typography-title>
        <a-typography-paragraph>
          Experiencia gastronómica de primer nivel en un ambiente refinado y acogedor.
        </a-typography-paragraph>
        <a-button type="primary" size="large">
          Reserva Tu Mesa
        </a-button>
      </div>
    </div>

    <div id="sobreNosotros">
      <div class="subTitulo">
        <a-typography-title :level="2">Nuestra Historia</a-typography-title>
        <a-typography-text>Pasión por la Cocina Tradicional</a-typography-text>
      </div>
      <a-typography-paragraph>Desde 1995, hemos estado sirviendo los platos más exquisitos...</a-typography-paragraph>
      <a-typography-paragraph>Cada plato cuenta una historia...</a-typography-paragraph>
      <a-button type="default">Conoce Más</a-button>
    </div>

    <div id="contenedorTarjetas">
      <div class="subTitulo">
        <a-typography-title :level="2">Platos destacados</a-typography-title>
        <a-typography-text>Lo mejor de nuestro servicio</a-typography-text>
      </div>
      <a-row justify="center" :gutter="0">
        <a-col class="colTarjeta">
          <a-card class="tarjeta" hoverable>
            <div class="imagenTarjeta">
              <img src="/images/huevosRotos.png" />
            </div>
            <div class="infoTarjeta">
              <h2>Huevos rotos</h2>
              <p>Compuesto por huevos de las mejores gallinas camperas...</p>
              <span class="precioPlato">31.99€</span>
            </div>
          </a-card>
        </a-col>
        <a-col class="colTarjeta">
          <a-card class="tarjeta" hoverable>
            <div class="imagenTarjeta">
              <img src="/images/espagueti.png" />
            </div>
            <div class="infoTarjeta">
              <h2>Pasta a la boloñesa</h2>
              <p>Pasta fresca hecha a mano...</p>
              <span class="precioPlato">18.50€</span>
            </div>
          </a-card>
        </a-col>
        <a-col class="colTarjeta">
          <a-card class="tarjeta" hoverable>
            <div class="imagenTarjeta">
              <img src="/images/tartaQueso.png" />
            </div>
            <div class="infoTarjeta">
              <h2>Tarta de queso</h2>
              <p>Postre casera hecho con alimentos...</p>
              <span class="precioPlato">7.99€</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <section id="preFooter">
      <a-typography-title :level="3">¿Listo para vivir la experiencia?</a-typography-title>
      <a-typography-paragraph>Abierto todos los días de 13:00 a 23:00</a-typography-paragraph>
      <a-button type="primary" size="large">Ver Menú Completo</a-button>
    </section>
  </main>
  <AppFooter />
</template>
