<script setup>
import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue';
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { QuestionCircleOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { getMenu, getCategories, guardarCarritoCompraClientes, userInfo } from '../../../Services/api';
import { message } from 'ant-design-vue';

const user = ref(null);
const router = useRouter();
const menu = ref([]);
const categorias = ref([]);
const menuClasificado = ref([]);

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken');
    if (!token) { router.push('/login'); return; }
    try {
        user.value = await userInfo();
    } catch (err) {
        router.push('/login');
    }

    menu.value = await getMenu();
    categorias.value = await getCategories();
    clasificarMenu();
});

function clasificarMenu() {
    categorias.value.forEach(catego => {
        const inforCatego = {
            categoria: catego.name,
            productos: []
        };

        menu.value.forEach(product => {
            if (product.id_category == catego.id) {
                inforCatego.productos.push(product);
            };
        });

        menuClasificado.value.push(inforCatego);
    });
}

const productosElegidos = ref([]);

function addCarritoProducto(nuevoProducto) {
    const existente = productosElegidos.value.find(pro => pro.name === nuevoProducto.name);
    if (existente) {
        productosElegidos.value.map(pro => {
            if (pro.name === nuevoProducto.name) {
                pro.cantidad += 1;
                pro.precioTotal = pro.price * pro.cantidad;
            }
        });
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
    productosElegidos.value.map(pro => {
        if (pro.name === nombreProducto) {
            if (pro.edicion == true) {
                pro.edicion = false;
            } else {
                pro.edicion = true;
            }
        }
    });
}

function guardarCambios(nuevoProducto) {
    productosElegidos.value.map(pro => {
        if (pro.name === nuevoProducto.name) {
            if (nuevoProducto.cantidad == 0) {
                eliminarProductoCarrito(nuevoProducto);
            } else {
                pro.cantidad = nuevoProducto.cantidad;
                pro.precioTotal = pro.cantidad * pro.price;
                pro.edicion = false;
            }
        }
    });
}

function eliminarProductoCarrito(productoEliminar) {
    productosElegidos.value.map(pro => {
        let posicion = -1;

        productosElegidos.value.map((pro, index) => {
            if (pro.name === productoEliminar.name) {
                posicion = index;
            }
        });

        if (posicion !== -1) {
            productosElegidos.value.splice(posicion, 1);
        }
    });
}

const totalPedido = computed(() => {
    return productosElegidos.value.reduce((acc, producto) => {
        return acc + producto.precioTotal;
    }, 0);
});

async function guardarCarrito() {
    if (productosElegidos.value.length == 0) {
        message.warning('¡Su cesta no contiene ningún producto!');
    } else {
        const datosAguardar = {
            items: productosElegidos.value.map(producto => ({
                product_id: producto.id,
                quantity: producto.cantidad,
                price_at_time: producto.price
            })),
            total_price: totalPedido.value
        };

        await guardarCarritoCompraClientes(datosAguardar);
        productosElegidos.value = [];
    }
}
</script>

<template>
    <HeaderDashboard :user="user" />
    <a-layout>
        <Sidebar></Sidebar>
        <a-row class="contenedorPedidos">
            <a-col :xs="24" :lg="17">
                <a-row>
                    <a-col v-for="catego in menuClasificado" :key="catego.categoria">
                        <a-flex justify="center">
                            <a-typography-title :level="3">{{ catego.categoria }}</a-typography-title>
                        </a-flex>
                        <a-row>
                            <a-col v-for="producto in catego.productos" :key="producto.name" :xs="20" :md="18" :lg="19">
                                <a-card class="productoCard" size="small" :bodyStyle="{ padding: '14px 16px' }">
                                    <div class="productoRow">
                                        <a-image :width="72" :preview="false" :src="'/images/plates/'+producto.img_src" :alt="producto.name" class="productoImage" />

                                        <div class="productoInfo">
                                            <a-space :size="[8, 8]" wrap class="productoHeader">
                                                <a-typography-text strong>
                                                    {{ producto.name }}
                                                </a-typography-text>

                                                <a-tag v-if="producto.tag" color="processing">
                                                    {{ producto.tag }}
                                                </a-tag>
                                            </a-space>

                                            <a-typography-paragraph :ellipsis="{ rows: 1 }" class="productoDescription">
                                                {{ producto.description }}
                                            </a-typography-paragraph>

                                            <a-typography-text type="secondary" class="productoSecondary">
                                                {{ producto.ingredients }}
                                            </a-typography-text>
                                        </div>

                                        <div class="productoActions">
                                            <a-typography-text strong class="productoPrice">
                                                {{ producto.price.toFixed(2) }} €
                                            </a-typography-text>

                                            <a-button type="primary" size="small" ghost
                                                @click="addCarritoProducto(producto)">+
                                                Añadir</a-button>
                                        </div>
                                    </div>
                                </a-card>
                            </a-col>
                        </a-row>
                    </a-col>

                </a-row>
            </a-col>

            <a-col :xs="20" :lg="6" class="pedidoCard">
                <a-card title="Tu pedido">
                    <a-list :data-source="productosElegidos" item-layout="horizontal">
                        <template #renderItem="{ item }">
                            <a-list-item class="itemPedido">
                                <template #actions>
                                    <a-popconfirm title="¿Eliminar este producto?" ok-text="Sí" cancel-text="No"
                                        @confirm="eliminarProductoCarrito(item)">
                                        <template #icon>
                                            <QuestionCircleOutlined style="color: red" />
                                        </template>

                                        <a-button type="text" danger size="small">
                                            Eliminar
                                        </a-button>
                                    </a-popconfirm>
                                </template>

                                <a-list-item-meta>
                                    <template #title>
                                        <span>{{ item.name }}</span>
                                    </template>

                                    <template #description>
                                        <div class="detallePedido">
                                            <template v-if="!item.edicion">
                                                <span>Cantidad: {{ item.cantidad }}</span>
                                                <a-button type="text" size="small"
                                                    @click="activarEdicionCantidad(item.name)">
                                                    <EditOutlined />
                                                </a-button>
                                            </template>
                                            <template v-else class="p">
                                                <a-input-number v-model:value="item.cantidad"
                                                    @pressEnter="guardarCambios(item)" :min="0" size="small"
                                                    style="width: 70px;" />
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
                <a-form>
                    <a-button class="ajusteBtn" @click="guardarCarrito()">Realizar pedido</a-button>
                </a-form>
            </a-col>
        </a-row>
    </a-layout>
    <Footer></Footer>
</template>
<style scoped>
.contenedorPedidos {
    flex: 1;
    margin: 120px 0;
}

.totalPedido {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    margin-top: 8px;
}
.pedidoCard {
    display: flex !important;
    align-self: flex-start !important;
    flex-direction: column !important;
    height: auto;
}
.productoCard {
    height: 100%;
    border-radius: 12px;
}

.productoCard :deep(.ant-card-body) {
    height: 100%;
}

.productoRow {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 96px;
    height: 100%;
}

.productoImage {
    flex-shrink: 0;
}

.productoImage :deep(img) {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 10px;
}

.productoInfo {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.productoHeader {
    margin-bottom: 4px;
}

.productoDescription {
    margin-bottom: 2px !important;
}

.productoSecondary {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.productoActions {
    min-width: 96px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 8px;
    flex-shrink: 0;
}

.productoPrice {
    font-size: 16px;
}

.detallePedido {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.ajusteBtn {
    width: 100%;
    margin-top: 10px;
}

.colorRojo{
    color: red !important;
}

@media (max-width: 768px) {
    .productoRow {
        min-height: 88px;
    }

    .productoActions {
        min-width: 84px;
    }
}

@media (max-width: 1568px) {
    .itemPedido {
        padding: 0 !important;
        display: grid !important;
        grid-template-columns: 1fr !important;
        text-align: center;
    }

    .detallePedido {

        justify-content: center;
        gap: 5px;
    }

}
</style>