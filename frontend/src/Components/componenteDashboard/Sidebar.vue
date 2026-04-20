<script setup>
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { HomeOutlined, UserOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import './Sidebar.css';
import { funcinalidadSidebar } from '../../Components/componenteDashboard/js/ocultarSidebar';
const { cambiarEstadoSidebar,sidebarAbierto } = funcinalidadSidebar();

defineProps({
    collapsed: { type: Boolean, default: false }
})
const menuAbierto = ref (sidebarAbierto);
const isCollapsed = computed(() => {
    cambiarEstadoSidebar.value;
    menuAbierto.value = sidebarAbierto;
    
    return sidebarAbierto;
});
const router = useRouter();

const actualizarTamano = () => {
    pantallaPeque.value = window.innerWidth < 768;
}

const pantallaPeque = ref(window.innerWidth < 768);

onMounted(() => window.addEventListener('resize', actualizarTamano));
onUnmounted(() => window.removeEventListener('resize', actualizarTamano));


</script>

<template>
    <a-drawer v-if="pantallaPeque" placement="left" v-model:open="menuAbierto" :width="220" title="Menú">
        <a-menu theme="light" mode="inline" :default-selected-keys="['1']">
            <a-menu-item key="1" @click="router.push('/')">
                <template #icon>
                    <HomeOutlined />
                </template>
                Inicio
            </a-menu-item>

            <a-menu-item key="2" @click="router.push('/zonaPersonal')">
                <template #icon>
                    <UserOutlined />
                </template>
                Mi Perfil
            </a-menu-item>

            <a-menu-item key="5" @click="router.push('/historial')">
                <template #icon>
                    <InfoCircleOutlined />
                </template>
                Historial
            </a-menu-item>
            <a-menu-item key="6" @click="router.push('/realizarPedido')">
                <template #icon>
                    <InfoCircleOutlined />
                </template>
                Realizar un pedido
            </a-menu-item>
            <a-menu-item key="7" @click="router.push('/marketplace')">
                <template #icon>
                    <InfoCircleOutlined />
                </template>
                Marketplace
            </a-menu-item>
            <a-sub-menu key="sub1">
                <template #icon>
                    <SettingOutlined />
                </template>
                <template #title>Tickets</template>

                <a-menu-item key="3" @click="router.push('/listarTickets')">
                    Mis Tickets
                </a-menu-item>
                <a-menu-item key="4" @click="router.push('/agregarTickets')">
                    Subir Ticket
                </a-menu-item>
            </a-sub-menu>
        </a-menu>
    </a-drawer>

    <a-layout-sider v-else breakpoint="lg" :collapsed-width="0" :trigger="null" class="sidebarCustom">
        <a-menu theme="light" mode="inline" :default-selected-keys="['1']" class="sidebarMenu">
            <a-menu-item key="1" @click="router.push('/')">
                <template #icon>
                    <HomeOutlined />
                </template>
                Inicio
            </a-menu-item>

            <a-menu-item key="2" @click="router.push('/zonaPersonal')">
                <template #icon>
                    <UserOutlined />
                </template>
                Mi Perfil
            </a-menu-item>

            <a-menu-item key="5" @click="router.push('/historial')">
                <template #icon>
                    <InfoCircleOutlined />
                </template>
                Historial
            </a-menu-item>
            <a-menu-item key="6" @click="router.push('/realizarPedido')">
                <template #icon>
                    <InfoCircleOutlined />
                </template>
                Realizar un pedido
            </a-menu-item>
            <a-menu-item key="7" @click="router.push('/marketplace')">
                <template #icon>
                    <InfoCircleOutlined />
                </template>
                Marketplace
            </a-menu-item>
            <a-sub-menu key="sub1">
                <template #icon>
                    <SettingOutlined />
                </template>
                <template #title>Tickets</template>

                <a-menu-item key="3" @click="router.push('/listarTickets')">
                    Mis Tickets
                </a-menu-item>
                <a-menu-item key="4" @click="router.push('/agregarTickets')">
                    Subir Ticket
                </a-menu-item>
            </a-sub-menu>
        </a-menu>
    </a-layout-sider>
</template>