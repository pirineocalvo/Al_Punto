<script setup>
import Header from '../../Components/cabeceraYpiePrincipal/Header.vue';
import Footer from '../../Components/cabeceraYpiePrincipal/Footer.vue';

const items = [
    { id: 1, titulo: 'Carta 1', texto: 'Contenido 1' },
    { id: 2, titulo: 'Carta 2', texto: 'Contenido 2' },
    { id: 3, titulo: 'Carta 3', texto: 'Contenido 3' },
    { id: 4, titulo: 'Carta 4', texto: 'Contenido 4' },
    { id: 5, titulo: 'Carta 5', texto: 'Contenido 5' },
    { id: 6, titulo: 'Carta 6', texto: 'Contenido 6' },
];
</script>

<template>
    <Header></Header>
    <a-row>
        <a-col :span="16">
            <a-row>
                <a-col v-for="item in items">
                    <a-card :key="item.id" :title="item.titulo">
                        <a-image :width="220"
                            src="https://tse4.mm.bing.net/th/id/OIP.9A0sfVV2UB78rwCu64yhRwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" />

                        {{ item.texto }}

                    </a-card>
                </a-col>
            </a-row>

        </a-col>
        <a-col :span="6">
            <a-list :data-source="items" bordered size="large">
                <template #renderItem="{ item }">
                    <a-list-item>
                        <a-list-item-meta :description="`Cantidad del producto: ${item.titulo}`">
                            <template #title>
                                Producto {{ item.texto }}
                            </template>
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
</template>
