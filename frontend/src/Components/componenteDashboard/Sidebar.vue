<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { HomeOutlined, UserOutlined, HistoryOutlined, ShoppingOutlined, ShopOutlined, TagsOutlined, SettingOutlined, CommentOutlined } from '@ant-design/icons-vue';
import './Sidebar.css';
import { message } from 'ant-design-vue';
import { userInfo } from '../../Services/api';
import { funcinalidadSidebar } from '../../Components/componenteDashboard/js/ocultarSidebar';

const { cambiarEstadoSidebar, sidebarAbierto } = funcinalidadSidebar();

const menuAbierto = ref(sidebarAbierto);

const router = useRouter();
const route = useRoute();

const menuActual = ref(null)
const pantallaPeque = ref(window.innerWidth < 768);
const actualizarTamano = () => { pantallaPeque.value = window.innerWidth < 768; };

onMounted(() => window.addEventListener('resize', actualizarTamano));
onUnmounted(() => window.removeEventListener('resize', actualizarTamano));

const rutasMenu = [
    { key: '1', ruta: '/', label: 'Inicio', icon: HomeOutlined },
    { key: '2', ruta: '/zonaPersonal', label: 'Zona Personal', icon: UserOutlined },
    { key: '5', ruta: '/historial', label: 'Historial', icon: HistoryOutlined },
    { key: '6', ruta: '/realizarPedido', label: 'Realizar Pedido', icon: ShoppingOutlined },
        { key: '7', ruta: '/reviews', label: 'Tus comentarios', icon: CommentOutlined },
    { key: '8', ruta: '/marketplace', label: 'Marketplace', icon: ShopOutlined },
    {
        key: 'sub1',
        ruta: '',
        label: 'Tickets',
        icon: TagsOutlined,
        subMenu: [
            { key: '3', ruta: '/listarTickets', label: 'Mis Tickets' },
            { key: '4', ruta: '/agregarTickets', label: 'Subir Ticket' },
        ],
    },
];

const rutasMenuAdmin = [
    { ruta: '/', label: 'Inicio', icon: HomeOutlined },
    { ruta: '/zonaPersonal', label: 'Zona Personal', icon: UserOutlined },
    { ruta: '/historial', label: 'Historial', icon: HistoryOutlined },
    { ruta: '/realizarPedido', label: 'Realizar Pedido', icon: ShoppingOutlined },
    {ruta: '/reviews', label: 'Tus comentarios', icon: CommentOutlined },
    { ruta: '/marketplace', label: 'Marketplace', icon: ShopOutlined },
    {
        ruta: '',
        label: 'Tickets',
        icon: TagsOutlined,
        subMenu: [
            { ruta: '/listarTickets', label: 'Mis Tickets' },
            { ruta: '/agregarTickets', label: 'Subir Ticket' },
        ],
    },
    {
        ruta: '',
        label: 'Administración',
        icon: SettingOutlined,
        subMenu: [
            { ruta: '/listarTickets', label: 'Gestión de usuarios' },
            { ruta: '/gestionarMesas', label: 'Gestión mesas' },
        ],
    },
];


onMounted(async () => {
    try {
        const usuarioRegistrado = ref(localStorage.getItem('loginUserToken'));
        
        if (usuarioRegistrado.value) {
            try {
                const data = await userInfo();

                if (data && data.access_level > 3) {
                    menuActual.value = rutasMenuAdmin;
                }else{
                    menuActual.value = rutasMenu;
                }
            } catch (error) {
                menuActual.value = rutasMenu;
            }
        }
    } catch (error) {
        message.error('Hubo un error al iniciar sesión '+error);
    }

});

const navegar = ({ key }) => {
    router.push(key);
    cambiarEstadoSidebar();
};
</script>

<template>

    <a-drawer v-if="pantallaPeque" v-model:open="menuAbierto" placement="left" :width="220" title="Menú">
        <a-menu mode="inline" :selectedKeys="[route.path]" @click="navegar">
            <template v-for="entrada in menuActual" :key="entrada.ruta">
                <a-menu-item v-if="!entrada.subMenu?.length" :key="entrada.ruta">
                    <template #icon><component :is="entrada.icon" /></template>
                    {{ entrada.label }}
                </a-menu-item>
                <a-sub-menu v-else :key="entrada.label">
                    <template #icon><component :is="entrada.icon" /></template>
                    <template #title>{{ entrada.label }}</template>
                    <a-menu-item v-for="sub in entrada.subMenu" :key="sub.ruta">
                        {{ sub.label }}
                    </a-menu-item>
                </a-sub-menu>
            </template>
        </a-menu>
    </a-drawer>

    <a-layout-sider v-else>
        <a-menu mode="inline" :selectedKeys="[route.path]" @click="navegar">
            <template v-for="entrada in menuActual" :key="entrada.ruta">

                <a-menu-item v-if="!entrada.subMenu || !entrada.subMenu.length" :key="entrada.ruta">
                    <template #icon>
                        <component :is="entrada.icon" />
                    </template>
                    {{ entrada.label }}
                </a-menu-item>

                <a-sub-menu v-else :key="entrada.label">
                    <template #icon >
                        <component :is="entrada.icon" />
                    </template>
                    <template #title>{{ entrada.label }}</template>
                    <a-menu-item v-for="subEntrada in entrada.subMenu" :key="subEntrada.ruta">
                        {{ subEntrada.label }}
                    </a-menu-item>
                </a-sub-menu>
            </template>
        </a-menu>
    </a-layout-sider>
</template>