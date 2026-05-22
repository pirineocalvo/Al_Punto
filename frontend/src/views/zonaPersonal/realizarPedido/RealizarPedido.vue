<script setup>
import PiePaginaPrincipal from '../../../components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import CabeceraZonaPersonal from '../../../components/componenteDashboard/CabeceraZonaPersonal.vue';
import Sidebar from '../../../components/componenteDashboard/Sidebar.vue';
import { ref, computed, watch } from 'vue';
import { QuestionCircleOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { guardarCarritoCompraClientes } from '../../../services/realizarPedidoEndpoint';
import { obtenerMenu, obtenerCategorias } from '../../../services/menuEndpoint';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';
import { message, notification } from 'ant-design-vue';

const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.ADMIN });

const cargado = ref(false);
const menu = ref([]);
const categorias = ref([]);
const menuClasificado = ref([]);

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

function clasificarMenu() {
    categorias.value.forEach(catego => {
        const inforCatego = {
            categoria: catego.name,
            productos: []
        };

        menu.value.forEach(product => {
            if (product.id_category == catego.id) {
                inforCatego.productos.push(product);
            }
        });

        menuClasificado.value.push(inforCatego);
    });
}

const productosElegidos = ref([]);
function addCarritoProducto(nuevoProducto) {
    const existente = productosElegidos.value.find(pro => pro.name === nuevoProducto.name);
    if (existente) {
        existente.cantidad += 1;
        existente.precioTotal = existente.price * existente.cantidad;
    } else {
        const crearNuevoProducto = {
            ...nuevoProducto,
            cantidad: 1,
            precioTotal: nuevoProducto.price,
            edicion: false
        };
        productosElegidos.value.push(crearNuevoProducto);
    }
}

function activarEdicionCantidad(nombreProducto) {
    const producto = productosElegidos.value.find(pro => { return pro.name == nombreProducto; });
    if (producto) {
        producto.edicion = !producto.edicion;
    }
}

function guardarCambios(nuevoProducto) {
    const producto = productosElegidos.value.find(pro => { return pro.name == nuevoProducto.name; });

    if (producto) {
        if (nuevoProducto.cantidad <= 0) {
            eliminarProductoCarrito(nuevoProducto);
        } else {
            producto.cantidad = nuevoProducto.cantidad;
            producto.precioTotal = producto.cantidad * producto.price;
            producto.edicion = false;
        }
    }
}

function eliminarProductoCarrito(productoEliminar) {
    const posicion = productosElegidos.value.findIndex(pro => pro.name === productoEliminar.name);
    if (posicion !== -1) {
        productosElegidos.value.splice(posicion, 1);
    }
}

const totalPedido = computed(() => {
    return productosElegidos.value.reduce((acc, producto) => {
        return acc + producto.precioTotal;
    }, 0);
});

async function guardarCarrito() {
    if (productosElegidos.value.length == 0) {
        generarNotificacion('warning', '¡Advertencia!', 'Su cesta está vacía.');
    } else {
        const datosAguardar = {
            items: productosElegidos.value.map(producto => ({
                product_id: producto.id,
                quantity: producto.cantidad,
                price_at_time: producto.price
            })),
            total_price: totalPedido.value
        };
        try {
            await guardarCarritoCompraClientes(datosAguardar);
            productosElegidos.value = [];
            generarNotificacion('success', '¡Pedido realizado!', 'Para consultar el estado del pedido acceda al historial. Recuerde recogerlo en el establecimiento.');
        } catch (error) {
            generarNotificacion('error', '¡Error!', 'No se pudo realizar el pedido. Si el problema persiste, contacte con nosotros.');
        }
    }
}

watch(usuarioListo, async () => {
    try {
        menu.value = await obtenerMenu();
        categorias.value = await obtenerCategorias();
        clasificarMenu();
        cargado.value = true;
    } catch (err) {
        message.error('Error al cargar la página');
    }
}, { immediate: true });
</script>

<template>
    <a-layout class="dashboardMainLayout">
        <CabeceraZonaPersonal :user="user" />
        <a-layout>
            <Sidebar></Sidebar>
            <a-flex v-if="!cargado" vertical align="center" justify="center" class="centrarSpin">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-row v-else class="colocarContenedorPrincipalDashBoard" justify="space-between">
                <a-divider orientation="left"><a-typography-title :level="1">Realizar un
                        pedido</a-typography-title></a-divider>

                <a-col :xl="24" :xxl="16">
                    <a-row :xs="24">
                        <a-col :span="24" v-for="catego in menuClasificado" :key="catego.categoria">
                            <a-divider orientation="left"><a-typography-title :level="3">{{ catego.categoria
                                    }}</a-typography-title></a-divider>
                            <a-row :gutter="[16, 16]">
                                <a-col v-for="producto in catego.productos" :key="producto.name" :xs="24" :lg="24"
                                    :xl="12">
                                    <a-card class="tarjetaProducto" size="small" :bodyStyle="{ padding: '14px 16px' }">
                                        <div class="filaProducto">
                                            <a-image :width="72" :preview="false"
                                                :src="'/images/plates/' + producto.img_src" :alt="producto.name"
                                                class="imagenProducto" />

                                            <div class="infoProducto">
                                                <a-space :size="[8, 8]" wrap class="cabeceraProducto">
                                                    <a-typography-text strong>{{ producto.name }}</a-typography-text>
                                                    <a-tag v-if="producto.tag" color="processing">{{ producto.tag
                                                        }}</a-tag>
                                                </a-space>

                                                <a-typography-paragraph :ellipsis="{ rows: 1 }"
                                                    :content="producto.description" class="descripcionProducto" />
                                                <a-typography-text type="secondary" class="secundarioProducto">{{
                                                    producto.ingredients }}</a-typography-text>
                                            </div>

                                            <div class="accionesProducto">
                                                <a-typography-text strong class="precioProducto">{{
                                                    producto.price.toFixed(2) }} €</a-typography-text>
                                                <a-button type="primary" size="small" ghost
                                                    @click="addCarritoProducto(producto)">+ Añadir</a-button>
                                            </div>
                                        </div>
                                    </a-card>
                                </a-col>
                            </a-row>
                        </a-col>
                    </a-row>
                </a-col>

                <a-col :xs="24" :xxl="7" class="tarjetaPedido">
                    <a-card title="Tu pedido">
                        <a-list :data-source="productosElegidos" item-layout="horizontal">
                            <template #renderItem="{ item }">
                                <a-list-item class="itemPedido">
                                    <template #actions>
                                        <a-popconfirm title="¿Eliminar este producto?"
                                            @confirm="eliminarProductoCarrito(item)" ok-text="Sí" cancel-text="No">
                                            <template #icon>
                                                <QuestionCircleOutlined />
                                            </template>
                                            <a-button type="text" size="small">Eliminar</a-button>
                                        </a-popconfirm>
                                    </template>

                                    <a-list-item-meta>
                                        <template #title><span>{{ item.name }}</span></template>
                                        <template #description>
                                            <div class="detallePedido">
                                                <template v-if="!item.edicion">
                                                    <span>Cantidad: {{ item.cantidad }}</span>
                                                    <a-button type="text" size="small"
                                                        @click="activarEdicionCantidad(item.name)">
                                                        <EditOutlined />
                                                    </a-button>
                                                </template>
                                                <template v-else>
                                                    <a-input-number v-model:value="item.cantidad"
                                                        @pressEnter="guardarCambios(item)" :min="0" size="small" />
                                                    <a-button type="primary" size="small" @click="guardarCambios(item)">
                                                        <CheckOutlined />
                                                    </a-button>
                                                </template>
                                                <a-tag color="green">{{ item.precioTotal.toFixed(2) }} €</a-tag>
                                            </div>
                                        </template>
                                    </a-list-item-meta>
                                </a-list-item>
                            </template>
                        </a-list>

                        <a-divider />
                        <div class="totalPedido">
                            <span>Total</span>
                            <strong>{{ totalPedido.toFixed(2) }} €</strong>
                        </div>
                    </a-card>
                    <a-button type="primary" class="botonAjuste" @click="guardarCarrito()">Realizar pedido</a-button>
                </a-col>
            </a-row>
        </a-layout>
    </a-layout>
    <PiePaginaPrincipal></PiePaginaPrincipal>
</template>

<style scoped>
.totalPedido {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    margin-top: 8px;
}

.tarjetaPedido {
    display: flex !important;
    align-self: flex-start !important;
    flex-direction: column !important;
    height: auto;
    padding: 24px;
}

.tarjetaProducto {
    height: 100%;
    border-radius: 12px;
}

.filaProducto {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 96px;
    height: 100%;
}

.imagenProducto :deep(img) {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 10px;
}

.infoProducto {
    flex: 1;
    min-width: 0;
}

.accionesProducto {
    min-width: 96px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.botonAjuste {
    width: 100%;
    margin-top: 10px;
}
</style>