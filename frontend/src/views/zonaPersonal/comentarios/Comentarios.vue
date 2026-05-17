<script setup>
import PiePaginaPrincipal from '../../../components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import CabeceraZonaPersonal from '../../../components/componenteDashboard/CabeceraZonaPersonal.vue';
import Sidebar from '../../../components/componenteDashboard/Sidebar.vue';
import { getMyReviews, userInfo, getProductosCompradosCliente, addReview, getMenu } from '../../../services/api';
import { onMounted, ref, computed, watch } from 'vue';
import { message, notification } from 'ant-design-vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';

const cargado = ref(false);

const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.EMPLEADO });

const listaResenias = ref([]);
const productosComprados = ref([]);
const menuCompleto = ref([]);
const keyLab = ref('1');

const estadoModal = ref(false);
const confirmLoading = ref(false);

const formModal = ref({
    id_plato: null,
    plato_name: '',
    puntuacion: 0,
    descripcion: ''
});

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

const datosModal = (producto) => {
    const platoEnMenu = menuCompleto.value.find(
        p => p.name.toLowerCase().trim() === producto.product_name.toLowerCase().trim()
    );

    formModal.value.id_plato = platoEnMenu?.id ?? null;
    formModal.value.plato_name = producto.product_name;
    formModal.value.puntuacion = 0;
    formModal.value.descripcion = '';

    if (!formModal.value.id_plato) {
        generarNotificacion('error', 'Error de sistema', 'No se pudo encontrar la referencia del plato para crear la reseña.');
        return;
    }

    estadoModal.value = true;
};

const guardarResenia = async () => {
    if (formModal.value.puntuacion === 0) {
        generarNotificacion('warning', 'Puntuación requerida', 'Por favor, selecciona una cantidad de estrellas.');
        return;
    }
    if (!formModal.value.descripcion || formModal.value.descripcion.trim().length < 5) {
        generarNotificacion('warning', 'Comentario demasiado corto', 'Cuéntanos un poco más sobre tu experiencia con el plato.');
        return;
    }

    confirmLoading.value = true;
    try {
        const res = await addReview({
            id_plato: formModal.value.id_plato,
            descripcion: formModal.value.descripcion,
            puntuacion: formModal.value.puntuacion
        });

        generarNotificacion('success', '¡Reseña publicada!', res.reward || 'Se han añadido puntos a tu cuenta.');

        estadoModal.value = false;

        [user.value, listaResenias.value, productosComprados.value] = await Promise.all([
            userInfo(),
            getMyReviews(),
            getProductosCompradosCliente()
        ]);

    } catch (err) {
        generarNotificacion('error', 'Error al publicar', 'Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
        console.error(err);
    } finally {
        confirmLoading.value = false;
    }
};

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken');
    if (!token) { router.push('/iniciarSesion'); return; }


});

watch(usuarioListo, async () => {
    try {
        [user.value, listaResenias.value, productosComprados.value, menuCompleto.value] = await Promise.all([
            userInfo(),
            getMyReviews(),
            getProductosCompradosCliente(),
            getMenu()
        ]);
    } catch (err) {
        message.error("Error cargando datos:", err);
    }finally{
        cargado.value = true;
    }

}, { immediate: true });

const reseniasHechas = computed(() => listaResenias.value);

const reseniasPendientes = computed(() => {
    const nombresReseniados = listaResenias.value.map(r => r.plato_name.toLowerCase().trim());
    const productosPendientes = [];
    const yaAgregadosALista = new Set();

    productosComprados.value.forEach(pedido => {
        if (pedido.status === 'entregado') {
            pedido.items.forEach(item => {
                const nombreLimpio = item.product_name.toLowerCase().trim();
                const yaReseniado = nombresReseniados.includes(nombreLimpio);
                const enListaTemporal = yaAgregadosALista.has(nombreLimpio);

                if (!yaReseniado && !enListaTemporal) {
                    productosPendientes.push(item);
                    yaAgregadosALista.add(nombreLimpio);
                }
            });
        }
    });
    return productosPendientes;
});

const formatearFecha = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString();
};
</script>

<template>
    <a-layout class="dashboardMainLayout">
        <CabeceraZonaPersonal :user="user" />
        <a-layout class="dashboardMainLayout">
            <Sidebar />
            <a-flex v-if="!cargado"
                vertical align="center" justify="center" class="centrarSpin">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-layout-content v-else class="colocarContenedorPrincipalDashBoard">
                <a-divider orientation="left">
                    <a-typography-title :level="2">Comentarios</a-typography-title>
                </a-divider>
                <a-typography-title :level="5">Hecha un vistazo a tus comentarios o comenta un nuevo plato que hayas
                    probado</a-typography-title>
                <a-tabs v-model:activeKey="keyLab">
                    <a-tab-pane key="1" tab="Mis Reseñas Realizadas">
                        <a-row :gutter="[16, 16]">
                            <a-col v-for="resenia in reseniasHechas" :key="resenia.id" :xs="24" :md="12" :lg="8">
                                <a-card class="mpCard">
                                    <template #cover>
                                        <img :alt="resenia.plato_name" :src="'images/plates/' + resenia.plato_img"
                                            class="tarjetaImg" />
                                    </template>
                                    <a-card-meta :title="resenia.plato_name">
                                        <template #description>
                                            <p class="reseniaTexto">"{{ resenia.descripcion }}"</p>
                                        </template>
                                    </a-card-meta>
                                    <div class="tarjetaPiePaginaPrincipal">
                                        <a-rate :value="resenia.puntuacion" disabled />
                                        <div>
                                            <a-tag color="orange">{{ formatearFecha(resenia.created_at) }}</a-tag>
                                        </div>
                                    </div>
                                </a-card>
                            </a-col>
                        </a-row>
                        <a-empty v-if="reseniasHechas.length === 0"
                            description="No has realizado ninguna reseña aún." />
                    </a-tab-pane>

                    <a-tab-pane key="2" tab="Pendientes de Calificar">
                        <a-row :gutter="[16, 16]">
                            <a-col v-for="producto in reseniasPendientes" :key="producto.id" :xs="24" :md="12" :lg="8">
                                <a-card class="mpCard pendingCard">
                                    <template #cover>
                                        <img :alt="producto.product_name" :src="'images/plates/' + producto.img_src"
                                            class="tarjetaImg" />
                                    </template>
                                    <a-card-meta :title="producto.product_name">
                                        <template #description>
                                            <a-typography-text type="secondary">Aún no has valorado este
                                                plato.</a-typography-text>
                                        </template>
                                    </a-card-meta>
                                    <div class="separarBtn">
                                        <a-button block type="primary" @click="datosModal(producto)">
                                            Escribir Reseña (+5 pts)
                                        </a-button>
                                    </div>
                                </a-card>
                            </a-col>
                        </a-row>
                        <a-empty v-if="reseniasPendientes.length === 0"
                            description="¡Estás al día! No tienes reseñas pendientes." />
                    </a-tab-pane>
                </a-tabs>
            </a-layout-content>
        </a-layout>

        <a-modal v-model:open="estadoModal" :title="'Valorar ' + formModal.plato_name" @ok="guardarResenia"
            :confirm-loading="confirmLoading" ok-text="Publicar Reseña" cancel-text="Cancelar" destroyOnClose>
            <a-form layout="vertical">
                <a-form-item label="Puntuación (Estrellas)">
                    <a-rate v-model:value="formModal.puntuacion" />
                </a-form-item>
                <a-form-item label="Comentario">
                    <a-textarea v-model:value="formModal.descripcion"
                        placeholder="Cuéntanos qué te pareció este plato..." :rows="4" :maxlength="250" show-count />
                </a-form-item>
            </a-form>
        </a-modal>
        <PiePaginaPrincipal />
    </a-layout>
</template>

<style scoped>
.reseniaTexto {
    font-style: italic;
    color: #555;
    margin-top: 8px;
    height: 60px;
    overflow: hidden;
}

.tarjetaImg {
    height: 200px;
    object-fit: cover;
}

.tarjetaFooter {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.mpCard {
    height: 100%;
}

.separarBtn {
    margin-top: 15px;
}
</style>