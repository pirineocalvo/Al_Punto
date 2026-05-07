<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MenuOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import { userInfo } from '../../Services/api';

const router = useRouter();
const route = useRoute();

const menuAbierto = ref(false);

const pantallaPeque = ref(window.innerWidth < 768);

const menuActual = ref(null);
const menuSinLog = [
    { ruta: '/', label: 'Inicio' },
    { ruta: '/menu', label: 'Menú' },
    {
        ruta: '',
        label: 'Acceder',
        subMenu: [
            { ruta: '/login', label: 'Inicio de sesión' },
            { ruta: '/register', label: 'Registrarse' },
        ],
    },
];

const menuConLog = [
    { ruta: '/', label: 'Inicio' },
    { ruta: '/menu', label: 'Menú' },
    {
        ruta: '',
        label: 'Acceder',
        subMenu: [
            { ruta: '/logout', label: 'Cerrar Sesión' },
        ],
    },
    { ruta: '/zonaPersonal', label: 'Zona Personal' },
    { ruta: '/reservas', label: 'Reservas' },
];

const actualizarTamano = () => { pantallaPeque.value = window.innerWidth < 768 };

onMounted(async () => {
    try {
        const usuarioRegistrado = ref(localStorage.getItem('loginUserToken'));

        if (usuarioRegistrado.value) {
            try {
                const data = await userInfo();
                if (data) {
                    menuActual.value = menuConLog;
                } else {
                    menuActual.value = menuSinLog;
                }
            } catch (error) {
                menuActual.value = menuSinLog;
            }
        } else {
            menuActual.value = menuSinLog;
        }
    } catch (error) {
        message.error('Hubo un error al iniciar sesión ' + error);
    }

});

const navegar = ({ key }) => {
    router.push(key);
};

onMounted(() => window.addEventListener('resize', actualizarTamano));
onUnmounted(() => window.removeEventListener('resize', actualizarTamano));
</script>
<template>
    <a-layout-header class="contenedorHeader">
        <a-typography-title :level="2">AL PUNTO</a-typography-title>
        <a-menu v-if="!pantallaPeque" mode="horizontal" :selectedKeys="[route.path]" @click="navegar">
            <template v-for="entrada in menuActual" :key="entrada.ruta || entrada.key">

                <a-menu-item v-if="!entrada.subMenu || !entrada.subMenu.length" :key="entrada.ruta">
                    {{ entrada.label }}
                </a-menu-item>

                <a-sub-menu v-else :key="entrada.key">
                    <template #title>{{ entrada.label }}</template>
                    <a-menu-item v-for="subEntrada in entrada.subMenu" :key="subEntrada.ruta">
                        {{ subEntrada.label }}
                    </a-menu-item>
                </a-sub-menu>
            </template>
        </a-menu>
        <button v-else type="button" class="botonMenuMovil" @click="menuAbierto = true">
            <MenuOutlined />
        </button>
        <a-drawer v-model:open="menuAbierto" placement="left" :width="220" title="Menú">
            <a-menu mode="inline" :selectedKeys="[route.path]" @click="navegar">
                <template v-for="entrada in menuActual" :key="entrada.label">
                    <a-menu-item v-if="!entrada.subMenu?.length" :key="entrada.ruta" @click="menuAbierto = false">
                        {{ entrada.label }}
                    </a-menu-item>
                    <a-sub-menu v-else>
                        <template #title>{{ entrada.label }}</template>
                        <a-menu-item v-for="subEntrada in entrada.subMenu" :key="subEntrada.ruta" @click="menuAbierto = false">
                            {{ subEntrada.label }}
                        </a-menu-item>
                    </a-sub-menu>
                </template>
            </a-menu>
        </a-drawer>
    </a-layout-header>
</template>
<style scoped>
.contenedorHeader {
    position: fixed;
    z-index: 1000;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-menu-fondo);
    padding: 10px 20px;
}

.contenedorHeader h2 {
    margin: 0;
    color: var(--color-menu-texto); 
}


</style>