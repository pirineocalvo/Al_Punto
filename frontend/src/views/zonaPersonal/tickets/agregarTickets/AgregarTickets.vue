<script setup>
import { ref, watch } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import { subirTicket } from '../../../../services/ticketsEndpoint';
import CabeceraZonaPersonal from '@/components/componenteDashboard/CabeceraZonaPersonal.vue';
import PiePaginaPrincipal from '@/components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import Sidebar from '../../../../components/componenteDashboard/Sidebar.vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';

const cargado = ref(false);

const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.EMPLEADO });

const collapsed = ref(false);
const cargando = ref(false);
const archivo = ref(null);
const ticketInfo = ref(null);

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

watch(usuarioListo, () => {
    cargado.value = true;
}, { immediate: true });

const antesDeSubir = (file) => {
    archivo.value = file;
    return false;
}

const agregarTicket = async () => {
    if (!archivo.value) {
        generarNotificacion('warning', '¡Advertencia!', 'Debe de subir una imagen clara de su ticket.');
        return;
    }
    cargando.value = true;
    try {
        const formData = new FormData();
        formData.append('imagen', archivo.value);
        const data = await subirTicket(formData);
        
        ticketInfo.value = parsearTicket(data.texto);

        archivo.value = null;
        generarNotificacion('success', '¡Ticket subido!', 'Los puntos del ticket fueron añadidos a su cuenta, para verificarlo acceda a su zona personal.');
    } catch  (error){
        
        generarNotificacion('error', 'Error al subir el ticket', 'Verifique que la imagen es nitida y que pertenece al restaurante.');
    } finally {
        cargando.value = false;
    }
}

const parsearTicket = (textoOcr) => {
    const lineas = textoOcr.split('\n').map(l => l.trim());
    const ticket = { restaurante: '', direccion: '', fecha: '', hora: '', productos: [], total: 0 };

    lineas.forEach(linea => {
        const limpia = linea.replace(/^[^a-zA-Z0-9\[(]+|[^a-zA-Z0-9€)\]]+$/g, '').trim();

        const matchRestaurante = limpia.match(/\[\s*(.*?)\s*\]/);
        if (matchRestaurante) {
            ticket.restaurante = matchRestaurante[1];
            return;
        }

        if (limpia.toLowerCase().includes('fecha')) {
            const matchFecha = limpia.match(/(\d{2}-\d{2}-\d{4})/);
            const matchHora = limpia.match(/(\d{2}:\d{2})/);
            if (matchFecha) ticket.fecha = matchFecha[0];
            if (matchHora) ticket.hora = matchHora[0];
            return;
        }

        if (/Paseo|Calle|Avda|C\/|Plaza/i.test(limpia) || /\d{5}/.test(limpia)) {
            ticket.direccion = limpia.replace(/^[A-Z]\s[—\-]+\s*/, '');
            return;
        }

        const matchProducto = limpia.match(/(.+?)\s+([\d,.]+)\s*€/);
        if (matchProducto) {
            const nombre = matchProducto[1].replace(/[><\/\\|]/g, '').trim();
            const importe = parseFloat(matchProducto[2].replace(',', '.'));
            if (nombre.toLowerCase().includes('total') && !nombre.toLowerCase().includes('subtotal')) {
                ticket.total = importe;
            } else if (
                !['importe', 'producto', 'subtotal'].some(p => nombre.toLowerCase().includes(p)) &&
                nombre.length > 3
            ) {
                ticket.productos.push({ nombre, importe });
            }
        }
    })

    return ticket;
}

const resetear = () => {
    ticketInfo.value = null;
    archivo.value = null;
}
</script>

<template>
    <a-layout class="dashboardMainLayout">
        <CabeceraZonaPersonal :user="user" />

        <a-layout>
            <Sidebar :collapsed="collapsed" />

            <a-layout-content class="colocarContenedorPrincipalDashBoard">
                <a-spin :spinning="cargando" tip="Procesando ticket...">
                    <div class="content-wrapper">

                        <template v-if="!ticketInfo">
                            <a-divider orientation="left">
                                <a-typography-title :level="2">Subir Ticket</a-typography-title>
                            </a-divider>
                            <a-typography-title :level="5">
                                Sube una foto clara de tu ticket para validar tu compra.
                            </a-typography-title>

                            <a-row justify="center">
                                <a-col :xs="24" :sm="18" :md="16" :lg="8">
                                    <a-card class="ticket-card">
                                        <a-row :gutter="[24, 24]" justify="center" align="middle">
                                            <a-col :span="24">
                                                <a-upload-dragger name="file" accept="image/*" :max-count="1"
                                                    :before-upload="antesDeSubir" list-type="picture"
                                                    :file-list="archivo ? [archivo] : []" @remove="resetear">
                                                    <p class="ant-upload-drag-icon">
                                                        <inbox-outlined></inbox-outlined>
                                                    </p>
                                                    <p class="ant-upload-text">Haz click o arrastra la imagen para
                                                        subirla</p>
                                                    <p class="ant-upload-hint">
                                                        Solo se admiten tickets de este establecimiento, recuerde que la
                                                        imagen se debe de poder leer su contenido
                                                    </p>
                                                </a-upload-dragger>
                                            </a-col>

                                            <a-col :span="24">
                                                <a-flex justify="center">
                                                    <a-button type="primary" size="large" :disabled="!archivo"
                                                        @click="agregarTicket">
                                                        Subir Ticket
                                                    </a-button>
                                                </a-flex>
                                            </a-col>
                                        </a-row>
                                    </a-card>
                                </a-col>
                            </a-row>
                        </template>

                        <template v-else>
                            <a-row justify="space-between" align="middle" class="resultado-header">
                                <a-col>
                                    <a-divider orientation="left">
                                        <a-typography-title :level="2">Ticket procesado</a-typography-title>
                                    </a-divider>
                                </a-col>
                                <a-col>
                                    <a-button @click="resetear">Subir otro ticket</a-button>
                                </a-col>
                            </a-row>

                            <a-card class="ticket-card">
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

                                <a-row justify="end">
                                    <a-col>
                                        <a-statistic title="Total" :value="ticketInfo.total" :precision="2" suffix="€"
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
    <PiePaginaPrincipal />
</template>

<style scoped>
.ticket-card {
    border-radius: 16px !important;
    box-shadow: 0 4px 20px rgba(58, 46, 42, 0.07) !important;
    margin-top: 16px;
}

.resultado-header {
    margin-bottom: 8px;
}

.ticket-total :deep(.ant-statistic-content-value) {
    font-size: 2rem !important;
    font-weight: 800 !important;
    color: var(--color-principal) !important;
}
</style>