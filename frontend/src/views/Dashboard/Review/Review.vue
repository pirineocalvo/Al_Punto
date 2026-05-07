<script setup>
import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { getMyReviews, userInfo, getProductosCompradosCliente, addReview } from '../../../Services/api';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router'; 
import { message, notification } from 'ant-design-vue';

const user = ref(null); 
const router = useRouter(); 
const listaResenias = ref([]);
const productosComprados = ref([]);
const keyLab = ref('1');

const estadoModal = ref(false);
const confirmLoading = ref(false);

const formModal = ref({
    id_plato: null,
    plato_name: '',
    puntuacion: 0,
    descripcion: ''
});


const datosModal = (producto) => {
    formModal.value.id_plato = producto.product_id || producto.id; 
    formModal.value.plato_name = producto.product_name;
    formModal.value.puntuacion = 0;
    formModal.value.descripcion = '';
    estadoModal.value = true;
};

const guardarResenia = async () => {
    if (formModal.value.puntuacion === 0) {
        return message.warning('Por favor, selecciona una puntuación.');
    }
    if (!formModal.value.descripcion) {
        return message.warning('El comentario no puede estar vacío.');
    }

    confirmLoading.value = true;
    try {
        const res = await addReview({
            id_plato: formModal.value.id_plato,
            descripcion: formModal.value.descripcion,
            puntuacion: formModal.value.puntuacion
        });

        notification.success({
            message: res.message,
            description: res.reward,
            placement: 'topRight'
        });

        estadoModal.value = false;

        listaResenias.value = await getMyReviews();
        productosComprados.value = await getProductosCompradosCliente();

    } catch (err) {
        message.error('Error al publicar la reseña.');
        console.error(err);
    } finally {
        confirmLoading.value = false;
    }
};

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken'); 
    if (!token) { router.push('/login'); return; }

    try {
        user.value = await userInfo();
        listaResenias.value = await getMyReviews();
        productosComprados.value = await getProductosCompradosCliente();
        
    } catch (err) {
        console.error("Error cargando datos:", err);
    }
});

const reseniasHechas = computed(() => listaResenias.value);

const reseniasPendientes = computed(() => {

    const nombresReseniados = listaResenias.value.map(r => r.plato_name.toLowerCase().trim());
    
    const productosPendientes = [];


    //set permite que no se dupliquen los podroductos
    const yaAgregadosALista = new Set();

    productosComprados.value.forEach(pedido => {
        if (pedido.status === 'entregado') {
            pedido.items.forEach(item => {
                const nombreLimpio = item.product_name.toLowerCase().trim();

                const yaReseniado = nombresReseniados.includes(nombreLimpio);
                //devuelve true si ya existe el producto en el set
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
        <HeaderDashboard :user="user" /> 
        <a-layout class="dashboardMainLayout">
            <Sidebar />
            <a-layout-content class="colocarContenido">
                <a-typography-title :level="1">Gestión de Reseñas</a-typography-title>
                
                <a-tabs v-model:activeKey="keyLab">
                    
                    <a-tab-pane key="1" tab="Mis Reseñas Realizadas">
                        <a-row :gutter="[16, 16]">
                            <a-col v-for="resenia in reseniasHechas" :key="resenia.id" :xs="24" :md="12" :lg="8">
                                <a-card class="mpCard">
                                    <template #cover>
                                        <img :alt="resenia.plato_name" :src="'images/plates/'+resenia.plato_img" class="tarjetaImg" />
                                    </template>
                                    <a-card-meta :title="resenia.plato_name">
                                        <template #description>
                                            <p class="reseniaTexto">"{{ resenia.descripcion }}"</p>
                                        </template>
                                    </a-card-meta>
                                    <div class="tarjetaFooter">
                                        <a-rate :value="resenia.puntuacion" disabled />
                                        <span class="mpPts">{{ formatearFecha(resenia.created_at) }}</span>
                                    </div>
                                </a-card>
                            </a-col>
                        </a-row>
                        <a-empty v-if="reseniasHechas.length === 0" description="No has realizado ninguna reseña aún." />
                    </a-tab-pane>

                    <a-tab-pane key="2" tab="Pendientes de Calificar">
                        <a-row :gutter="[16, 16]">
                            <a-col v-for="producto in reseniasPendientes" :key="producto.id" :xs="24" :md="12" :lg="8">
                                <a-card class="mpCard pendingCard">
                                    <template #cover>
                                        <img :alt="producto.product_name" :src="'images/plates/'+producto.img_src" class="tarjetaImg" />
                                    </template>
                                    
                                    <a-card-meta :title="producto.product_name">
                                        <template #description>
                                            <a-typography-text type="secondary">
                                                Aún no has valorado este plato.
                                            </a-typography-text>
                                        </template>
                                    </a-card-meta>
                                    
                                    <div style="margin-top: 15px;">
                                        <a-button block type="primary" @click="datosModal(producto)">
                                            Escribir Reseña (+5 pts)
                                        </a-button>
                                    </div>
                                </a-card>
                            </a-col>
                        </a-row>
                        <a-empty v-if="reseniasPendientes.length === 0" description="¡Estás al día! No tienes reseñas pendientes." />
                    </a-tab-pane>

                </a-tabs>
            </a-layout-content>
        </a-layout>

        <a-modal v-model:open="estadoModal" :title="'Valorar ' + formModal.plato_name" @ok="guardarResenia" :confirm-loading="confirmLoading" ok-text="Publicar Reseña" cancel-text="Cancelar" destroyOnClose>
            <a-form layout="vertical">
                <a-form-item label="Puntuación (Estrellas)">
                    <a-rate v-model:value="formModal.puntuacion" />
                </a-form-item>
                
                <a-form-item label="Comentario">
                    <a-textarea v-model:value="formModal.descripcion" placeholder="Cuéntanos qué te pareció este plato..." :rows="4" :maxlength="250" show-count/>
                </a-form-item>
            </a-form>
        </a-modal>

        <Footer />
    </a-layout>
</template>
<style scoped>
.reseniaTexto {
    font-style: italic;
    color: #555;
}

.tarjetaImg {
    height: 200px;
    object-fit: cover;
}

.tarjetaFooter {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}


.colocarContenido{
    flex:1;
    padding: 32px;
}

</style>