<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { HomeOutlined, UserOutlined, HistoryOutlined, ShoppingOutlined, ShopOutlined, TagsOutlined, SettingOutlined } from '@ant-design/icons-vue';
import './Sidebar.css';
import { message } from 'ant-design-vue';
import { userInfo } from '../../Services/api';
import { funcinalidadSidebar } from '../../Components/componenteDashboard/js/ocultarSidebar';

const { cambiarEstadoSidebar, sidebarAbierto } = funcinalidadSidebar();

const menuAbierto = ref(sidebarAbierto);

const router = useRouter();

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
    { key: '7', ruta: '/marketplace', label: 'Marketplace', icon: ShopOutlined },
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
    { key: '1', ruta: '/', label: 'Inicio', icon: HomeOutlined },
    { key: '2', ruta: '/zonaPersonal', label: 'Zona Personal', icon: UserOutlined },
    { key: '5', ruta: '/historial', label: 'Historial', icon: HistoryOutlined },
    { key: '6', ruta: '/realizarPedido', label: 'Realizar Pedido', icon: ShoppingOutlined },
    { key: '7', ruta: '/marketplace', label: 'Marketplace', icon: ShopOutlined },
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
    {
        key: 'sub2',
        ruta: '',
        label: 'Administración',
        icon: SettingOutlined,
        subMenu: [
            { key: '9', ruta: '/listarTickets', label: 'Gestión de usuarios' },
            { key: '10', ruta: '/agregarTickets', label: 'Gestión mesas' },
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
</script>

<template>

    <a-drawer v-if="pantallaPeque" v-model:open="menuAbierto" placement="left" :width="220" title="Menú">
        <div class="menuMovil">
            <template v-for="entrada in menuActual" :key="entrada.key">
                <RouterLink v-if="!entrada.subMenu || !entrada.subMenu.length" :to="entrada.ruta"
                    @click="cambiarEstadoSidebar">
                    <component :is="entrada.icon" class="iconoMovil" />
                    {{ entrada.label }}
                </RouterLink>

                <div v-else class="grupoMovil">
                    <span class="tituloGrupo">
                        <component :is="entrada.icon" class="iconoMovil" />
                        {{ entrada.label }}
                    </span>
                    <RouterLink v-for="subEntrada in entrada.subMenu" :key="subEntrada.key" :to="subEntrada.ruta"
                        @click="cambiarEstadoSidebar">
                        {{ subEntrada.label }}
                    </RouterLink>
                </div>
            </template>
        </div>
    </a-drawer>

    <a-layout-sider v-else theme="light" breakpoint="md" :collapsed-width="0" :trigger="null" class="sidebarCustom">
        <a-menu theme="light" mode="inline" :default-selected-keys="['1']" class="sidebarMenu">
            <template v-for="entrada in menuActual" :key="entrada.key">

                <a-menu-item v-if="!entrada.subMenu || !entrada.subMenu.length"
                    @click="router.push(entrada.ruta)">
                    <template #icon>
                        <component :is="entrada.icon" />
                    </template>
                    {{ entrada.label }}
                </a-menu-item>

                <a-sub-menu v-else :key="entrada.key">
                    <template #icon >
                        <component :is="entrada.icon" />
                    </template>
                    <template #title>{{ entrada.label }}</template>
                    <a-menu-item v-for="subEntrada in entrada.subMenu" :key="subEntrada.key"
                        @click="router.push(subEntrada.ruta)">
                        {{ subEntrada.label }}
                    </a-menu-item>
                </a-sub-menu>
            </template>
        </a-menu>
    </a-layout-sider>
</template>