<template>
    <section>
        <h2>Reservas</h2>
        <div class="contenedorCalendairo">
            <a-calendar v-model:value="value" />
        </div>
    </section>
</template>
<script setup>
import './Reservation.css'
</script>