<script setup>
import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { listaProductosMarketplace, cangearProductoMarkePlace, userInfo } from '../../../Services/api';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router'; 

const user = ref(null); 
const router = useRouter(); 
const listaProductos = ref([]);
const nivelUsuario = ref(2);

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken'); 
    if (!token) { router.push('/login'); return; }        
    try {                                                  
        user.value = await userInfo();                    
    } catch (err) {                                        
        router.push('/login');                             
    }                                                      

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
        <HeaderDashboard :user="user" /> 
        <a-layout class="dashboardMainLayout">
            <Sidebar />
            <a-layout-content class="tarjetaContenido">
                <a-typography-title :level="1">Tienda de recompensas</a-typography-title>
                <a-typography-title :level="3">Canjea tus puntos por premios exclusivos</a-typography-title>

                <a-row :gutter="[16, 16]">
                    <a-col v-for="producto in productosFiltrados" :key="producto.id" :xs="24" :lg="10" :xl="6">
                        <a-card :class="{ mpCardLocked: !estaDesbloqueado(producto) }">

                            <a-card-meta :title="producto.name" :description="producto.description" />

                            <div class="tajetaFooter">
                                <a-tag>Nivel {{ producto.min_level_id }}+</a-tag>
                                <span class="mpPts">{{ producto.points_price }} pts</span>
                            </div>

                            <a-popconfirm :disabled="!estaDesbloqueado(producto)" title="¿Seguro que desea adquirir este producto?" ok-text="Sí" cancel-text="No" @confirm="adquirirProducto(producto)">
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
<style scoped>
.datosTituloAcordeon {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}
.tarjetaContenido {
    padding: 24px;
}

.mpCardLocked {
    opacity: 0.55;
}

.tajetaFooter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 12px 0;
    margin-top: auto;
}

.puntos {
    font-weight: 500;
}

.ant-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.ant-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
}

</style>