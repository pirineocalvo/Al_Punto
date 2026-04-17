<script setup>
import { useRouter } from 'vue-router'
import {
    HomeOutlined,
    UserOutlined,
    SettingOutlined,
    InfoCircleOutlined
} from '@ant-design/icons-vue'
import './Sidebar.css'

defineProps({
    collapsed: { type: Boolean, default: false }
})

const router = useRouter()
</script>

<template>
    <a-layout-sider breakpoint="lg" :collapsed-width="0" :trigger="null" :collapsed="collapsed" class="sidebarCustom">
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