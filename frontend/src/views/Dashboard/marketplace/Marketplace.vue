<script setup>
import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { listaProductosMarketplace, cangearProductoMarkePlace, userInfo } from '../../../Services/api';
import { notification } from 'ant-design-vue';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';

const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.CLIENTE });

const cargado = ref(false);
const router = useRouter();
const listaProductos = ref([]);

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

watch(usuarioListo, async () => {
    try {
        listaProductos.value = await listaProductosMarketplace();
        cargado.value = true;
    } catch (err) {
        router.push('/login');
    }
}, { immediate: true });

const productosFiltrados = computed(() => listaProductos.value);

function estaDesbloqueado(producto) {
    let nivelUser = 0
    if (!user.value) return false;
    if (user.value.levelName === 'Oro') {
        nivelUser = 3;
    } else if (user.value.levelName === 'Plata') {
        nivelUser = 2;
    } else {
        nivelUser = 1
    }
    return nivelUser >= producto.min_level_id;
}

async function adquirirProducto(producto) {
    if (!estaDesbloqueado(producto)) return;
    try {
        await cangearProductoMarkePlace(producto.id);

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
            <a-flex v-if="cargado == false" vertical align="center" justify="center" class="centrarSpin">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-layout-content v-else class="tarjetaContenido">

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