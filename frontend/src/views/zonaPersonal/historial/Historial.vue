<script setup>
import { ref, watch } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import CabeceraZonaPersonal from '@/components/componenteDashboard/CabeceraZonaPersonal.vue';
import PiePaginaPrincipal from '@/components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import Sidebar from '../../../components/componenteDashboard/Sidebar.vue';
import { obtenerMisPedidos, cancelarPedido } from '../../../services/realizarPedidoEndpoint';
import { pedidosRealizadosMarketPlace } from '../../../services/marketplaceEndpoint';
import { misReservas, cancelarReserva } from '../../../services/reservasEndpoint';
import { message, notification } from 'ant-design-vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';

const cargado = ref(false);

const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.CLIENTE });

const collapsed = ref(false);

const tabActiva = ref('reservas');
const acordeonActivo = ref(null);

const listaReservas = ref([]);
const listaPedidos = ref([]);
const listaMarketPlaceReclamado = ref([]);

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

watch(usuarioListo, async () => {
    try {
        const [pedidos, reservas, marketplace] = await Promise.all([
            obtenerMisPedidos(),
            misReservas(),
            pedidosRealizadosMarketPlace()
        ]);

        const pedidosOrdenados = pedidos.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });
        listaPedidos.value = pedidosOrdenados;
        
        listaReservas.value = reservas;
        listaMarketPlaceReclamado.value = marketplace;
    } catch (err) {
        message.error(`Error cargando datos: ${err}`);
    } finally {
        cargado.value = true;
    }
}, { immediate: true });

async function eliminarPedido(pedido) {
    try {
        await cancelarPedido(pedido.id);
        generarNotificacion('success', 'Pedido cancelado', `El pedido del ${pedido.created_at} ha sido cancelado correctamente.`);
        listaPedidos.value = await obtenerMisPedidos();
    } catch (err) {
        generarNotificacion('error', 'Error al cancelar', 'No se pudo cancelar el pedido. Inténtalo más tarde.');
    }
}

async function pararReserva(reserva) {
    try {
        await cancelarReserva(reserva.id);
        generarNotificacion('success', 'Reserva cancelada', `Tu reserva para el día ${reserva.reserve_date} ha sido anulada.`);
        listaReservas.value = await misReservas();
    } catch (err) {
        generarNotificacion('error', 'Error al cancelar', 'Hubo un problema al cancelar tu reserva.');
    }
}

const formatearFecha = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString();
};
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
                <a-divider orientation="left">
                    <a-typography-title :level="2">Historial</a-typography-title>
                </a-divider>
                <a-typography-title :level="5">
                    Consulte sus reservas, pedidos y los productos del marketplace canjeados
                </a-typography-title>
                <a-tabs v-model:activeKey="tabActiva">

                    <a-tab-pane key="reservas" tab="Reservas">
                        <a-collapse v-model:activeKey="acordeonActivo" accordion>
                            <a-collapse-panel v-for="reserva in listaReservas" :key="reserva.id">
                                <template #header>
                                    <a-row class="datosTituloAcordeon" :gutter="[6, 12]" justify="space-between">
                                        <a-col :xs="24" :lg="11">
                                            <span>{{formatearFecha(reserva.reserve_date)}}</span>
                                        </a-col>
                                        <a-col :xs="24" :lg="11" class="etiquetaDerecha">
                                            <a-tag v-if="reserva.status === 'confirmed'" color="lime">Atendido</a-tag>
                                            <a-tag v-else-if="reserva.status === null" color="purple">Pendiente</a-tag>
                                            <a-tag v-else color="red">Cancelado</a-tag>
                                        </a-col>
                                    </a-row>
                                </template>
                                <a-row :gutter="[6, 12]">
                                    <a-col :xs="24"><a-typography-text strong>Fecha:</a-typography-text> {{
                                        reserva.reserve_date }}</a-col>
                                    <a-col :xs="24"><a-typography-text strong>Hora:</a-typography-text> {{
                                        reserva.reserve_hour }}</a-col>
                                    <a-col :xs="24"><a-typography-text strong>Asistentes:</a-typography-text> {{
                                        reserva.guests }}</a-col>
                                    <a-col :xs="24" v-if="reserva.status === null">
                                        <a-popconfirm title="¿Cancelar reserva?" @confirm="pararReserva(reserva)"
                                            ok-text="Sí" cancel-text="No">
                                            <template #icon>
                                                <QuestionCircleOutlined />
                                            </template>
                                            <a-button type="primary">Cancelar reserva</a-button>
                                        </a-popconfirm>
                                    </a-col>
                                </a-row>
                            </a-collapse-panel>
                        </a-collapse>
                        <a-empty v-if="listaReservas.length === 0" description="No tienes reservas" />
                    </a-tab-pane>

                    <a-tab-pane key="pedidos" tab="Pedidos">
                        <a-collapse v-model:activeKey="acordeonActivo" accordion>
                            <a-collapse-panel v-for="pedido in listaPedidos" :key="pedido.id">
                                <template #header>
                                    <a-row class="datosTituloAcordeon" :gutter="[6, 12]">
                                        <a-col :xs="24" :lg="11">
                                            <span>{{ formatearFecha(pedido.created_at) }}</span>
                                        </a-col>
                                        <a-col :xs="24" :lg="11" class="etiquetaDerecha">
                                            <a-tag color="purple" v-if="pedido.status === 'pendiente'">Pendiente de
                                                preparación</a-tag>
                                            <a-tag color="purple"
                                                v-else-if="pedido.status === 'listo'">Preparado</a-tag>
                                            <a-tag color="red"
                                                v-else-if="pedido.status === 'cancelado'">Cancelado</a-tag>
                                            <a-tag color="lime" v-else>Entregado</a-tag>
                                        </a-col>
                                    </a-row>
                                </template>
                                <a-row :gutter="[6, 12]">
                                    <a-col :xs="24" v-for="producto in pedido.items"
                                        :key="producto.id ?? producto.product_name">
                                        <span><a-typography-text strong>Producto:</a-typography-text> {{
                                            producto.product_name }}</span> |
                                        <span><a-typography-text strong>Cantidad:</a-typography-text> {{
                                            producto.quantity }}</span> |
                                        <span><a-typography-text strong>Precio:</a-typography-text> {{
                                            producto.price_at_time }}€</span>
                                    </a-col>
                                    <a-col :xs="24" v-if="pedido.is_picked_up == 0 && pedido.status === 'pendiente'">
                                        <a-popconfirm title="¿Cancelar pedido?" @confirm="eliminarPedido(pedido)"
                                            ok-text="Sí" cancel-text="No">
                                            <template #icon>
                                                <QuestionCircleOutlined />
                                            </template>
                                            <a-button type="primary">Cancelar pedido</a-button>
                                        </a-popconfirm>
                                    </a-col>
                                </a-row>
                            </a-collapse-panel>
                        </a-collapse>
                        <a-empty v-if="listaPedidos.length === 0" description="No tienes pedidos" />
                    </a-tab-pane>

                    <a-tab-pane key="marketplace" tab="Marketplace">
                        <a-collapse v-model:activeKey="acordeonActivo" accordion>
                            <a-collapse-panel v-for="market in listaMarketPlaceReclamado" :key="market.id">
                                <template #header>
                                    <a-row class="datosTituloAcordeon" :gutter="[6, 12]">
                                        <a-col :xs="24" :lg="11">
                                            <span>{{ market.name }}</span>
                                        </a-col>
                                        <a-col :xs="24" :lg="11" class="etiquetaDerecha">
                                            <a-tag v-if="market.is_used == 0" color="lime">Sin canjear</a-tag>
                                            <a-tag v-else color="red">Canjeado el {{ market.used_at }}</a-tag>
                                        </a-col>
                                    </a-row>
                                </template>
                                <a-row :gutter="[6, 12]">
                                    <a-col :xs="24"><span>{{ market.description }}</span></a-col>
                                    <a-col :xs="24"><span>Código: <a-tag><a-typography-text copyable>{{ market.token_url
                                                    }}</a-typography-text></a-tag></span></a-col>
                                </a-row>
                            </a-collapse-panel>
                        </a-collapse>
                        <a-empty v-if="listaMarketPlaceReclamado.length === 0"
                            description="No tienes productos de marketplace" />
                    </a-tab-pane>

                </a-tabs>
            </a-layout-content>
        </a-layout>
        <PiePaginaPrincipal />
    </a-layout>
</template>

<style scoped>
.etiquetaDerecha {
    text-align: right;
}

.datosTituloAcordeon span {
    font-weight: 500;
}
</style>