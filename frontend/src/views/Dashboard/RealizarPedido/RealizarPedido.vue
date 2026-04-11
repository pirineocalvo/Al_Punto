<script setup>
import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue'
import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue'
import { ref, computed,onMounted } from 'vue';
import { QuestionCircleOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons-vue';
import {getMenu, guardarCarritoCompraClientes } from '../../../Services/api';
import './RealizarPedido.css';

const menu = ref([]);
onMounted(async () => {
    menu.value = await getMenu();
    console.log(menu.value)
})


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
    if(productosElegidos.value.length == 0){

    }else{
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
    <HeaderDashboard></HeaderDashboard>

    <div >
        
        <div class="altoPag"> 
            <Sidebar></Sidebar>
            <a-row class="contenedorPedidos">
            <a-col :xs="24" :lg="17">
                <a-row>
                    <a-col v-for="producto in menu" :key="producto.name" :xs="20" :md="18" :lg="19">
                        <a-card class="productoCard" size="small" :bodyStyle="{ padding: '14px 16px' }">
                            <div class="productoRow">
                                <a-image :width="72" :preview="false"
                                    src="https://i.pinimg.com/originals/ce/e3/e4/cee3e4cebaf12a51e9fc4018f9471e38.png"
                                    :alt="producto.name" class="productoImage" />

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

                                    <a-button type="primary" size="small" ghost @click="addCarritoProducto(producto)">+ Añadir</a-button>
                                </div>
                            </div>
                        </a-card>
                    </a-col>
                </a-row>
            </a-col>

            <a-col :xs="20" :lg="6">
                <a-card title="Tu pedido" class="pedidoCard">
                    <a-list :data-source="productosElegidos" item-layout="horizontal" class="listaPedido">
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
                                        <span class="nombreProducto">{{ item.name }}</span>
                                    </template>

                                    <template #description>
                                        <div class="detallePedido">
                                            <a-tag color="blue" v-if="item.edicion == false">
                                                Cantidad: {{ item.cantidad }}
                                                <a-button type="text" size="small"
                                                    @click="activarEdicionCantidad(item.name)">
                                                    <EditOutlined />
                                                </a-button>
                                            </a-tag>

                                            <a-tag color="blue" v-else>
                                                Cantidad:
                                                <a-input-number id="inputNumber" v-model:value="item.cantidad"
                                                    @pressEnter="guardarCambios(item)" min="0" />
                                                <a-button type="primary" size="small" @click="guardarCambios(item)">
                                                    <CheckOutlined />
                                                </a-button>
                                            </a-tag>

                                            <a-tag color="green">
                                                {{ item.precioTotal.toFixed(2) }} €
                                            </a-tag>
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
                    <a-button @click="guardarCarrito()">Realizar pedido</a-button>
                </a-form>
            </a-col>
        </a-row>        
        </div>
        

        <Footer></Footer>
    </div>
</template>