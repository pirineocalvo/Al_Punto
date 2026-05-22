<script setup>
import PiePaginaPrincipal from '../../../components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import CabeceraZonaPersonal from '../../../components/componenteDashboard/CabeceraZonaPersonal.vue';
import Sidebar from '../../../components/componenteDashboard/Sidebar.vue';
import { listaProductosMarketplace, canjearProductoMarketplace } from '../../../services/marketplaceEndpoint';
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
        router.push('/iniciarSesion');
    }
}, { immediate: true });

const productosFiltrados = computed(() => listaProductos.value);

function estaDesbloqueado(producto) {
    let nivelUser = 0;
    if (!user.value) return false;
    if (user.value.levelName === 'Oro') {
        nivelUser = 3;
    } else if (user.value.levelName === 'Plata') {
        nivelUser = 2;
    } else {
        nivelUser = 1;
    }
    return nivelUser >= producto.min_level_id;
}

async function adquirirProducto(producto) {
    if (!estaDesbloqueado(producto)) return;
    try {
        await canjearProductoMarketplace(producto.id);
        generarNotificacion('success', 'Canjeo de producto', 'El producto fue canjeado con éxito. Tus puntos se han actualizado.');
    } catch (error) {
        generarNotificacion('error', '¡Advertencia!', 'Hubo un error al canjear el producto. Verifique si tiene puntos suficientes.');
    }
}
</script>

<template>
    <a-layout>
        <CabeceraZonaPersonal :user="user" />
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
                        <a-card :class="{ tarjetaMarketplaceBloqueada: !estaDesbloqueado(producto) }"
                            class="tarjetaMarketplace">
                            <div class="cuerpoTarjetaMarketplace">
                                <a-card-meta :title="producto.name" :description="producto.description" />

                                <div class="pieTarjetaMarketplace">
                                    <div class="colocarNivelYPuntos">
                                        <a-tag>Nivel {{ producto.min_level_id }}+</a-tag>
                                        <span class="puntosMarketplace"><strong>{{ producto.points_price }}
                                                pts</strong></span>
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
        <PiePaginaPrincipal />
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

.tarjetaMarketplaceBloqueada {
    opacity: 0.6;
    filter: grayscale(0.5);
}

.puntosMarketplace {
    font-size: 1.1rem;
}

.tarjetaMarketplace {
    height: 100%;
    transition: transform 0.3s ease;
}

.tarjetaMarketplace :deep(.ant-card-body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
}

.cuerpoTarjetaMarketplace {
    display: flex;
    width: 100%;
    flex-direction: column;
    height: 100%;
    gap: 12px;
}

.pieTarjetaMarketplace {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>