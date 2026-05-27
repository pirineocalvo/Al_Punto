<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue';
import Sidebar from '../../components/componenteDashboard/Sidebar.vue';
import { misReservas } from '../../services/reservasEndpoint';
import { Bar } from '@antv/g2plot';
import { UserOutlined, TrophyOutlined, FileTextOutlined } from '@ant-design/icons-vue';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import CabeceraZonaPersonal from '@/components/componenteDashboard/CabeceraZonaPersonal.vue';
import PiePaginaPrincipal from '@/components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';
import { message } from 'ant-design-vue';

const cargado = ref(false);

const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.CLIENTE });

const reserveInfo = ref([]);
const collapsed = ref(false);

const chartRef = ref(null);
let chartInstance = null;

const qr = ref('');

const QR_SECRET = import.meta.env.VITE_QR_SECRET;

const generarCodigoQR = (userId) => {
    const encrypted = CryptoJS.AES.encrypt(String(userId), QR_SECRET).toString();
    return encodeURIComponent(encrypted);
};

const fetchReserve = async () => {
    try {
        reserveInfo.value = await misReservas();
    } catch (err) {
        message.error('Error al consultar las reservas');
    }
};

const generarQR = async () => {
    if (!user.value) return;

    const code = generarCodigoQR(user.value.id);
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const url = `${baseUrl}/checkin?code=${code}`;
    try {
        qr.value = await QRCode.toDataURL(url);
    } catch (error) {
        message.error('Error al generar el QR');
    }
};

const chartData = computed(() => [
    { name: 'Reservas', value: reserveInfo.value.length || 1 },
    { name: 'Tickets', value: user.value?.ticket_count || 1 },
    { name: 'Puntos', value: user.value?.points || 1 }
]);

const renderChart = async () => {
    try {
        await nextTick();
    } catch (error) {
    }

    if (!chartRef.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }
    chartInstance = new Bar(chartRef.value, {
        data: chartData.value,
        xField: 'value',
        yField: 'name',
        seriesField: 'name',
        legend: false,
        color: ['#D97742', '#B85F34', '#97522D'],
        autoFit: true,
        label: {
            position: 'right'
        },
        barStyle: {
            radius: [6, 6, 6, 6]
        },
        xAxis: {
            type: 'log',
            base: 10
        }
    });
    chartInstance.render();
};

watch(usuarioListo, async () => {
    try {
        await fetchReserve();
    } catch (error) {
        message.error('Error al cargar los datos del usuario');
    } finally {
        cargado.value = true;
    }
    try {
        await generarQR();
    } catch (error) {
        message.error('Error al cargar el QR');
    }
}, { immediate: true });

watch(cargado, () => {
    if (cargado.value) {
        renderChart();
    }
}, { deep: true });

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
});
</script>

<template>
    <a-layout>
        <CabeceraZonaPersonal :user="user" />
        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />
            <a-flex v-if="!cargado" vertical align="center" justify="center" class="centrarSpin">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-layout-content v-else class="colocarContenedorPrincipalDashBoard">
                <div class="contenedorContenido">
                    <div class="seccionCabecera">
                        <a-typography-title class="dashboardTitulo">
                            Bienvenido {{ user?.first_name || 'Usuario' }}
                        </a-typography-title>
                        <a-card class="tarjetaQr">
                            <h3>Tu tarjeta de fidelización</h3>
                            <p>Enséñalo al llegar al local</p>

                            <img v-if="qr" :src="qr" alt="QR usuario" />

                            <p><strong>{{ user?.first_name }}</strong></p>
                        </a-card>

                        <a-typography-paragraph class="dashboardSubtitulo">
                            Resumen general de tu actividad
                        </a-typography-paragraph>
                    </div>

                    <a-row>
                        <a-card class="tarjetaEstadistica">
                            <div class="cabeceraEstadistica">
                                <FileTextOutlined class="iconoEstadistica" />
                                <span>Reservas</span>
                            </div>
                            <div class="numeroEstadistica">
                                {{ reserveInfo.length }}
                            </div>
                        </a-card>
                        <a-card class="tarjetaEstadistica">
                            <div class="cabeceraEstadistica">
                                <UserOutlined class="iconoEstadistica" />
                                <span>Tickets</span>
                            </div>
                            <div class="numeroEstadistica">
                                {{ user?.ticket_count || 0 }}
                            </div>
                        </a-card>

                        <a-card class="tarjetaEstadistica">
                            <div class="cabeceraEstadistica">
                                <TrophyOutlined class="iconoEstadistica" />
                                <span>Puntos</span>
                            </div>
                            <div class="numeroEstadistica">
                                {{ user?.points || 0 }}
                            </div>
                        </a-card>
                    </a-row>

                    <a-card class="tarjetaGrafico">
                        <div ref="chartRef" class="contenedorGrafico"></div>
                    </a-card>
                </div>
            </a-layout-content>
        </a-layout>
        <PiePaginaPrincipal />
    </a-layout>
</template>

<style scoped>
.contenedorContenido {
    width: 100%;
    max-width: 1100px;
    animation: aparecerDesvanecido 0.6s ease-out;
    margin: auto;
}

@keyframes aparecerDesvanecido {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.seccionCabecera {
    margin-bottom: 24px;
}

.dashboardTitulo {
    font-size: 2.2rem !important;
    font-weight: 800 !important;
    margin-bottom: 8px !important;
}
.dashboardSubtitulo {
    font-size: 1rem !important;
}

.tarjetaEstadistica {
    border: none;
    background: var(--bg-card) !important;
    transition: all 0.3s ease !important;
    padding: 20px !important;
    flex: 1;
}

.tarjetaEstadistica:hover {
    transform: translateY(-5px);
}

.cabeceraEstadistica {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
}

.iconoEstadistica {
    font-size: 20px;
}
.numeroEstadistica {
    font-size: 2.2rem;
    font-weight: 800;
    margin-top: 10px;
}

.tarjetaGrafico {
    margin-top: 32px;
    border: none;
    background: var(--bg-card) !important;
    transition: all 0.3s ease;
    padding: 20px !important;
}

.tarjetaQr {
    text-align: center;
    margin-bottom: 20px;
}

.tarjetaQr img {
    width: 200px;
    margin: 10px auto;
}
</style>