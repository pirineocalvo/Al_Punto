<template>
  <AppHeader />
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Sabores Que Enamoran</h1>
        <p>Experiencia gastronómica de primer nivel en un ambiente refinado y acogedor.</p>
        <button class="cta-button">Reserva Tu Mesa</button>
      </div>
    </section>

    <!-- About Us Section -->
    <section class="about">
      <div class="about-text">
        <div class="section-title">
          <h2>Nuestra Historia</h2>
        </div>
        <h2>Pasión por la Cocina Tradicional</h2>
        <p>
          Desde 1995, hemos estado sirviendo los platos más exquisitos con los ingredientes
          más frescos del mercado. Nuestra filosofía se basa en el respeto al producto y
          la constante innovación técnica.
        </p>
        <p>
          Cada plato cuenta una historia, cada aroma evoca un recuerdo. Ven y déjate
          seducir por una experiencia sensorial única que despertará todos tus sentidos.
        </p>
        <button class="cta-button">Conoce Más</button>
      </div>
      <div class="about-image">
        <img src="/images/imagenFamiliaMenu.png" alt="Interior del restaurante" />
      </div>
    </section>

    <!-- Featured Dishes Section -->
    <section class="featured">
      <div class="section-title">
        <h2>Platos Destacados</h2>
        <p>Una selección de nuestras creaciones más populares</p>
      </div>
      <div class="featured-grid">
        <div class="dish-card">
          <div class="dish-img">
            <img src="./images/huevosRotos.png" alt="Huevos rotos" />
          </div>
          <div class="dish-info">
            <h2>Huevos rotos</h2>
            <p>Compuesto por huevos de las mejores gallinas camperas y embutido ibérico.</p>
            <span class="dish-price">31.99€</span>
          </div>
        </div>
        <div class="dish-card">
          <div class="dish-img">
            <img src="/images/espagueti.png" alt="Pasta a la boloñesa" />
          </div>
          <div class="dish-info">
            <h2>Pasta a la boloñesa</h2>
            <p>Pasta fresca hecha a mano con tomates cherry, carne picada de la mejor calidad y queso parmesano.</p>
            <span class="dish-price">18.50€</span>
          </div>
        </div>
        <div class="dish-card">
          <div class="dish-img">
            <img src="/images/tartaQueso.png" alt="Tarta de queso" />
          </div>
          <div class="dish-info">
            <h2>Tarta de queso</h2>
            <p>Postre casera hecho con alimentos de origen nacional.</p>
            <span class="dish-price">7.99€</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-banner">
      <h3>¿Listo para vivir la experiencia?</h3>
      <p>Abierto todos los días de 13:00 a 23:00</p>
      <button class="cta-button">Ver Menú Completo</button>
    </section>
  </div>
  <AppFooter />
</template>

<script setup>
import AppHeader from './Components/Header.vue'
import AppFooter from './Components/Footer.vue'
import './Home.css'
</script>
