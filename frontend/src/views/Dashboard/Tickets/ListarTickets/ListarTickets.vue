<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getMyTickets, userInfo } from '../../../../Services/api'
import Sidebar from '../../../../Components/componenteDashboard/Sidebar.vue'
import './ListarTickets.css'

const router = useRouter()

const user = ref(null)
const tickets = ref([])
const cargando = ref(false)
const collapsed = ref(false)

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken')
    if (!token) {
        router.push('/login')
        return
    }

    try {
        user.value = await userInfo()
        cargando.value = true
        const data = await getMyTickets()
        tickets.value = data.map(t => ({
            ...t,
            parsed: JSON.parse(t.json_content)
        }))
    } catch (error) {
        message.error('Error al cargar los tickets')
        router.push('/login')
    } finally {
        cargando.value = false
    }
})

const separarFechaHora = (fecha) => {
    if (!fecha) return { fecha: '—', hora: '—' }
    const [f, h] = fecha.split(' ')
    return {
        fecha: f,
        hora: h || '—'
    }
}
</script>

<template>
    <a-layout class="dashboard-container">
        <a-layout class="dashboard-main-layout">
            <Sidebar :collapsed="collapsed" />
            <a-layout-content class="dashboard-content">
                <a-typography-title :level="2" style="text-align: center;">Mis Tickets</a-typography-title>
                <a-spin :spinning="cargando">
                    <div class="content-wrapper">
                        <div v-if="tickets.length === 0" class="empty-container">
                            <a-empty description="No tienes tickets todavía" />
                        </div>
                        <div v-else class="tickets-grid">
                            <div v-for="ticket in tickets" :key="ticket.id" class="ticket-item">
                                <a-card class="ticket-card">
                                    <div class="ticket-image-container">
                                        <img :src="ticket.image_url" alt="ticket" class="ticket-img" />
                                    </div>
                                    <div class="ticket-content">
                                        <a-descriptions :column="1" bordered size="small">
                                            <a-descriptions-item label="Tipo">
                                                {{ ticket.parsed.tipo }}
                                            </a-descriptions-item>
                                            <a-descriptions-item label="Fecha subida">
                                                {{ separarFechaHora(ticket.created_at).fecha }}
                                            </a-descriptions-item>
                                            <a-descriptions-item label="Hora subida">
                                                {{ separarFechaHora(ticket.created_at).hora }}
                                            </a-descriptions-item>
                                            <a-descriptions-item label="Estado">
                                                {{ ticket.status }}
                                            </a-descriptions-item>
                                            <a-descriptions-item label="Puntos">
                                                {{ ticket.points_awarded || 0 }}
                                            </a-descriptions-item>
                                        </a-descriptions>
                                        <a-row justify="end">
                                            <a-statistic title="Total" :value="ticket.parsed.total" precision="2"
                                                suffix="€" />
                                        </a-row>
                                    </div>
                                </a-card>
                            </div>
                        </div>
                    </div>
                </a-spin>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>