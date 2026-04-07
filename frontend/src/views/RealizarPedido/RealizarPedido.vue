<script setup>
import Header from '../../Components/cabeceraYpiePrincipal/Header.vue';
import Footer from '../../Components/cabeceraYpiePrincipal/Footer.vue';
import { ref, computed } from 'vue';
import { QuestionCircleOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons-vue';
import './RealizarPedido.css'

const productosElegidos = ref([]);
const productos = [
    {
        name: 'Hamburguesa Clásica',
        description: 'Nuestra burger más vendida con ingredientes frescos.',
        price: 12.5,
        ingredients: 'Pan brioche, carne de vacuno, lechuga, tomate, queso cheddar, salsa especial'
    },
    {
        name: 'Pizza Margherita',
        description: 'Sabor tradicional italiano cocinado en horno de piedra.',
        price: 10,
        ingredients: 'Masa artesanal, tomate, mozzarella, albahaca, aceite de oliva'
    },
    {
        name: 'Ensalada César',
        description: 'Fresca y ligera, ideal para comenzar.',
        price: 9.25,
        ingredients: 'Lechuga romana, pollo, picatostes, queso parmesano, salsa César'
    },
    {
        name: 'Tarta de Queso',
        description: 'Casera y muy cremosa.',
        price: 6.5,
        ingredients: 'Queso crema, huevos, azúcar, galleta, mantequilla'
    },
    {
        name: 'Hamburguesa BBQ',
        description: 'Carne jugosa con bacon crujiente, cebolla caramelizada y salsa barbacoa.',
        price: 13.75,
        ingredients: 'Pan brioche, carne de vacuno, bacon, cebolla caramelizada, queso cheddar, salsa barbacoa'
    },
    {
        name: 'Pizza Cuatro Quesos',
        description: 'Mezcla intensa de quesos fundidos sobre masa fina artesanal.',
        price: 11.5,
        ingredients: 'Masa artesanal, mozzarella, gorgonzola, parmesano, queso de cabra, tomate'
    },
    {
        name: 'Pizza Pepperoni',
        description: 'Clásica pizza con pepperoni y mozzarella derretida.',
        price: 12,
        ingredients: 'Masa artesanal, tomate, mozzarella, pepperoni, orégano'
    },
    {
        name: 'Wrap de Pollo',
        description: 'Tortilla rellena de pollo marinado, lechuga y salsa especial.',
        price: 8.95,
        ingredients: 'Tortilla de trigo, pollo marinado, lechuga, tomate, queso, salsa especial'
    },
    {
        name: 'Wrap Vegetal',
        description: 'Opción ligera con verduras frescas, aguacate y hummus.',
        price: 8.5,
        ingredients: 'Tortilla de trigo, aguacate, hummus, lechuga, tomate, zanahoria'
    },
    {
        name: 'Pasta Carbonara',
        description: 'Espaguetis cremosos con bacon, parmesano y pimienta negra.',
        price: 11.95,
        ingredients: 'Espaguetis, bacon, yema de huevo, queso parmesano, pimienta negra'
    },
    {
        name: 'Pasta Boloñesa',
        description: 'Pasta al dente con salsa casera de carne y tomate.',
        price: 10.95,
        ingredients: 'Espaguetis, carne picada, tomate, cebolla, zanahoria, ajo'
    },
    {
        name: 'Lasaña de Carne',
        description: 'Capas de pasta con carne, bechamel y queso gratinado.',
        price: 12.25,
        ingredients: 'Pasta para lasaña, carne picada, tomate, bechamel, queso gratinado'
    },
    {
        name: 'Lasaña Vegetal',
        description: 'Versión casera con verduras salteadas y salsa suave.',
        price: 11.75,
        ingredients: 'Pasta para lasaña, calabacín, berenjena, tomate, bechamel, queso'
    },
    {
        name: 'Croquetas Caseras',
        description: 'Crujientes por fuera y cremosas por dentro, elaboradas al momento.',
        price: 7.5,
        ingredients: 'Bechamel, jamón, pan rallado, huevo, aceite'
    },
    {
        name: 'Patatas Bravas',
        description: 'Patatas doradas con salsa brava ligeramente picante.',
        price: 6.75,
        ingredients: 'Patatas, salsa brava, aceite, pimentón'
    },
    {
        name: 'Patatas con Queso y Bacon',
        description: 'Patatas fritas cubiertas con queso fundido y bacon crujiente.',
        price: 7.95,
        ingredients: 'Patatas, queso cheddar, bacon, salsa ranch'
    },
    {
        name: 'Nachos Supreme',
        description: 'Nachos con queso, guacamole, jalapeños y carne picada.',
        price: 9.5,
        ingredients: 'Nachos, queso fundido, guacamole, jalapeños, carne picada, crema agria'
    },
    {
        name: 'Sandwich Mixto',
        description: 'Jamón y queso fundido en pan tostado.',
        price: 5.5,
        ingredients: 'Pan de molde, jamón york, queso, mantequilla'
    },
    {
        name: 'Sandwich Club',
        description: 'Pollo, bacon, lechuga, tomate y mayonesa en triple pan.',
        price: 8.75,
        ingredients: 'Pan de molde, pollo, bacon, lechuga, tomate, mayonesa'
    },
    {
        name: 'Bocadillo de Calamares',
        description: 'Pan crujiente con calamares rebozados y alioli suave.',
        price: 7.95,
        ingredients: 'Pan, calamares rebozados, alioli, limón'
    },
    {
        name: 'Bocadillo de Jamón',
        description: 'Jamón serrano en pan recién horneado con tomate rallado.',
        price: 6.95,
        ingredients: 'Pan, jamón serrano, tomate rallado, aceite de oliva'
    },
    {
        name: 'Sopa de Tomate',
        description: 'Sopa suave y reconfortante elaborada con tomate natural.',
        price: 5.9,
        ingredients: 'Tomate, cebolla, ajo, caldo vegetal, aceite de oliva'
    },
    {
        name: 'Crema de Verduras',
        description: 'Crema ligera y sabrosa con verduras de temporada.',
        price: 5.75,
        ingredients: 'Calabacín, zanahoria, puerro, patata, caldo vegetal'
    },
    {
        name: 'Arroz con Pollo',
        description: 'Arroz meloso con pollo especiado y verduras frescas.',
        price: 10.5,
        ingredients: 'Arroz, pollo, pimiento, cebolla, ajo, especias'
    },
    {
        name: 'Paella Mixta',
        description: 'Arroz tradicional con marisco, pollo y verduras.',
        price: 14.5,
        ingredients: 'Arroz, pollo, gambas, mejillones, pimiento, judías verdes'
    },
    {
        name: 'Pollo Asado',
        description: 'Pollo tierno al horno con especias y guarnición.',
        price: 12.95,
        ingredients: 'Pollo, patatas, ajo, romero, aceite de oliva, especias'
    },
    {
        name: 'Costillas BBQ',
        description: 'Costillas tiernas glaseadas con salsa barbacoa casera.',
        price: 15.75,
        ingredients: 'Costillas de cerdo, salsa barbacoa, miel, especias'
    },
    {
        name: 'Salmón a la Plancha',
        description: 'Lomo de salmón con verduras salteadas y toque de limón.',
        price: 16.25,
        ingredients: 'Salmón, calabacín, zanahoria, limón, aceite de oliva'
    },
    {
        name: 'Merluza Rebozada',
        description: 'Filete crujiente acompañado de ensalada fresca.',
        price: 13.25,
        ingredients: 'Merluza, harina, huevo, pan rallado, lechuga, tomate'
    },
    {
        name: 'Tacos de Ternera',
        description: 'Tortillas rellenas de ternera especiada, cebolla y salsa.',
        price: 9.95,
        ingredients: 'Tortillas de maíz, ternera, cebolla, pimiento, salsa mexicana'
    },
    {
        name: 'Tacos Veganos',
        description: 'Tacos con soja sazonada, verduras y crema de aguacate.',
        price: 9.5,
        ingredients: 'Tortillas de maíz, soja texturizada, lechuga, tomate, aguacate'
    },
    {
        name: 'Brownie de Chocolate',
        description: 'Bizcocho intenso de chocolate con interior jugoso.',
        price: 5.25,
        ingredients: 'Chocolate negro, mantequilla, azúcar, huevos, harina'
    },
    {
        name: 'Helado de Vainilla',
        description: 'Helado cremoso y suave elaborado con auténtica vainilla.',
        price: 4.5,
        ingredients: 'Leche, nata, azúcar, vainilla'
    },
    {
        name: 'Coulant de Chocolate',
        description: 'Postre caliente con corazón fundido de chocolate.',
        price: 6.25,
        ingredients: 'Chocolate negro, mantequilla, azúcar, huevos, harina'
    }
];

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


</script>

<template>
    <Header></Header>

    <div class="altoPag">
        <a-row class="contenedorPedidos">
            <a-col :xs="24" :lg="17">
                <a-row>
                    <a-col v-for="producto in productos" :key="producto.name" :xs="20" :md="18" :lg="19">
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
                    <a-button class="btnPrincipal">Realizar pedido</a-button>
                </a-form>
            </a-col>
        </a-row>

        <Footer></Footer>
    </div>
</template>