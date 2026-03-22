<template>
    <section>
        <h2>Reservas</h2>
        <div class="contenedorCalendairo">
            <a-calendar :model:value="value" />
        </div>
    </section>
</template>

<script setup>
import './Reservation.css'
import { todasLasReservas, todasLasMesas, todasLasMesasReservadas } from '../../Services/api'
import { ref, onMounted } from 'vue';

const reservasAlmacenadas = ref(null);
const mesas = ref(null);
const mesasReservadas = ref(null);

onMounted(async () => {
    reservasAlmacenadas.value = await todasLasReservas();
    mesas.value = await todasLasMesas();
    mesasReservadas.value = await todasLasMesasReservadas();
    console.log(reservasAlmacenadas.value);
    console.log(mesas.value);
    console.log(mesasReservadas.value);
    
    
});
</script>