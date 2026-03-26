<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../../Components/componenteDashboard/Sidebar.vue'
/* import DashboardHeader from './Components/DashboardHeader.vue'
import DashboardFooter from './Components/DashboardFooter.vue' */
import { misReservas, userInfo } from '../../Services/api'
import './Dashboard.css'

const user = ref(null)
const reserveInfo = ref(null)
const collapsed = ref(false)
const router = useRouter()

onMounted(async () => {
    await fetchUser()
    await fetchReserve()
})

const fetchUser = async () => {
    const token = localStorage.getItem('loginUserToken')
    if (!token) { router.push('/login'); return }
    try {
        user.value = await userInfo()
    } catch (err) {
        console.error(err)
        router.push('/login')
    }
}

const fetchReserve = async () => {
    try {
        reserveInfo.value = await misReservas()
    } catch (err) {
        console.error(err)
    }
}

const toggleSidebar = () => { collapsed.value = !collapsed.value }
</script>

<template>
    <a-layout class="dashboard-container">
        <!-- <DashboardHeader :user="user" @toggle="toggleSidebar" /> -->

        <a-layout class="dashboard-main-layout">
            <Sidebar :collapsed="collapsed" />

            <a-layout-content class="dashboard-content">
                <div class="content-wrapper">

                    <a-typography-title class="dashboard-titulo">
                        Bienvenido {{ user?.first_name || 'Usuario' }} a tu Panel de Control
                    </a-typography-title>

                    <a-typography-paragraph class="dashboard-subtitulo">
                        Aquí podrás gestionar toda tu información
                    </a-typography-paragraph>

                    <a-row :gutter="[24, 24]" class="stats-row">
                        <a-col :xs="24" :sm="12" :lg="8">
                            <a-card class="stat-card">
                                <a-statistic title="Número de reservas" :value="reserveInfo ? reserveInfo.length : 0"
                                    class="stat-value" />
                            </a-card>
                        </a-col>
                        <a-col :xs="24" :sm="12" :lg="8">
                            <a-card class="stat-card">
                                <a-statistic title="Tickets Subidos" :value="user?.ticket_count || 0"
                                    class="stat-value" />
                            </a-card>
                        </a-col>
                        <a-col :xs="24" :sm="12" :lg="8">
                            <a-card class="stat-card">
                                <a-statistic title="Puntos" :value="user?.points || 0" class="stat-value" />
                            </a-card>
                        </a-col>
                    </a-row>
                </div>
                <!-- <DashboardFooter /> -->
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>