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

const parseTicketText = (text) => {
    if (!text) return {}

    let clean = text
        .replace(/\n/g, ' ')
        .replace(/[^\w\s€:.,()-]/g, ' ') 
        .replace(/\s+/g, ' ')
        .trim()

    const totalMatch = clean.match(/total[:\s]*([\d,.]+)\s*€/i)

    const subtotalMatch = clean.match(/subtotal[:\s]*([\d,.]+)\s*€/i)

    const fechaMatch = clean.match(/fecha[:\s]*([\d-]{8,10})/i)

    const horaMatch = clean.match(/hora[:\s]*([\d:]{4,5})/i)


    const direccionMatch = clean.match(/(paseo|calle|avda|avenida)[^,]+,\s*\d+/i)


    const productos = []
    const productRegex = /([A-Za-zÁÉÍÓÚñ\s]+?)\s*\(?(\d+)\s*(uds?|ud)?\)?\s*([\d,.]+)\s*€/gi

    let match
    while ((match = productRegex.exec(clean)) !== null) {
        const nombre = match[1].trim()

        if (/total|subtotal|fecha|hora/i.test(nombre)) continue

        productos.push({
            nombre,
            cantidad: parseInt(match[2]),
            precio: parseFloat(match[4].replace(',', '.'))
        })
    }

    return {
        tipo: 'Ticket OCR',
        total: totalMatch ? parseFloat(totalMatch[1].replace(',', '.')) : 0,
        subtotal: subtotalMatch ? parseFloat(subtotalMatch[1].replace(',', '.')) : null,
        fecha: fechaMatch ? fechaMatch[1] : null,
        hora: horaMatch ? horaMatch[1] : null,
        direccion: direccionMatch ? direccionMatch[0] : null,
        productos
    }
}


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
            parsed: parseTicketText(t.json_content)
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
                <a-typography-title :level="2" style="text-align: center;">
                    Mis Tickets
                </a-typography-title>

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
                                                {{ ticket.parsed.tipo || '—' }}
                                            </a-descriptions-item>

                                            <a-descriptions-item label="Fecha subida">
                                                {{ separarFechaHora(ticket.created_at).fecha }}
                                            </a-descriptions-item>

                                            <a-descriptions-item label="Hora subida">
                                                {{ separarFechaHora(ticket.created_at).hora }}
                                            </a-descriptions-item>

                                            <a-descriptions-item label="Fecha ticket">
                                                {{ ticket.parsed.fecha || '—' }}
                                            </a-descriptions-item>

                                            <a-descriptions-item label="Hora ticket">
                                                {{ ticket.parsed.hora || '—' }}
                                            </a-descriptions-item>

                                            <a-descriptions-item label="Dirección">
                                                {{ ticket.parsed.direccion || '—' }}
                                            </a-descriptions-item>

                                            <a-descriptions-item label="Estado">
                                                {{ ticket.status }}
                                            </a-descriptions-item>

                                            <a-descriptions-item label="Puntos">
                                                {{ ticket.points_awarded || 0 }}
                                            </a-descriptions-item>

                                        </a-descriptions>


                                        <a-row justify="space-between" style="margin-top: 10px;">
                                            <a-statistic title="Subtotal" :value="ticket.parsed.subtotal || 0"
                                                precision="2" suffix="€" />
                                            <a-statistic title="Total" :value="ticket.parsed.total || 0" precision="2"
                                                suffix="€" />
                                        </a-row>


                                        <div v-if="ticket.parsed.productos?.length" style="margin-top: 15px;">
                                            <strong>Productos:</strong>
                                            <ul>
                                                <li v-for="(p, i) in ticket.parsed.productos" :key="i">
                                                    {{ p.nombre }} — {{ p.cantidad }} x {{ p.precio }}€
                                                </li>
                                            </ul>
                                        </div>

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