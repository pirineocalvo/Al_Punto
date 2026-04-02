<script setup>
import Header from '../../Components/cabeceraYpiePrincipal/Header.vue';
import Footer from '../../Components/cabeceraYpiePrincipal/Footer.vue';
import { ref } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import './RealizarPedido.css'

const productosElegidos = ref([]);
const productos = [
    {
        name: 'Hamburguesa Clásica',
        description: 'Nuestra burger más vendida con ingredientes frescos.',
        price: 12.5
    },
    {
        name: 'Pizza Margherita',
        description: 'Sabor tradicional italiano cocinado en horno de piedra.',
        price: 10
    },
    {
        name: 'Ensalada César',
        description: 'Fresca y ligera, ideal para comenzar.',
        price: 9.25
    },
    {
        name: 'Tarta de Queso',
        description: 'Casera y muy cremosa.',
        price: 6.5
    },
    {
        name: 'Hamburguesa BBQ',
        description: 'Carne jugosa con bacon crujiente, cebolla caramelizada y salsa barbacoa.',
        price: 13.75
    },
    {
        name: 'Pizza Cuatro Quesos',
        description: 'Mezcla intensa de quesos fundidos sobre masa fina artesanal.',
        price: 11.5
    },
    {
        name: 'Pizza Pepperoni',
        description: 'Clásica pizza con pepperoni y mozzarella derretida.',
        price: 12
    },
    {
        name: 'Wrap de Pollo',
        description: 'Tortilla rellena de pollo marinado, lechuga y salsa especial.',
        price: 8.95
    },
    {
        name: 'Wrap Vegetal',
        description: 'Opción ligera con verduras frescas, aguacate y hummus.',
        price: 8.5
    },
    {
        name: 'Pasta Carbonara',
        description: 'Espaguetis cremosos con bacon, parmesano y pimienta negra.',
        price: 11.95
    },
    {
        name: 'Pasta Boloñesa',
        description: 'Pasta al dente con salsa casera de carne y tomate.',
        price: 10.95
    },
    {
        name: 'Lasaña de Carne',
        description: 'Capas de pasta con carne, bechamel y queso gratinado.',
        price: 12.25
    },
    {
        name: 'Lasaña Vegetal',
        description: 'Versión casera con verduras salteadas y salsa suave.',
        price: 11.75
    },
    {
        name: 'Croquetas Caseras',
        description: 'Crujientes por fuera y cremosas por dentro, elaboradas al momento.',
        price: 7.5
    },
    {
        name: 'Patatas Bravas',
        description: 'Patatas doradas con salsa brava ligeramente picante.',
        price: 6.75
    },
    {
        name: 'Patatas con Queso y Bacon',
        description: 'Patatas fritas cubiertas con queso fundido y bacon crujiente.',
        price: 7.95
    },
    {
        name: 'Nachos Supreme',
        description: 'Nachos con queso, guacamole, jalapeños y carne picada.',
        price: 9.5
    },
    {
        name: 'Sandwich Mixto',
        description: 'Jamón y queso fundido en pan tostado.',
        price: 5.5
    },
    {
        name: 'Sandwich Club',
        description: 'Pollo, bacon, lechuga, tomate y mayonesa en triple pan.',
        price: 8.75
    },
    {
        name: 'Bocadillo de Calamares',
        description: 'Pan crujiente con calamares rebozados y alioli suave.',
        price: 7.95
    },
    {
        name: 'Bocadillo de Jamón',
        description: 'Jamón serrano en pan recién horneado con tomate rallado.',
        price: 6.95
    },
    {
        name: 'Sopa de Tomate',
        description: 'Sopa suave y reconfortante elaborada con tomate natural.',
        price: 5.9
    },
    {
        name: 'Crema de Verduras',
        description: 'Crema ligera y sabrosa con verduras de temporada.',
        price: 5.75
    },
    {
        name: 'Arroz con Pollo',
        description: 'Arroz meloso con pollo especiado y verduras frescas.',
        price: 10.5
    },
    {
        name: 'Paella Mixta',
        description: 'Arroz tradicional con marisco, pollo y verduras.',
        price: 14.5
    },
    {
        name: 'Pollo Asado',
        description: 'Pollo tierno al horno con especias y guarnición.',
        price: 12.95
    },
    {
        name: 'Costillas BBQ',
        description: 'Costillas tiernas glaseadas con salsa barbacoa casera.',
        price: 15.75
    },
    {
        name: 'Salmón a la Plancha',
        description: 'Lomo de salmón con verduras salteadas y toque de limón.',
        price: 16.25
    },
    {
        name: 'Merluza Rebozada',
        description: 'Filete crujiente acompañado de ensalada fresca.',
        price: 13.25
    },
    {
        name: 'Tacos de Ternera',
        description: 'Tortillas rellenas de ternera especiada, cebolla y salsa.',
        price: 9.95
    },
    {
        name: 'Tacos Veganos',
        description: 'Tacos con soja sazonada, verduras y crema de aguacate.',
        price: 9.5
    },
    {
        name: 'Brownie de Chocolate',
        description: 'Bizcocho intenso de chocolate con interior jugoso.',
        price: 5.25
    },
    {
        name: 'Helado de Vainilla',
        description: 'Helado cremoso y suave elaborado con auténtica vainilla.',
        price: 4.5
    },
    {
        name: 'Coulant de Chocolate',
        description: 'Postre caliente con corazón fundido de chocolate.',
        price: 6.25
    }
];
</script>

<template>
    <Header></Header>

    <div class="altoPag">
        <a-row class="contenedorPedidos">
            <a-col :xs="20" :lg="16">
                <a-row>
                    <a-col v-for="producto in productos" :key="producto.name">
                        <a-card hoverable class="cardProducto">
                            <template #cover>
                                <img src="https://i.pinimg.com/originals/ce/e3/e4/cee3e4cebaf12a51e9fc4018f9471e38.png"
                                    :alt="producto.name" class="imgMenuCompra" />
                            </template>

                            <a-card-meta :title="producto.name" />

                            <div class="hoverPanel">
                                <a-divider />
                                <a-tag v-if="producto.tag" color="success">{{ producto.tag }}</a-tag>

                                <p class="descripcionProducto">{{ producto.description }}</p>

                                <div class="footerProducto">
                                    <a-statistic :value="producto.price" precision="2" suffix="€"
                                        :value-style="{ fontSize: '16px' }" />
                                    <a-button type="primary" size="small" ghost>Pedir</a-button>
                                </div>
                            </div>
                        </a-card>
                    </a-col>
                </a-row>
            </a-col>

            <a-col :xs="20" :lg="6">
                <a-list :data-source="items" bordered size="large">
                    <template #renderItem="{ item }">
                        <a-list-item>
                            <a-list-item-meta :description="`Cantidad del producto: ${item.name}`">
                                <template #title>
                                    Producto {{ item.price }}
                                </template>
                                <a-popconfirm title="Are you sure？">
                                    <template #icon><question-circle-outlined style="color: red" /></template>
                                    <a-input-number id="inputNumber" v-model:value="value" :min="1" :max="10" />
                                    <a href="#">Delete</a>
                                </a-popconfirm>
                            </a-list-item-meta>
                        </a-list-item>
                    </template>
                </a-list>
                <a-form>
                    <a-button class="btnPrincipal">Realizar pedido</a-button>
                </a-form>
            </a-col>
        </a-row>

        <Footer></Footer>
    </div>
</template>