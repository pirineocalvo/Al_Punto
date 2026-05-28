<script setup>
import { ref, watch } from 'vue';
import { misTickets } from '../../../../services/ticketsEndpoint';
import { message } from 'ant-design-vue';
import Sidebar from '../../../../components/componenteDashboard/Sidebar.vue';
import CabeceraZonaPersonal from '@/components/componenteDashboard/CabeceraZonaPersonal.vue';
import PiePaginaPrincipal from '@/components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import { CalendarOutlined, ClockCircleOutlined, EuroCircleOutlined, StarOutlined, EnvironmentOutlined } from '@ant-design/icons-vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';

const cargado = ref(false);
const { user, usuarioListo, refrescarUsuario } = useAuth({ minAccessLevel: ACCESS_LEVELS.CLIENTE });
const tickets = ref([]);
const collapsed = ref(false);

function limpiarDatosTicket(ticketSinProcesar) {
    if (!ticketSinProcesar) return '';
    return ticketSinProcesar
        .replace(/[^\w\s€:.,()|\-\n/áéíóúÁÉÍÓÚñÑ]/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .trim();
}

const extraer = (text, regex, grupo = 1) =>
    text.match(regex)?.[grupo] ?? null;

const extraerImporte = (text, regex) => {
    const valor = extraer(text, regex);
    return valor ? parseFloat(valor.replace(',', '.')) : null;
};

const extraerUltimoImporte = (text) => {
    const coincidencias = [...text.matchAll(/([\d]+[.,][\d]{1,2})\s*€/gi)];
    if (!coincidencias.length) return 0;
    return parseFloat(coincidencias[coincidencias.length - 1][1].replace(',', '.'));
};

const extraerProductos = (text) => {
    const lineas = text.split('\n');
    const resultados = [];

    for (const linea of lineas) {
        const match = linea.match(/^(.+?)\s+(\d{1,4})\s+([\d,.]+)\s*€?\s+([\d,.]+)\s*€/);
        if (!match) continue;

        const nombre = match[1]
            .replace(/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ]+/, '')
            .trim();

        if (/total|subtotal|fecha|hora|dato|unit|cant|producto/i.test(nombre)) continue;
        if (nombre.length < 2) continue;

        resultados.push({
            nombre,
            cantidad: parseInt(match[2]),
            precio: parseFloat(match[3].replace(',', '.')),
            importe: parseFloat(match[4].replace(',', '.')),
        });
    }

    return resultados;
};

const RESTAURANTES_CONOCIDOS = ['AL PUNTO'];

function extraerdatosTicket(ticketLimpio) {
    if (!ticketLimpio) return {};

    let restaurante = '';
    const matchCorchete = ticketLimpio.match(/\[\s*([A-ZÁÉÍÓÚÑ\s]+?)\s*\]/);
    if (matchCorchete) {
        restaurante = matchCorchete[1].trim();
    } else {
        const matchMayus = ticketLimpio.match(/\b([A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ0-9]{2,})+)\b/);
        if (matchMayus) restaurante = matchMayus[1].trim();
    }
    const normalizado = RESTAURANTES_CONOCIDOS.find(r => restaurante.toUpperCase().includes(r));
    if (normalizado) restaurante = normalizado;

    return {
        tipo: 'Ticket OCR',
        restaurante,
        total: extraerUltimoImporte(ticketLimpio),
        subtotal: extraerImporte(ticketLimpio, /subtotal[:\s]*([\d,.]+)\s*€/i),
        fecha: extraer(ticketLimpio, /(\d{2}[-\/]\d{2}[-\/]\d{4})/),
        hora: extraer(ticketLimpio, /hora[:\s]*([\d:]{4,5})/i),
        direccion: extraer(ticketLimpio, /((?:calle|paseo|avda|avenida)[^,\n]+,\s*\d+)/i, 1),
        productos: extraerProductos(ticketLimpio),
    };
}
function prepararTickets(ticketsUsuarioSinProcesar) {
    tickets.value = ticketsUsuarioSinProcesar
        .map(ticketSinProcesar => {
            const ticketLimpio = limpiarDatosTicket(ticketSinProcesar.ocr_content);
            const datosTicket = extraerdatosTicket(ticketLimpio);
            return datosTicket ? { ...ticketSinProcesar, parsed: datosTicket } : null;
        })
        .filter(Boolean);
}

const separarFechaHora = (fecha) => {
    if (!fecha) return { fecha: '—', hora: '—' };
    const [f, h] = fecha.split(' ');
    return { fecha: f, hora: h || '—' };
};

watch(usuarioListo, async () => {
    try {
        const data = await misTickets();
        prepararTickets(data);
        await refrescarUsuario();
    } catch (error) {
        message.error('Error al cargar los tickets');
        console.error(error);
    } finally {
        cargado.value = true;
    }
}, { immediate: true });

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
        <CabeceraZonaPersonal :user="user" />
        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />
            <a-flex v-if="!cargado" class="centrarSpin ajustarSpinner">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-row v-else class="colocarContenedorPrincipalDashBoard">
                <a-col :xs="24" :md="20" :lg="24">
                    <a-divider orientation="left">
                        <a-typography-title :level="2">Mis tickets</a-typography-title>
                    </a-divider>
                    <a-empty v-if="tickets.length === 0" description="No tienes tickets todavía" />
                    <a-collapse v-else accordion>
                        <a-collapse-panel v-for="ticket in tickets" :key="ticket.id">

                            <template #header>
                                <a-space size="middle" wrap>
                                    <a-typography-text>
                                        <calendar-outlined />
                                        {{ separarFechaHora(ticket.created_at).fecha }}
                                    </a-typography-text>

                                    <a-typography-text type="secondary">
                                        <clock-circle-outlined />
                                        {{ separarFechaHora(ticket.created_at).hora }}
                                    </a-typography-text>

                                    <a-typography-text strong>
                                        <euro-circle-outlined />
                                        {{ ticket.parsed.total?.toFixed(2) || '0.00' }} €
                                    </a-typography-text>

                                    <a-typography-text type="warning">
                                        <star-outlined />
                                        {{ ticket.points_granted || 0 }} pts
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

                                <a-descriptions-item>
                                    <template #label><environment-outlined /> Dirección</template>
                                    {{ ticket.parsed.direccion || '—' }}
                                </a-descriptions-item>
                            </a-descriptions>

                            <a-table v-if="ticket.parsed.productos?.length" :dataSource="ticket.parsed.productos"
                                :pagination="false" size="small" :columns="columnasProductos" />
                        </a-collapse-panel>
                    </a-collapse>
                </a-col>
            </a-row>
        </a-layout>
        <PiePaginaPrincipal />
    </a-layout>
</template>

<style scoped>
.ajustarSpinner {
    align-items: center;
    justify-content: center;
}
</style>