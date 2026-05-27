<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';


const route = useRoute();
const estado = ref('cargando');
const nombreUsuario = ref('');

const QR_SECRET = import.meta.env.VITE_QR_SECRET;

onMounted(async () => {
    const code = route.query.code;
    if (!code) {
        estado.value = 'error';
        return;
    }

    try {
        const decoded = decodeURIComponent(code);
        const bytes = CryptoJS.AES.decrypt(decoded, QR_SECRET);
        const idUsuario = bytes.toString(CryptoJS.enc.Utf8);

        if (!idUsuario) throw new Error('Descifrado fallido');

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
        <a-card class="checkinTarjeta" :bordered="false">
            <div v-if="estado === 'cargando'" class="checkinEstado">
                <a-spin size="large" />
                <a-typography-text class="subtexto">Verificando código...</a-typography-text>
            </div>
            <a-result v-else-if="estado === 'ok'" class="checkinEstado">
                <template #icon>
                    <check-circle-filled class="iconoOk" />
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
                    <div class="lineaDecorativa" />
                    <a-typography-text class="pie">Check-in registrado correctamente</a-typography-text>
                </template>
            </a-result>
            <a-result v-else class="checkinEstado">
                <template #icon>
                    <close-circle-filled class="iconoError" />
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

.checkinContenedor {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFF5EC !important;
    background-image:
        radial-gradient(ellipse at 20% 50%, rgba(217, 119, 66, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(184, 95, 52, 0.10) 0%, transparent 50%);
    padding: 24px;
}

.checkinTarjeta {
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

.checkinEstado {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

:deep(.ant-spin-dot-item) {
    background-color: var(--color-principal) !important;
}

.checkinEstado > :deep(.ant-spin) {
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

.iconoOk {
    font-size: 72px;
    color: var(--color-principal) !important;
    filter: drop-shadow(0 8px 24px rgba(217, 119, 66, 0.5));
    animation: pulso 2s ease-in-out infinite;
}
.iconoError {
    font-size: 72px;
    color: #c0392b;
    filter: drop-shadow(0 8px 24px rgba(192, 57, 43, 0.4));
}

@keyframes pulso {
    0%, 100% { filter: drop-shadow(0 8px 24px rgba(217, 119, 66, 0.4)); }
    50%       { filter: drop-shadow(0 8px 36px rgba(217, 119, 66, 0.75)); }
}

.titulo {
    font-weight: 900 !important;
    color: var(--color-fondo-blanco) !important;
    margin: 0 !important;
    letter-spacing: -0.5px;
}

.nombre {
    font-weight: 700 !important;
    color: var(--color-principal) !important;
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

.lineaDecorativa {
    width: 48px;
    height: 2px;
    background: linear-gradient(90deg, var(--color-principal), #B85F34);
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