<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { uploadTickets, userInfo } from '../../../../Services/api'
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue'
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue'
import Sidebar from '../../../../Components/componenteDashboard/Sidebar.vue'
import './AgregarTickets.css'

const router = useRouter()
const user = ref(null)
const collapsed = ref(false)
const cargando = ref(false)
const archivo = ref(null)
const ticketInfo = ref(null)

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken')
    if (!token) { router.push('/login'); return }
    try {
        user.value = await userInfo()
    } catch {
        router.push('/login')
    }
})

// evita que Ant Design suba automáticamente
const antesDeSubir = (file) => {
    archivo.value = file;
    return false 
}

const subirTicket = async () => {
    if (!archivo.value) {
        message.error('Selecciona una imagen primero')
        return
    }
    cargando.value = true
    try {
        const formData = new FormData()
        formData.append('imagen', archivo.value)
        const data = await uploadTickets(formData)
        ticketInfo.value = parsearTicket(data.text)
        archivo.value = null
        message.success('¡Ticket subido! Tus puntos serán acreditados')
    } catch {
        message.error('Error al subir el ticket, inténtalo de nuevo')
    } finally {
        cargando.value = false
    }
}

const parsearTicket = (textoOcr) => {
    const lineas = textoOcr.split('\n').map(l => l.trim())
    const ticket = { restaurante: '', direccion: '', fecha: '', hora: '', productos: [], total: 0 }

    lineas.forEach(linea => {
        const limpia = linea.replace(/^[^a-zA-Z0-9\[(]+|[^a-zA-Z0-9€)\]]+$/g, '').trim()

        const matchRestaurante = limpia.match(/\[\s*(.*?)\s*\]/)
        if (matchRestaurante) {
            ticket.restaurante = matchRestaurante[1]
            return
        }

        if (limpia.toLowerCase().includes('fecha')) {
            const matchFecha = limpia.match(/(\d{2}-\d{2}-\d{4})/)
            const matchHora = limpia.match(/(\d{2}:\d{2})/)
            if (matchFecha) ticket.fecha = matchFecha[0]
            if (matchHora) ticket.hora = matchHora[0]
            return
        }

        if (/Paseo|Calle|Avda|C\/|Plaza/i.test(limpia) || /\d{5}/.test(limpia)) {
            ticket.direccion = limpia.replace(/^[A-Z]\s[—\-]+\s*/, '')
            return
        }

        const matchProducto = limpia.match(/(.+?)\s+([\d,.]+)\s*€/)
        if (matchProducto) {
            const nombre = matchProducto[1].replace(/[><\/\\|]/g, '').trim()
            const importe = parseFloat(matchProducto[2].replace(',', '.'))
            if (nombre.toLowerCase().includes('total') && !nombre.toLowerCase().includes('subtotal')) {
                ticket.total = importe
            } else if (
                !['importe', 'producto', 'subtotal'].some(p => nombre.toLowerCase().includes(p)) &&
                nombre.length > 3
            ) {
                ticket.productos.push({ nombre, importe })
            }
        }
    })

    return ticket
}

const resetear = () => {
    ticketInfo.value = null
    archivo.value = null
}
</script>

<template>
    <a-layout class="dashboard-container">
        <HeaderDashboard :user="user"/>

        <a-layout class="dashboard-main-layout">
            <Sidebar :collapsed="collapsed" />

            <a-layout-content class="dashboard-content">
                <a-spin :spinning="cargando" tip="Procesando ticket...">
                    <div class="content-wrapper">

                        <template v-if="!ticketInfo">
                            <a-typography-title :level="2">Sube tu ticket y gana puntos</a-typography-title>
                            <a-typography-paragraph type="secondary">
                                Sube una foto clara de tu ticket para validar tu compra.
                            </a-typography-paragraph>

                            <a-card class="upload-card">
                                <a-row :gutter="[24, 24]" align="middle">

                                    <a-col :xs="24" :md="16">
                                        <a-upload :before-upload="antesDeSubir" accept="image/*" :max-count="1" list-type="picture" :file-list="archivo ? [archivo] : []">
                                            <a-button size="large">
                                                <template #icon>
                                                    <UploadOutlined />
                                                </template>
                                                Seleccionar imagen
                                            </a-button>
                                        </a-upload>
                                    </a-col>

                                    <a-col :xs="24" :md="8">
                                        <a-button class="btnPrincipal" size="large" block :disabled="!archivo" @click="subirTicket">
                                            Subir Ticket
                                        </a-button>
                                    </a-col>

                                </a-row>
                            </a-card>
                        </template>

                        <template v-else>
                            <a-row justify="space-between" align="middle" class="resultado-header">
                                <a-col>
                                    <a-typography-title :level="2">Ticket procesado</a-typography-title>
                                </a-col>
                                <a-col>
                                    <a-button class="btnSecundario" @click="resetear">Subir otro ticket</a-button>
                                </a-col>
                            </a-row>

                            <a-card class="ticket-card">
                                <!-- Cabecera del ticket -->
                                <a-descriptions :column="{ xs: 1, sm: 2 }" bordered>
                                    <a-descriptions-item label="Restaurante">
                                        {{ ticketInfo.restaurante || '—' }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="Dirección">
                                        {{ ticketInfo.direccion || '—' }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="Fecha">
                                        {{ ticketInfo.fecha || '—' }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="Hora">
                                        {{ ticketInfo.hora || '—' }}
                                    </a-descriptions-item>
                                </a-descriptions>

                                <a-divider>Productos</a-divider>

                                <!-- Tabla de productos -->
                                <a-table :data-source="ticketInfo.productos" :pagination="false" row-key="nombre"
                                    size="middle">
                                    <a-table-column title="Producto" data-index="nombre" />
                                    <a-table-column title="Importe" data-index="importe" align="right">
                                        <template #default="{ record }">
                                            {{ record.importe.toFixed(2) }} €
                                        </template>
                                    </a-table-column>
                                </a-table>

                                <a-divider />

                                <!-- Total -->
                                <a-row justify="end">
                                    <a-col>
                                        <a-statistic title="Total" :value="ticketInfo.total" precision="2" suffix="€"
                                            class="ticket-total" />
                                    </a-col>
                                </a-row>
                            </a-card>
                        </template>

                    </div>
                </a-spin>
                
            </a-layout-content>
        </a-layout>
    </a-layout>
    <Footer/>
</template>