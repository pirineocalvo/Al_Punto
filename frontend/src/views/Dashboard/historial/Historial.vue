<script setup>
import './Historial.css';
import { ref, onMounted, computed } from 'vue';
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue';
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { getProductosCompradosCliente, cancelarPedido, misReservas, pedidosRealizadosMarketPlace } from '../../../Services/api';

const user = ref(null);
const collapsed = ref(false);

const tabActiva = ref('reservas');
const acordeonActivo = ref(null);

const listaReservas = ref([]);
const listaPedidos = ref([]);
const listaMarketPlaceReclamado = ref([]);

onMounted(async () => {
    listaPedidos.value = await getProductosCompradosCliente();
    listaReservas.value = await misReservas();
    listaMarketPlaceReclamado.value = await pedidosRealizadosMarketPlace();
    console.log(listaMarketPlaceReclamado.value);
    
});

async function eliminarPedido(pedido) {
    await cancelarPedido(pedido.id);
    listaPedidos.value = await getProductosCompradosCliente();
}

const columns = [
    {
        title: 'Fecha',
        dataIndex: 'reserve_date',
        sorter: (a, b) =>
            String(a.reserve_date ?? '').localeCompare(String(b.reserve_date ?? '')),
    },
    {
        title: 'Hora',
        dataIndex: 'reserve_hour',
        sorter: (a, b) =>
            String(a.reserve_hour ?? '').localeCompare(String(b.reserve_hour ?? '')),
    },
    {
        title: 'Asistentes',
        dataIndex: 'guests',
        sorter: (a, b) => Number(a.guests ?? -1) - Number(b.guests ?? -1),
    },
];
</script>

<template>
    <a-layout>
        <HeaderDashboard :user="user" />

        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />

            <a-tabs v-model:activeKey="tabActiva" style="flex:1; padding: 32px;">
                <a-tab-pane key="reservas" tab="Reservas">
                    <a-table
                        :columns="columns"
                        :data-source="listaReservas"
                        :row-key="record => record.id"
                        :pagination="{ pageSize: 10 }"
                    />
                </a-tab-pane>

                <a-tab-pane key="pedidos" tab="Pedidos">
                    <a-collapse v-model:activeKey="acordeonActivo" accordion>
                        <a-collapse-panel v-for="pedido in listaPedidos" :key="pedido.id">
                            <template #header>
                                <div class="datosTituloAcordeon">
                                    <span>{{ pedido.created_at }}</span>
                                    <a-button
                                        size="small"
                                        type="primary"
                                        ghost
                                        @click.stop="eliminarPedido(pedido)"
                                        v-if="pedido.is_picked_up == 0 && pedido.status == 'pendiente'"
                                    >
                                        Cancelar pedido
                                    </a-button>
                                    <p v-else-if="pedido.status == 'cancelado'">El pedido fue cancelado</p>
                                </div>
                            </template>

                            <p v-for="producto in pedido.items" :key="producto.id ?? producto.product_name">
                                <span>Producto:</span> {{ producto.product_name }};
                                <span>Cantidad:</span> {{ producto.quantity }};
                                <span>Precio unidad:</span> {{ producto.price_at_time }}
                            </p>
                        </a-collapse-panel>
                    </a-collapse>
                </a-tab-pane>
            </a-tabs>
        </a-layout>

        <Footer />
    </a-layout>
</template>