<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usarProductoMarket, userInfo, getTodosLosPedidosAdmin, updateOrderStatus } from '../../../../Services/api';
import { message } from 'ant-design-vue';
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue';
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue';
import Sidebar from '../../../../Components/componenteDashboard/Sidebar.vue';
import './GestionUsuarios.css';

const router = useRouter();
const user = ref(null);
const collapsed = ref(false);

const tabActiva = ref('pedidos');
const tokenInput = ref('');
const loadingMarket = ref(false);
const listaPedidos = ref([]);

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken');
    if (!token) { router.push('/login'); return; }

    try {
        user.value = await userInfo();
        if (user.value.access_level < 3) {
            router.push('/dashboard');
            return;
        }
        await cargarPedidos();
    } catch {
        router.push('/login');
    }
});

const cargarPedidos = async () => {
    try {
        const res = await getTodosLosPedidosAdmin();
        listaPedidos.value = res;
        console.log();
        
    } catch (err) {
        console.error("Error al cargar pedidos");
    }
};

const cangearProductoMarket = async () => {
    if (!tokenInput.value.trim()) return message.warning('Introduce un código');
    loadingMarket.value = true;
    try {
        const [userId] = tokenInput.value.split('-');
        await usarProductoMarket(userId, tokenInput.value.trim());
        message.success('Canje realizado');
        tokenInput.value = '';
        loadingMarket.value = false;
    } catch (err) {
        message.error('Error al validar');
    }
};

const pedidosPendientes = computed(() => listaPedidos.value.filter(p => p.status === 'pendiente'));
const pedidosListos = computed(() => listaPedidos.value.filter(p => p.status === 'listo'));

const cambiarEstado = async (id, estado, recogido = false) => {
    try {
        await updateOrderStatus(id, estado, recogido);
        message.success(`Pedido #${id} actualizado`);
        await cargarPedidos();
    } catch (err) {
        message.error("Error de actualización");
    }
};
</script>

<template>
    <a-layout style="min-height: 100vh">
        <HeaderDashboard :user="user" />

        <a-layout>
            <Sidebar :collapsed="collapsed" />

            <a-tabs v-model:activeKey="tabActiva" class="colocarAcordeon">

                <a-tab-pane key="pedidos" tab="Gestión de Pedidos">
                    <a-row :gutter="[24, 24]">

                        <a-col :xs="24" :lg="12">
                            <a-divider orientation="left">PENDIENTES DE COCINA</a-divider>
                            <a-space direction="vertical" style="width: 100%" size="middle">
                                <a-empty v-if="pedidosPendientes.length === 0" />
                                <a-card v-for="p in pedidosPendientes" :key="p.id" size="small"
                                    :head-style="{ borderLeft: '4px solid #D97742' }">
                                    <template #title>
                                        <strong>Pedido #{{ p.id }}</strong>
                                        <span class="textoFecha">{{ p.created_at}}</span>
                                    </template>
                                    <a-list size="small" :data-source="p.items">
                                        <template #renderItem="{ item }">
                                            <a-list-item>{{ item.quantity }}x {{ item.product_name }}</a-list-item>
                                        </template>
                                    </a-list>
                                    <a-button type="primary" block @click="cambiarEstado(p.id, 'listo', false)"> MARCAR COMO LISTO</a-button>
                                </a-card>
                            </a-space>
                        </a-col>

                        <!-- COLUMNA LISTOS -->
                        <a-col :xs="24" :lg="12">
                            <a-divider orientation="left">LISTOS PARA ENTREGA</a-divider>
                            <a-space direction="vertical" style="width: 100%" size="middle">
                                <a-empty v-if="pedidosListos.length === 0" />
                                <a-card v-for="p in pedidosListos" :key="p.id" size="small"
                                    :head-style="{ borderLeft: '4px solid #3A9E6F'}">
                                    <template #title>
                                        <strong>Pedido #{{ p.id }}</strong> - <span>{{ p.customer }}</span>
                                    </template>
                                    <a-typography-text strong>Total: {{ p.total_price }}€</a-typography-text>
                                    <a-button type="primary" block @click="cambiarEstado(p.id, 'entregado', true)"class="btnConfirmar">CONFIRMAR ENTREGA</a-button>
                                </a-card>
                            </a-space>
                        </a-col>
                    </a-row>
                </a-tab-pane>

                <!-- TAB 2: MARKETPLACE -->
                <a-tab-pane key="market" tab="Canjear Marketplace">
                    <a-card title="Validación de Premios">
                        <a-typography-paragraph>
                            Introduce el código del cliente para validar el canje del producto.
                        </a-typography-paragraph>
                        <a-input-search v-model:value="tokenInput" placeholder="Código:"
                            enter-button="CANJEAR" size="large" :loading="loadingMarket" @search="cangearProductoMarket" />
                    </a-card>
                </a-tab-pane>

            </a-tabs>
        </a-layout>

        <Footer />
    </a-layout>
</template>