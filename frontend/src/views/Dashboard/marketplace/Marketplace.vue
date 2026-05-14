<script setup>
import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { listaProductosMarketplace, cangearProductoMarkePlace, userInfo } from '../../../Services/api';
import { notification } from 'ant-design-vue';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const router = useRouter();
const listaProductos = ref([]);

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken');
    if (!token) { router.push('/login'); return; }
    try {
        user.value = await userInfo();
        listaProductos.value = await listaProductosMarketplace();
    } catch (err) {
        router.push('/login');
    }
});

const productosFiltrados = computed(() => listaProductos.value);

function estaDesbloqueado(producto) {
    if (!user.value) return false;
    
    return user.value.level_id >= producto.min_level_id;
}

async function adquirirProducto(producto) {
    if (!estaDesbloqueado(producto)) return;
    try {
        await cangearProductoMarkePlace(producto.id);
        user.value = await userInfo();

        generarNotificacion('success', 'Canjeo de producto', 'El producto fue canjeado con éxito. Tus puntos se han actualizado.');
    } catch (error) {
        generarNotificacion('error', '¡Advertencia!', 'Hubo un error al canjear el producto. Verifique si tiene puzntos suficientes.');
    }
}
</script>

<template>
    <a-layout>
        <HeaderDashboard :user="user" />
        <a-layout class="dashboardMainLayout">
            <Sidebar />
            <a-layout-content class="tarjetaContenido">

                <a-divider orientation="left">
                    <a-typography-title :level="2">Tienda de recompensas</a-typography-title>
                </a-divider>
                <a-typography-title :level="5">Canjea tus puntos por premios exclusivos</a-typography-title>

                <a-row :gutter="[16, 16]">
                    <a-col v-for="producto in productosFiltrados" :key="producto.id" :xs="24" :xl="6">
                        <a-card :class="{ mpCardLocked: !estaDesbloqueado(producto) }" class="mpCard">
                            <div class="mpCardBody">
                                <a-card-meta :title="producto.name" :description="producto.description" />

                                <div class="mpCardFooter">
                                    <div class="colocarNivelYPuntos">
                                        <a-tag>Nivel {{ producto.min_level_id }}+</a-tag>
                                        <span class="mpPts"><strong>{{ producto.points_price }} pts</strong></span>
                                    </div>

                                    <a-popconfirm :disabled="!estaDesbloqueado(producto)"
                                        title="¿Seguro que desea adquirir este producto?" ok-text="Sí" cancel-text="No"
                                        @confirm="adquirirProducto(producto)">
                                        <a-button block :type="estaDesbloqueado(producto) ? 'primary' : 'default'"
                                            :disabled="!estaDesbloqueado(producto)">
                                            {{ estaDesbloqueado(producto) ? 'Canjear' : 'Nivel insuficiente' }}
                                        </a-button>
                                    </a-popconfirm>
                                </div>
                            </div>
                        </a-card>
                    </a-col>
                </a-row>

            </a-layout-content>
        </a-layout>
        <Footer />
    </a-layout>
</template>

<style scoped>
.colocarNivelYPuntos {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tarjetaContenido {
    padding: 24px;
}

.mpCardLocked {
    opacity: 0.6;
    filter: grayscale(0.5);
}

.mpPts {
    font-size: 1.1rem;
}

.mpCard {
    height: 100%;
    transition: transform 0.3s ease;
}

.mpCard:hover:not(.mpCardLocked) {
    transform: translateY(-5px);
}

.mpCard :deep(.ant-card-body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
}

.mpCardBody {
    display: flex;
    width: 100%;
    flex-direction: column;
    height: 100%;
    gap: 12px;
}

.mpCardFooter {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>