<script setup>
import { ref, computed, watch } from 'vue';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined, NumberOutlined } from '@ant-design/icons-vue';
import { usarProductoMarket } from '../../../../services/marketplaceEndpoint';
import { getTodosLosPedidosAdmin, actualizarEstadoOrden, cancelarPedido } from '../../../../services/realizarPedidoEndpoint';
import { obtenerTodasLasReservasAdmin, actualizarEstadoReservaAdmin } from '../../../../services/reservasEndpoint';
import { notification, message } from 'ant-design-vue';
import CabeceraZonaPersonal from '@/components/componenteDashboard/CabeceraZonaPersonal.vue';
import PiePaginaPrincipal from '@/components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import Sidebar from '../../../../components/componenteDashboard/Sidebar.vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';

const cargado = ref(false);
const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.EMPLEADO });

const collapsed = ref(false);
const tabActiva = ref('reservas');
const tokenInput = ref('');
const loadingMarket = ref(false);
const listaPedidos = ref([]);
const listaReservas = ref({});

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

async function cargarPedidos() {
    try {
        const res = await getTodosLosPedidosAdmin();
        listaPedidos.value = res;
    } catch (err) {
        message.error('Error al cargar pedidos');
    }
}

async function cargarReservas() {
    try {
        const res = await obtenerTodasLasReservasAdmin();
        listaReservas.value = res;
    } catch (err) {
        message.error('Error al cargar las reservas');
    }
}

watch(usuarioListo, async () => {
    await Promise.all([cargarPedidos(), cargarReservas()]);
    cargado.value = true;
}, { immediate: true });

async function cangearProductoMarket() {
    const tokenLimpio = tokenInput.value.trim();
    if (!tokenLimpio) {
        generarNotificacion('warning', '¡Advertencia!', 'Introduce un código válido.');
        return;
    }

    if (!tokenLimpio.includes('-')) {
        generarNotificacion('error', 'Código Inválido', 'El formato del token ingresado no es correcto.');
        return;
    }

    loadingMarket.value = true;
    try {
        const [userId] = tokenLimpio.split('-');
        await usarProductoMarket(userId, tokenLimpio);
        generarNotificacion('success', 'Canje de producto marketplace', `El producto ${tokenLimpio} fue canjeado.`);
        tokenInput.value = '';
    } catch (err) {
        generarNotificacion('error', 'Canje de producto marketplace', `El producto ${tokenLimpio} no pudo ser canjeado. Revise si fue bien escrito o si ya fue canjeado.`);
    } finally {
        loadingMarket.value = false;
    }
}

const pedidosPendientes = computed(() => {
    return listaPedidos.value.filter(p => p.status === 'pendiente');
});

const pedidosListos = computed(() => {
    return listaPedidos.value.filter(p => p.status === 'listo');
});

async function cambiarEstado(id, estado, recogido = false) {
    try {
        await actualizarEstadoOrden(id, estado, recogido);
        generarNotificacion('success', 'Pedido actualizado', `Pedido #${id} actualizado correctamente.`);
        await cargarPedidos();
    } catch (err) {
        generarNotificacion('error', 'Error de actualización', `No se pudo actualizar el pedido #${id}.`);
    }
}

async function actualizarReserva(id, estado) {
    try {
        const attended = estado === 'confirmed';
        await actualizarEstadoReservaAdmin(id, estado, attended);
        await cargarReservas();
        generarNotificacion('success', 'Reserva actualizada', `Reserva #${id} actualizada correctamente.`);
    } catch (error) {
        generarNotificacion('error', 'Error de actualización', `No se pudo actualizar la reserva #${id}.`);
    }
}

async function cancelarPedioRealizado(id) {
    try {
        await cancelarPedido(id);
        generarNotificacion('success', 'Pedido cancelado', `Pedido #${id} cancelado correctamente.`);
        await cargarPedidos();
    } catch (err) {
        generarNotificacion('error', 'Error de cancelación', `No se pudo cancelar el pedido #${id}.`);
    }
}

const formatearFecha = (fechaStr) => {
    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
};
</script>

<template>
    <a-layout class="dashboardMainLayout">
        <CabeceraZonaPersonal :user="user" />

        <a-layout>
            <Sidebar :collapsed="collapsed" />
            <a-flex v-if="!cargado" vertical align="center" justify="center" class="centrarSpin">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-layout-content v-else class="colocarContenedorPrincipalDashBoard">
                <a-divider orientation="left">
                    <a-typography-title :level="2">Gestor Usuarios</a-typography-title>
                </a-divider>

                <a-tabs v-model:activeKey="tabActiva">
                    <a-tab-pane key="reservas" tab="Gestionar Reservas">
                        <a-row :gutter="[10, 24]" justify="space-around">
                            <a-empty v-if="!listaReservas.reservations?.length"
                                description="No se encontraron reservas pendientes de gestionar" />
                            <a-col :xl="11" :lg="16" :md="20" :xs="24" v-for="reserva in listaReservas.reservations"
                                :key="reserva.id">
                                <a-card class="card-reserva">
                                    <template #title>
                                        <div class="header-reserva">
                                            <a-avatar class="colorAvatar">
                                                {{ reserva.user_name.charAt(0) }}
                                            </a-avatar>
                                            <div class="info-header">
                                                <span class="nombre-cliente">{{ reserva.user_name }}</span>
                                                <span class="email-cliente">{{ reserva.user_email }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <template #extra>
                                        <a-tag :color="reserva.status === 'confirmed' ? 'green' : 'blue'">
                                            {{ reserva.status === 'confirmed' ? 'ATENDIDO' : 'PENDIENTE' }}
                                        </a-tag>
                                    </template>

                                    <div class="cuerpo-reserva">
                                        <a-row>
                                            <a-col :span="12">
                                                <div class="dato-item">
                                                    <calendar-outlined />
                                                    <strong>Fecha:</strong> {{ formatearFecha(reserva.reserve_date) }}
                                                </div>
                                                <div class="dato-item">
                                                    <clock-circle-outlined />
                                                    <strong>Hora:</strong> {{ reserva.reserve_hour.substring(0, 5) }}
                                                </div>
                                            </a-col>
                                            <a-col :span="12">
                                                <div class="dato-item">
                                                    <team-outlined />
                                                    <strong>Personas:</strong> {{ reserva.guests }}
                                                </div>
                                                <div class="dato-item">
                                                    <number-outlined />
                                                    <strong>ID Reserva:</strong> #{{ reserva.id }}
                                                </div>
                                            </a-col>
                                        </a-row>
                                    </div>

                                    <a-divider />

                                    <div class="acciones-reserva">
                                        <a-space style="width: 100%; justify-content: space-between;">
                                            <a-popconfirm title="¿Marcar como confirmado?" ok-text="Sí" cancel-text="No"
                                                @confirm="actualizarReserva(reserva.id, 'confirmed')">
                                                <a-button type="primary" size="small"
                                                    :disabled="reserva.status === 'confirmed'">
                                                    MARCAR ASISTENCIA
                                                </a-button>
                                            </a-popconfirm>

                                            <a-popconfirm title="¿Cancelar reserva?" ok-text="Sí" cancel-text="No"
                                                @confirm="actualizarReserva(reserva.id, 'cancel')">
                                                <a-button type="link" danger size="small">Cancelar</a-button>
                                            </a-popconfirm>
                                        </a-space>
                                    </div>
                                </a-card>
                            </a-col>
                        </a-row>
                    </a-tab-pane>

                    <a-tab-pane key="pedidos" tab="Gestión de Pedidos">
                        <a-row :gutter="[24, 24]">
                            <a-col :xs="24" :lg="12">
                                <a-divider orientation="left">PENDIENTES DE COCINA</a-divider>
                                <a-space direction="vertical" class="todoElAncho" size="middle">
                                    <a-empty v-if="pedidosPendientes.length === 0"
                                        description="No hay productos pendientes en la cocina" />
                                    <a-card v-for="p in pedidosPendientes" :key="p.id" size="small"
                                        :head-style="{ borderLeft: '4px solid var(--color-principal)' }">
                                        <template #title>
                                            <strong>Pedido #{{ p.id }}</strong>
                                            <span class="textoFecha">{{ p.created_at }}</span>
                                        </template>
                                        <a-list size="small" :data-source="p.items">
                                            <template #renderItem="{ item }">
                                                <a-list-item>{{ item.quantity }}x {{ item.product_name }}</a-list-item>
                                            </template>
                                        </a-list>
                                        <a-row :gutter="[12, 12]">
                                            <a-col :xs="24" :md="24" :xl="10">
                                                <a-button type="primary" block
                                                    @click="cambiarEstado(p.id, 'listo', false)">
                                                    MARCAR ASISTENCIA
                                                </a-button>
                                            </a-col>
                                            <a-col :xs="24" :md="24" :xl="10">
                                                <a-popconfirm title="¿Estás seguro?" ok-text="Sí" cancel-text="No"
                                                    @confirm="cancelarPedioRealizado(p.id)">
                                                    <a-button block>CANCELAR PEDIDO</a-button>
                                                </a-popconfirm>
                                            </a-col>
                                        </a-row>
                                    </a-card>
                                </a-space>
                            </a-col>

                            <a-col :xs="24" :lg="12">
                                <a-divider orientation="left">LISTOS PARA ENTREGA</a-divider>
                                <a-space direction="vertical" class="todoElAncho" size="middle">
                                    <a-empty v-if="pedidosListos.length === 0"
                                        description="No hay productos personalizados listos para la entrega" />
                                    <a-card v-for="p in pedidosListos" :key="p.id" size="small"
                                        :head-style="{ borderLeft: '4px solid var(--color-exito)' }">
                                        <template #title>
                                            <strong>Pedido #{{ p.id }}</strong> - <span>{{ p.customer }}</span>
                                        </template>
                                        <a-typography-text strong>Total: {{ p.total_price }}€</a-typography-text>
                                        <a-button type="primary" block @click="cambiarEstado(p.id, 'entregado', true)"
                                            class="btnConfirmar">CONFIRMAR ENTREGA</a-button>
                                    </a-card>
                                </a-space>
                            </a-col>
                        </a-row>
                    </a-tab-pane>

                    <a-tab-pane key="market" tab="Canjear Marketplace">
                        <a-card title="Validación de Premios">
                            <a-typography-paragraph>
                                Introduce el código del cliente para validar el canje del producto.
                            </a-typography-paragraph>
                            <a-input-search v-model:value="tokenInput" placeholder="Código:" enter-button="CANJEAR"
                                size="large" :loading="loadingMarket" @search="cangearProductoMarket" />
                        </a-card>
                    </a-tab-pane>
                </a-tabs>
            </a-layout-content>
        </a-layout>

        <PiePaginaPrincipal />
    </a-layout>
</template>

<style scoped>
.colorAvatar{
    background-color: var(--color-principal);
}
.textoFecha {
    float: right;
    font-weight: normal;
    font-size: 12px;
}

.btnConfirmar {
    margin-top: 10px;
    background-color: var(--color-exito);
    border: none;
}

.btnConfirmar:hover {
    background-color: var(--color-exito-hover) !important;
}

.btnConfirmar:active {
    background-color: var(--color-exito-active) !important;
}

.todoElAncho {
    width: 100%;
}

.card-reserva {
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.card-reserva:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-reserva {
    display: flex;
    align-items: center;
    gap: 12px;
}

.info-header {
    display: flex;
    flex-direction: column;
}

.nombre-cliente {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-texto-oscuro);
    line-height: 1.2;
}

.email-cliente {
    font-size: 11px;
    color: var(--color-texto-suave);
}

.dato-item {
    font-size: 13px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.cuerpo-reserva {
    padding: 4px 0;
}
</style>