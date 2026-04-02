<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../../Components/componenteDashboard/Sidebar.vue'
import { misReservas, userInfo } from '../../Services/api'
import { Bar } from '@antv/g2plot'
import { UserOutlined, TrophyOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import './Dashboard.css'
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue'
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue'

const user = ref(null);
const reserveInfo = ref([]);
const collapsed = ref(false);
const router = useRouter();

const chartRef = ref(null);
let chartInstance = null;

onMounted(async () => {
    await fetchUser();
    await fetchReserve();
    renderChart();
});

const fetchUser = async () => {
    const token = localStorage.getItem('loginUserToken');
    if (!token) { router.push('/login'); return }
    try {
        user.value = await userInfo();
    } catch (err) {
        router.push('/login');
    }
};

const fetchReserve = async () => {
    try {
        reserveInfo.value = await misReservas();
    } catch (err) {
        console.error(err);
    }
}

const chartData = computed(() => [
    { name: 'Reservas', value: reserveInfo.value.length || 1 },
    { name: 'Tickets', value: user.value?.ticket_count || 1 },
    { name: 'Puntos', value: user.value?.points || 1 }
])

const renderChart = async () => {
    await nextTick();

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

        color: ['#1677ff', '#52c41a', '#faad14'],

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
    })
    chartInstance.render();
}
</script>

<template>
<a-layout class="dashboard-container">
    <HeaderDashboard :user="user"/>
    <a-layout class="dashboard-main-layout">
        <Sidebar :collapsed="collapsed" />
        <a-layout-content class="dashboard-content">
            <div class="content-wrapper">
                <div class="header-section">
                    <a-typography-title class="dashboard-titulo">
                        Bienvenido {{ user?.first_name || 'Usuario' }}
                    </a-typography-title>
                    <a-typography-paragraph class="dashboard-subtitulo">
                        Resumen general de tu actividad
                    </a-typography-paragraph>
                </div>
                <div class="stats-row">
                    <a-card class="stat-card">
                        <div class="stat-header">
                            <FileTextOutlined class="stat-icon blue"/>
                            <span>Reservas</span>
                        </div>
                        <div class="stat-number">
                            {{ reserveInfo.length }}
                        </div>
                    </a-card>

                    <a-card class="stat-card">
                        <div class="stat-header">
                            <UserOutlined class="stat-icon green"/>
                            <span>Tickets</span>
                        </div>
                        <div class="stat-number">
                            {{ user?.ticket_count || 0 }}
                        </div>
                    </a-card>

                    <a-card class="stat-card">
                        <div class="stat-header">
                            <TrophyOutlined class="stat-icon yellow"/>
                            <span>Puntos</span>
                        </div>
                        <div class="stat-number">
                            {{ user?.points || 0 }}
                        </div>
                    </a-card>

                </div>
                <a-card class="chart-card">
                    <div ref="chartRef" class="chart-container"></div>
                </a-card>
            </div>
        </a-layout-content>
        
    </a-layout>
    <Footer/>
</a-layout>
</template>