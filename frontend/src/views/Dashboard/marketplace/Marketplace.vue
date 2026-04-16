<script setup>
    import Footer from '../../../Components/cabeceraYpiePrincipal/Footer.vue';
    import HeaderDashboard from '../../../Components/componenteDashboard/HeaderDashboard.vue';
    import Sidebar from '../../../Components/componenteDashboard/Sidebar.vue';
    import './Marketplace.css';
    import { listaProductosMarketplace, cangearProductoMarkePlace } from '../../../Services/api';
    import { onMounted, ref } from 'vue';

    const listaProductos = ref([]);
    onMounted(async () => {
    listaProductos.value = await listaProductosMarketplace();
    console.log(listaProductos.value)
})
</script>
<template>
    <a-layout>
        <HeaderDashboard></HeaderDashboard>
        <a-layout class="dashboardMainLayout">
            <Sidebar></Sidebar>
        </a-layout>
        <Footer></Footer>
    </a-layout>
    
</template>