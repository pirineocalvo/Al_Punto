<script setup>
import './Historial.css';
import { ref, onMounted } from 'vue';
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue';
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { getProductosCompradosCliente, cancelarPedido, misReservas, pedidosRealizadosMarketPlace, userInfo } from '../../../Services/api';
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
    console.log(listaMarketPlaceReclamado.value);

    relojActualizarReservas();


});

async function actualizarEstadoReserva() {

}

async function relojActualizarReservas(estado) {
    setInterval(() => {
        if (estado == false) {
            clearInterval();
            console.log("Tiempo terminado");
        }
        console.log('dentro del reloj');
        actualizarEstadoReserva();
    }, 1000);
}
async function eliminarPedido(pedido) {
    await cancelarPedido(pedido.id);
    listaPedidos.value = await getProductosCompradosCliente();
}

</script>
<template>
    <a-layout>
        <HeaderDashboard :user="user" />

        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />

            <a-tabs v-model:activeKey="tabActiva" style="flex:1; padding: 32px;">

                <a-tab-pane key="reservas" tab="Reservas">
                    <a-collapse v-model:activeKey="acordeonActivo" accordion>
                        <a-collapse-panel v-for="reserva in listaReservas" :key="reserva.id">
                            <template #header>
                                <div class="datosTituloAcordeon">
                                    <span>{{ reserva.reserve_date }}</span>
                                    <div v-if="reserva.status == 'booked'">
                                        <a-button>Cancelar</a-button>
                                    </div>
                                    <div v-else-if="reserva.status == 'pending'">
                                        <a-button>Confirmar asistencia</a-button>
                                        <a-button>Cancelar</a-button>
                                    </div>
                                    <a-typography-text>{{ reserva.status }}</a-typography-text>
                                </div>
                            </template>

                            <div>
                                <p><span>Fecha:</span> {{ reserva.reserve_date }}</p>
                                <p><span>Hora:</span> {{ reserva.reserve_hour }}</p>
                                <p><span>Asistentes:</span> {{ reserva.guests }}</p>
                                <p><span>Estado:</span> {{ reserva.status }}</p>
                            </div>
                        </a-collapse-panel>
                    </a-collapse>

                    <a-empty v-if="listaReservas.length === 0" description="No tienes reservas" />
                </a-tab-pane>

                <a-tab-pane key="pedidos" tab="Pedidos">
                    <a-collapse v-model:activeKey="acordeonActivo" accordion>
                        <a-collapse-panel v-for="pedido in listaPedidos" :key="pedido.id">
                            <template #header>
                                <div class="datosTituloAcordeon">
                                    <span>{{ pedido.created_at }}</span>
                                    <a-button size="small" type="primary" ghost @click.stop="eliminarPedido(pedido)"
                                        v-if="pedido.is_picked_up == 0 && pedido.status == 'pendiente'">
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

                    <a-empty v-if="listaPedidos.length === 0" description="No tienes pedidos" />
                </a-tab-pane>
                <a-tab-pane key="marketplace" tab="Marketplace">
                    <a-collapse v-model:activeKey="acordeonActivo" accordion>
                        <a-collapse-panel v-for="market in listaMarketPlaceReclamado" :key="market.id">
                            <template #header>
                                <div class="datosTituloAcordeon">
                                    <span>{{ market.name }}</span>
                                    <a-tag v-if="market.is_used == 0" color="success">Sin canjear</a-tag>
                                    <a-tag v-else color="error">Canjeado el {{ market.used_at }}</a-tag>
                                </div>
                            </template>
                            <span>{{ market.description }}</span>
                        </a-collapse-panel>
                    </a-collapse>

                    <a-empty v-if="listaMarketPlaceReclamado.length === 0" description="No tienes reservas" />
                </a-tab-pane>
            </a-tabs>
        </a-layout>

        <Footer />
    </a-layout>
</template>