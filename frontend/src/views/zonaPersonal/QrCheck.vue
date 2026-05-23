<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const estado = ref('cargando'); 
const nombreUsuario = ref('');

onMounted(async () => {
    const code = route.query.code;
    if (!code) {
        estado.value = 'error';
        return;
    }

    try {
        const idUsuario = decodeURIComponent(code);
        const URL_API = import.meta.env.VITE_API_URL;
        const respuesta = await axios.get(`${URL_API}/api/usuario/checkin/${idUsuario}`);
        nombreUsuario.value = respuesta.data.nombre;
        estado.value = 'ok';
    } catch {
        estado.value = 'error';
    }
});
</script>

<template>
    <div class="checkinContenedor">
        <div v-if="estado === 'cargando'" class="checkinTarjeta">
            <div class="spinner"></div>
            <p class="checkinSubtexto">Verificando código...</p>
        </div>
        <div v-else-if="estado === 'ok'" class="checkinTarjeta checkinOk">
            <div class="checkinIcono">✓</div>
            <h1 class="checkinBienvenido">¡Bienvenido!</h1>
            <h2 class="checkinNombre">{{ nombreUsuario }}</h2>
            <p class="checkinSubtexto">Nos alegra tenerte aquí. Disfruta de tu visita.</p>
            <div class="checkinLinea"></div>
            <p class="checkinPie">Check-in registrado correctamente</p>
        </div>
        <div v-else class="checkinTarjeta checkinError">
            <div class="checkinIconoError">✕</div>
            <h1 class="checkinBienvenido">Código inválido</h1>
            <p class="checkinSubtexto">No se pudo verificar este QR. Pide al cliente que lo regenere.</p>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400&display=swap');

.checkinContenedor {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    background-image:
        radial-gradient(ellipse at 20% 50%, rgba(217, 119, 66, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(184, 95, 52, 0.1) 0%, transparent 50%);
    font-family: 'Lato', sans-serif;
    padding: 24px;
}

.checkinTarjeta {
    background: #242424;
    border: 1px solid rgba(217, 119, 66, 0.2);
    border-radius: 24px;
    padding: 56px 48px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow:
        0 0 0 1px rgba(255,255,255,0.03),
        0 32px 64px rgba(0,0,0,0.5);
    animation: entrar 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes entrar {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

.checkinIcono {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D97742, #B85F34);
    color: white;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 28px;
    box-shadow: 0 8px 24px rgba(217, 119, 66, 0.4);
    animation: pulso 2s ease-in-out infinite;
}

@keyframes pulso {
    0%, 100% { box-shadow: 0 8px 24px rgba(217, 119, 66, 0.4); }
    50%       { box-shadow: 0 8px 36px rgba(217, 119, 66, 0.7); }
}

.checkinIconoError {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #c0392b, #922b21);
    color: white;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 28px;
}

.checkinBienvenido {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 900;
    color: #ffffff;
    margin: 0 0 8px;
    letter-spacing: -0.5px;
}

.checkinNombre {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #D97742;
    margin: 0 0 16px;
}

.checkinSubtexto {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.45);
    font-weight: 300;
    line-height: 1.6;
    margin: 0;
}

.checkinLinea {
    width: 48px;
    height: 2px;
    background: linear-gradient(90deg, #D97742, #B85F34);
    margin: 28px auto;
    border-radius: 2px;
}

.checkinPie {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin: 0;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(217, 119, 66, 0.2);
    border-top-color: #D97742;
    border-radius: 50%;
    margin: 0 auto 24px;
    animation: girar 0.8s linear infinite;
}

@keyframes girar {
    to { transform: rotate(360deg); }
}

.checkinError .checkinBienvenido {
    font-size: 1.5rem;
}
</style>