<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Spin, Result, Typography, Card } from 'ant-design-vue';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';

const { Title, Text } = Typography;

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
    <div class="checkin-contenedor">
        <a-card class="checkin-tarjeta" :bordered="false">
            <div v-if="estado === 'cargando'" class="checkin-estado">
                <a-spin size="large" />
                <a-typography-text class="subtexto">Verificando código...</a-typography-text>
            </div>
            <a-result v-else-if="estado === 'ok'" class="checkin-estado">
                <template #icon>
                    <check-circle-filled class="icono-ok" />
                </template>
                <template #title>
                    <a-typography-title :level="1" class="titulo">¡Bienvenido!</a-typography-title>
                </template>
                <template #subTitle>
                    <a-typography-title :level="3" class="nombre">{{ nombreUsuario }}</a-typography-title>
                    <a-typography-text class="subtexto">
                        Nos alegra tenerte aquí. Disfruta de tu visita.
                    </a-typography-text>
                </template>
                <template #extra>
                    <div class="linea-decorativa" />
                    <a-typography-text class="pie">Check-in registrado correctamente</a-typography-text>
                </template>
            </a-result>
            <a-result v-else class="checkin-estado">
                <template #icon>
                    <close-circle-filled class="icono-error" />
                </template>
                <template #title>
                    <a-typography-title :level="2" class="titulo">Código inválido</a-typography-title>
                </template>
                <template #subTitle>
                    <a-typography-text class="subtexto">
                        No se pudo verificar este QR. Pide al cliente que lo regenere.
                    </a-typography-text>
                </template>
            </a-result>

        </a-card>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400&display=swap');

.checkin-contenedor {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    background-image:
        radial-gradient(ellipse at 20% 50%, rgba(217, 119, 66, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(184, 95, 52, 0.10) 0%, transparent 50%);
    font-family: 'Lato', sans-serif;
    padding: 24px;
}

.checkin-tarjeta {
    background: #242424 !important;
    border: 1px solid rgba(217, 119, 66, 0.2) !important;
    border-radius: 24px !important;
    max-width: 420px;
    width: 100%;
    box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.03),
        0 32px 64px rgba(0, 0, 0, 0.5);
    animation: entrar 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

:deep(.ant-card-body) {
    padding: 48px 40px !important;
}

@keyframes entrar {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
}

.checkin-estado {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

:deep(.ant-spin-dot-item) {
    background-color: #D97742 !important;
}

.checkin-estado > :deep(.ant-spin) {
    margin-bottom: 24px;
}

:deep(.ant-result) {
    padding: 0 !important;
    background: transparent !important;
}
:deep(.ant-result-icon) {
    margin-bottom: 20px !important;
}
:deep(.ant-result-title) {
    margin-bottom: 8px !important;
}
:deep(.ant-result-subtitle) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
:deep(.ant-result-extra) {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0 !important;
}

.icono-ok {
    font-size: 72px;
    color: #D97742;
    filter: drop-shadow(0 8px 24px rgba(217, 119, 66, 0.5));
    animation: pulso 2s ease-in-out infinite;
}

.icono-error {
    font-size: 72px;
    color: #c0392b;
    filter: drop-shadow(0 8px 24px rgba(192, 57, 43, 0.4));
}

@keyframes pulso {
    0%, 100% { filter: drop-shadow(0 8px 24px rgba(217, 119, 66, 0.4)); }
    50%       { filter: drop-shadow(0 8px 36px rgba(217, 119, 66, 0.75)); }
}

.titulo {
    font-family: 'Playfair Display', serif !important;
    font-weight: 900 !important;
    color: #ffffff !important;
    margin: 0 !important;
    letter-spacing: -0.5px;
}

.nombre {
    font-family: 'Playfair Display', serif !important;
    font-weight: 700 !important;
    color: #D97742 !important;
    margin: 0 0 12px !important;
}

.subtexto {
    font-size: 0.95rem !important;
    color: rgba(255, 255, 255, 0.45) !important;
    font-weight: 300 !important;
    line-height: 1.6 !important;
    display: block;
    margin-top: 8px;
}

.linea-decorativa {
    width: 48px;
    height: 2px;
    background: linear-gradient(90deg, #D97742, #B85F34);
    border-radius: 2px;
    margin: 24px auto 16px;
}

.pie {
    font-size: 0.75rem !important;
    color: rgba(255, 255, 255, 0.25) !important;
    letter-spacing: 0.07em;
    text-transform: uppercase;
}
</style>