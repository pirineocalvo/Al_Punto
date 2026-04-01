
<script setup>
import Header from '../../Components/cabeceraYpiePrincipal/Header.vue'
import Footer from '../../Components/cabeceraYpiePrincipal/Footer.vue'

const items = [
    { id: 1, titulo: 'Carta 1', texto: 'Contenido 1' },
    { id: 2, titulo: 'Carta 2', texto: 'Contenido 2' },
    { id: 3, titulo: 'Carta 3', texto: 'Contenido 3' },
    { id: 4, titulo: 'Carta 4', texto: 'Contenido 4' },
    { id: 5, titulo: 'Carta 5', texto: 'Contenido 5' },
    { id: 6, titulo: 'Carta 6', texto: 'Contenido 6' },
]
</script>

<template>
    <a-layout style="min-height: 100vh">
        <Header />

        <a-layout-content class="contenidoPagina">
            <div class="contenedor">

                <!-- TARJETAS -->
                <a-row :gutter="[24, 24]">
                    <a-col v-for="item in items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                        <a-card :title="item.titulo" class="cardProducto">
                            <a-image class="imagenProducto"
                                src="https://tse4.mm.bing.net/th/id/OIP.9A0sfVV2UB78rwCu64yhRwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" />
                            <p class="textoCard">{{ item.texto }}</p>
                        </a-card>
                    </a-col>
                </a-row>

                <!-- LISTA + ACCIONES -->
                <a-row :gutter="[24, 24]" class="bloqueInferior">
                    <a-col :xs="24" :lg="16">
                        <a-card title="Resumen del pedido">
                            <a-list :data-source="items" bordered size="large">
                                <template #renderItem="{ item }">
                                    <a-list-item>
                                        <a-list-item-meta :description="`Cantidad del producto: 1`">
                                            <template #title>
                                                {{ item.titulo }}
                                            </template>
                                        </a-list-item-meta>
                                    </a-list-item>
                                </template>
                            </a-list>
                        </a-card>
                    </a-col>

                    <a-col :xs="24" :lg="8">
                        <a-card title="Acciones">
                            <a-space direction="vertical" style="width: 100%">
                                <a-button type="primary" block class="btnPrincipal">
                                    Realizar pedido
                                </a-button>
                            </a-space>
                        </a-card>
                    </a-col>
                </a-row>
            </div>
        </a-layout-content>

        <Footer />
    </a-layout>
</template>
