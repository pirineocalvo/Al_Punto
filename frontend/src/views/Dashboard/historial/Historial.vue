<script setup>
import './Historial.css'
import { ref, onMounted } from 'vue'
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue'
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue'
import { getMenu } from '../../../Services/api'

const user = ref(null);
const collapsed = ref(false);

const tabActiva = ref('reservas');
const acordeonActivo = ref(null);





const pedidos = [
    { key: '1', titulo: 'Pedido #1042 — 05/04/2025', total: '32.50 €', estado: 'Entregado' },
    { key: '2', titulo: 'Pedido #1041 — 01/04/2025', total: '18.00 €', estado: 'Entregado' },
    { key: '3', titulo: 'Pedido #1038 — 28/03/2025', total: '45.75 €', estado: 'Cancelado' },
]

function eliminarPedido(pedido) {
    console.log('Eliminar:', pedido)
}
</script>

<template>
    <a-layout>
        <HeaderDashboard :user="user" />

        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />

            <a-tabs v-model:activeKey="tabActiva" style="flex:1; padding: 32px;">
                <a-tab-pane key="reservas" tab="Reservas">
                    <a-card class="productoCard" size="small" :bodyStyle="{ padding: '14px 16px' }">
                        <div class="productoRow">
                            <a-image :width="72" :preview="false"
                                src="https://i.pinimg.com/originals/ce/e3/e4/cee3e4cebaf12a51e9fc4018f9471e38.png"
                                alt="Patata" class="productoImage" />

                            <div class="productoInfo">
                                <a-space :size="[8, 8]" wrap class="productoHeader">
                                    <a-typography-text strong>
                                        Patatas
                                    </a-typography-text>

                                    <a-tag color="processing">
                                        Disponible
                                    </a-tag>
                                </a-space>

                                <a-typography-paragraph :content="'Patatas compradas por el cliente'"
                                    :ellipsis="{ rows: 1 }" class="productoDescription" />

                                <a-typography-text type="secondary" class="productoSecondary">
                                    Producto de ejemplo
                                </a-typography-text>
                            </div>
                        </div>
                    </a-card>
                </a-tab-pane>

                <a-tab-pane key="pedidos" tab="Pedidos">
                    <a-collapse v-model:activeKey="acordeonActivo" accordion>
                        <a-collapse-panel v-for="pedido in pedidos" :key="pedido.key">
                            <template #header>
                                <div class="datosTituloAcordeon">
                                    <span>{{ pedido.titulo }}</span>
                                    <a-button size="small" type="primary" ghost @click.stop="eliminarPedido(pedido)">
                                        Eliminar pedido
                                    </a-button>
                                </div>
                            </template>

                            <p>Total: {{ pedido.total }}</p>
                            <p>Estado: {{ pedido.estado }}</p>
                        </a-collapse-panel>
                    </a-collapse>
                </a-tab-pane>
            </a-tabs>
        </a-layout>
    </a-layout>
</template>