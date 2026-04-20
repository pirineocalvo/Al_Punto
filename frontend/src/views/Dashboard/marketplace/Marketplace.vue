<script setup>
import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { listaProductosMarketplace, cangearProductoMarkePlace } from '../../../Services/api';
import { onMounted, ref, computed } from 'vue';
import './Marketplace.css';
const listaProductos = ref([]);
const nivelUsuario = ref(2);

onMounted(async () => {
    listaProductos.value = await listaProductosMarketplace();
});

const productosFiltrados = computed(() => listaProductos.value);

function estaDesbloqueado(producto) {
    return nivelUsuario.value >= producto.min_level_id;
}

async function adquirirProducto(producto) {
    if (!estaDesbloqueado(producto)) return;
    await cangearProductoMarkePlace(producto.id);
}

</script>

<template>
    <a-layout>
        <HeaderDashboard />
        <a-layout class="dashboardMainLayout">
            <Sidebar />
            <a-layout-content class="mpContent">
                <a-typography-title :level="1">Tienda de recompensas</a-typography-title>
                <a-typography-title :level="3">Canjea tus puntos por premios exclusivos</a-typography-title>

                <a-row :gutter="[16, 16]" class="mpGrid">
                    <a-col v-for="producto in productosFiltrados" :key="producto.id" :xs="24" :sm="12" :md="8" :lg="6">
                        <a-card :class="['mpCard', { mpCardLocked: !estaDesbloqueado(producto) }]">

                            <a-card-meta :title="producto.name" :description="producto.description" />

                            <div class="mpCardFooter">
                                <a-tag>Nivel {{ producto.min_level_id }}+</a-tag>
                                <span class="mpPts">{{ producto.points_price }} pts</span>
                            </div>

                            <a-popconfirm   :disabled="!estaDesbloqueado(producto)" title="¿Seguro que desea adquirir este producto?" ok-text="Sí" cancel-text="No" @confirm="adquirirProducto(producto)" >

                                <a-button block :disabled="!estaDesbloqueado(producto)">
                                    {{ estaDesbloqueado(producto) ? 'Canjear' : 'Bloqueado' }}
                                </a-button>
                            </a-popconfirm>
                        </a-card>
                    </a-col>
                </a-row>

            </a-layout-content>
        </a-layout>
        <Footer />
    </a-layout>
</template>