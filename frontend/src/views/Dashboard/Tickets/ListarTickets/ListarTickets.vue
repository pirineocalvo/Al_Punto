<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getMyTickets, userInfo } from '../../../../Services/api'
import Sidebar from '../../../../Components/componenteDashboard/Sidebar.vue'
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue'
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue'
import { CalendarOutlined, ClockCircleOutlined, EuroCircleOutlined, StarOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons-vue'

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

const columnasProductos = [
    {
        title: 'Producto',
        dataIndex: 'nombre',
        key: 'nombre',
    },
    {
        title: 'Cant.',
        dataIndex: 'cantidad',
        key: 'cantidad',
        width: 80,
    },
    {
        title: 'Precio Unit.',
        dataIndex: 'precio',
        key: 'precio',
        customRender: ({ text }) => `${text.toFixed(2)} €`,
    },
    {
        title: 'Total',
        key: 'total',
        customRender: ({ record }) => `${(record.cantidad * record.precio).toFixed(2)} €`,
    }
];

</script>

<template>
    <a-layout>
        <HeaderDashboard :user="user" />
        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />

            <a-row class="colocarContenedorPrincipalDashBoard">
                <a-col :xs="24" :md="20" :lg="24">
                <a-divider orientation="left">
                    <a-typography-title :level="2">Mis tickets</a-typography-title>
                </a-divider>

                    <a-spin :spinning="cargando">
                        <a-empty v-if="tickets.length === 0" description="No tienes tickets todavía" />

                        <a-collapse v-else accordion>
                            <a-collapse-panel v-for="ticket in tickets" :key="ticket.id">
                                <template #header>
                                    <a-space size="middle" wrap>
                                        <a-typography-text>
                                            <calendar-outlined  />
                                            {{ separarFechaHora(ticket.created_at).fecha }}
                                        </a-typography-text>

                                        <a-typography-text type="secondary">
                                            <clock-circle-outlined  />
                                            {{ separarFechaHora(ticket.created_at).hora }}
                                        </a-typography-text>

                                        <a-typography-text strong>
                                            <euro-circle-outlined  />
                                            {{ ticket.parsed.total?.toFixed(2) || '0.00' }} €
                                        </a-typography-text>

                                        <a-typography-text type="warning">
                                            <star-outlined  />
                                            {{ ticket.points_awarded || 0 }} pts
                                        </a-typography-text>
                                    </a-space>
                                </template>

                                <a-descriptions :column="1" bordered size="small">
                                    <a-descriptions-item>
                                        <template #label><calendar-outlined /> Fecha ticket</template>
                                        {{ ticket.parsed.fecha || '—' }}
                                    </a-descriptions-item>

                                    <a-descriptions-item>
                                        <template #label><clock-circle-outlined /> Hora ticket</template>
                                        {{ ticket.parsed.hora || '—' }}
                                    </a-descriptions-item>

                                    <a-descriptions-item :span="2">
                                        <template #label><environment-outlined /> Dirección</template>
                                        {{ ticket.parsed.direccion || '—' }}
                                    </a-descriptions-item>
                                </a-descriptions>

                                <a-table v-if="ticket.parsed.productos?.length" :dataSource="ticket.parsed.productos"
                                    :pagination="false" size="small" :columns="columnasProductos" />
                            </a-collapse-panel>
                        </a-collapse>
                    </a-spin>
                </a-col>
            </a-row>
        </a-layout>
        <Footer />
    </a-layout>
</template>