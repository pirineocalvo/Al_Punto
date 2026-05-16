<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue';
import Sidebar from '../../Components/componenteDashboard/Sidebar.vue';
import { misReservas } from '../../Services/api';
import { Bar } from '@antv/g2plot';
import { UserOutlined, TrophyOutlined, FileTextOutlined } from '@ant-design/icons-vue';
import QRCode from 'qrcode';
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue';
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';
import { message } from 'ant-design-vue';

const cargado = ref(false);

const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.EMPLEADO });

const reserveInfo = ref([]);
const collapsed = ref(false);

const chartRef = ref(null);
let chartInstance = null;


const qr = ref('');


const generarCodigoQR = (userId) => {
    return encodeURIComponent(userId);
};

const fetchReserve = async () => {
    try {
        reserveInfo.value = await misReservas();
    } catch (err) {
        message.error('Error al consultar las reservas');
    }
};

// TO DO: pantalla verificada tras escanear (cuando despleguemos)
const generarQR = async () => {
    if (!user.value) return;

    const code = generarCodigoQR(user.value.id);
    const url = `https://tudominio.com/checkin?code=${code}`;
    try {
        qr.value = await QRCode.toDataURL(url);
    } catch (error) {

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
    }finally{
        cargado.value = true;
    }
    try {
        await generarQR();
    } catch (error) {
        message.error('Error al cargar el qr en el watch')
    }

}, { immediate: true });

//si se pone en el de arriba no carga
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
        <HeaderDashboard :user="user" />
        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />
            <a-flex v-if="!cargado" vertical align="center" justify="center" class="centrarSpin">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-layout-content v-else class="colocarContenedorPrincipalDashBoard">
                <div class="content-wrapper">
                    <div class="header-section">
                        <a-typography-title class="dashboard-titulo">
                            Bienvenido {{ user?.first_name || 'Usuario' }}
                        </a-typography-title>
                        <a-card class="qr-card">
                            <h3>Tu tarjeta de fidelización</h3>
                            <p>Enséñalo al llegar al local</p>

                            <img v-if="qr" :src="qr" alt="QR usuario" />

                            <p><strong>{{ user?.first_name }}</strong></p>
                        </a-card>

                        <a-typography-paragraph class="dashboard-subtitulo">
                            Resumen general de tu actividad
                        </a-typography-paragraph>
                    </div>

                    <a-row>
                        <a-card class="stat-card">
                            <div class="stat-header">
                                <FileTextOutlined class="stat-icon" />
                                <span>Reservas</span>
                            </div>
                            <div class="stat-number">
                                {{ reserveInfo.length }}
                            </div>
                        </a-card>

                        <a-card class="stat-card">
                            <div class="stat-header">
                                <UserOutlined class="stat-icon" />
                                <span>Tickets</span>
                            </div>
                            <div class="stat-number">
                                {{ user?.ticket_count || 0 }}
                            </div>
                        </a-card>

                        <a-card class="stat-card">
                            <div class="stat-header">
                                <TrophyOutlined class="stat-icon" />
                                <span>Puntos</span>
                            </div>
                            <div class="stat-number">
                                {{ user?.points || 0 }}
                            </div>
                        </a-card>
                    </a-row>



                    <a-card class="chart-card">
                        <div ref="chartRef" class="chart-container"></div>
                    </a-card>

                </div>
            </a-layout-content>
        </a-layout>
        <Footer />
    </a-layout>
</template>
<style scoped>
.content-wrapper {
    width: 100%;
    max-width: 1100px;
    animation: fadeIn 0.6s ease-out;
    margin: auto;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.header-section {
    margin-bottom: 24px;
}

.dashboard-titulo {
    font-size: 2.2rem !important;
    font-weight: 800 !important;
    margin-bottom: 8px !important;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.dashboard-subtitulo {
    font-size: 1rem !important;
    color: var(--text-secondary) !important;
}

.stat-card {
    border-radius: 16px !important;
    border: 1px solid var(--border-sutil) !important;
    background: var(--bg-card) !important;
    transition: all 0.3s ease !important;
    padding: 20px !important;
    flex: 1;
}

.stat-card:hover {
    transform: translateY(-5px);
    border-color: var(--color-primary) !important;
}

.stat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: var(--text-muted);
}

.stat-icon {
    font-size: 20px;
}

.stat-number {
    font-size: 2.2rem;
    font-weight: 800;
    margin-top: 10px;
    color: var(--text-primary);
}

.chart-card {
    margin-top: 32px;
    border-radius: 16px !important;
    border: 1px solid var(--border-sutil) !important;
    background: var(--bg-card) !important;
    transition: all 0.3s ease;
    padding: 20px !important;
}

.chart-card:hover {
    transform: translateY(-3px);
    border-color: var(--color-primary) !important;
}


.qr-card {
    text-align: center;
    margin-bottom: 20px;
}

.qr-card img {
    width: 200px;
    margin: 10px auto;
}

.ant-card {
    height: auto !important;
}
</style>