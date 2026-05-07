<script setup>
import { ref, onMounted } from 'vue';
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue';
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { getProductosCompradosCliente, cancelarPedido, misReservas, pedidosRealizadosMarketPlace, cancelarReserva, userInfo } from '../../../Services/api';
import { useRouter } from 'vue-router';

const user = ref(null);
const collapsed = ref(false);
const router = useRouter();

const tabActiva = ref('reservas');
const acordeonActivo = ref(null);

const listaReservas = ref([]);
const listaPedidos = ref([]);
const listaMarketPlaceReclamado = ref([]);

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken');
    if (!token) { router.push('/login'); return; }
    try {
        user.value = await userInfo();
    } catch (err) {
        router.push('/login');
    }

    listaPedidos.value = await getProductosCompradosCliente();
    listaReservas.value = await misReservas();
    listaMarketPlaceReclamado.value = await pedidosRealizadosMarketPlace();
});


async function eliminarPedido(pedido) {
    await cancelarPedido(pedido.id);
    listaPedidos.value = await getProductosCompradosCliente();
}

async function pararReserva(reserva) {
    await cancelarReserva(reserva.id);
    listaReservas.value = await misReservas();
}
</script>
<template>
    <a-layout>
        <HeaderDashboard :user="user" />

        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />

            <a-tabs v-model:activeKey="tabActiva" class="colocarContenedorPrincipalDashBoard">

                <a-tab-pane key="reservas" tab="Reservas">
                    <a-collapse v-model:activeKey="acordeonActivo" accordion>
                        <a-collapse-panel v-for="reserva in listaReservas" :key="reserva.id">
                            <template #header>
                                <a-row class="datosTituloAcordeon" :gutter="[6, 12]" justify="space-between">
                                    <a-col :xs="24" :lg="11">
                                        <span>{{ reserva.reserve_date }}</span>
                                    </a-col>
                                    <a-col :xs="24" :lg="11" class="tagDerecha">
                                        <a-tag v-if="reserva.status == 'attended'" color="lime">Atendido</a-tag>
                                        <a-tag v-else-if="reserva.status == null" color="purple">Pendiente</a-tag>
                                        <a-tag v-else color="red">Cancelado</a-tag>
                                    </a-col>
                                </a-row>
                            </template>
                            <a-row :gutter="[6, 12]">
                                <a-col :xs="24"><span>Fecha:</span> {{ reserva.reserve_date }}</a-col>
                                <a-col :xs="24"><span>Hora:</span> {{ reserva.reserve_hour }}</a-col>
                                <a-col :xs="24"><span>Asistentes:</span> {{ reserva.guests }}</a-col>
                                <a-col :xs="24" v-if="reserva.status == null">
                                    <a-button @click="pararReserva(reserva)">Cancelar reserva</a-button>
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
                                        <span>{{ pedido.created_at }}</span>
                                    </a-col>
                                    <a-col :xs="24" :lg="11" class="tagDerecha">
                                        <a-tag color="purple" v-if="pedido.status == 'pendiente'">Pedido pendiente de
                                            preparación</a-tag>
                                        <a-tag color="purple" v-else-if="pedido.status == 'listo'">Pedido
                                            preparado</a-tag>
                                        <a-tag color="red" v-else-if="pedido.status == 'cancelado'">El pedido fue
                                            cancelado</a-tag>
                                        <a-tag color="lime" v-else>El pedido fue entregado</a-tag>
                                    </a-col>
                                </a-row>
                            </template>
                            <a-row :gutter="[6, 12]">
                                <a-col :xs="24" v-for="producto in pedido.items"
                                    :key="producto.id ?? producto.product_name">
                                    <span>Producto:</span> {{ producto.product_name }};
                                    <span>Cantidad:</span> {{ producto.quantity }};
                                    <span>Precio unidad:</span> {{ producto.price_at_time }}
                                </a-col>
                                <a-col :xs="24" v-if="pedido.is_picked_up == 0 && pedido.status == 'pendiente'" >
                                    <a-button @click.stop="eliminarPedido(pedido)">Cancelar pedido</a-button>
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
                                    <a-col :xs="24" :lg="11" class="tagDerecha">
                                        <a-tag v-if="market.is_used == 0" color="lime">Sin canjear</a-tag>
                                        <a-tag v-else color="red">Canjeado el {{ market.used_at }}</a-tag>
                                    </a-col>
                                </a-row>
                            </template>
                            <a-row :gutter="[6, 12]">
                                <a-col :xs="24"><span>{{ market.description }}</span></a-col>
                                <a-col :xs="24"><span>Código del producto: <a-tag>{{ market.token_url}}</a-tag></span></a-col>
                            </a-row>
                        </a-collapse-panel>
                    </a-collapse>
                    <a-empty v-if="listaMarketPlaceReclamado.length === 0" description="No tienes reservas" />
                </a-tab-pane>

            </a-tabs>
        </a-layout>

        <Footer />
    </a-layout>
</template>
<style scoped>

.tagDerecha{
    text-align: right;
}
</style>