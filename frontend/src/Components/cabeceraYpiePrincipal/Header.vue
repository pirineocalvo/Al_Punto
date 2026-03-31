<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MenuOutlined } from '@ant-design/icons-vue'
import './Header.css'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter();
const route = useRoute();

const menuAbierto = ref(false);
const usuarioRegistrado = ref(localStorage.getItem('loginUserToken'));

const pantallaPeque = ref(window.innerWidth < 768);

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

const menuActual = computed(() => usuarioRegistrado.value ? menuConLog : menuSinLog);

const actualizarTamano = () => {
    pantallaPeque.value = window.innerWidth < 768
}

onMounted(() => window.addEventListener('resize', actualizarTamano));
onUnmounted(() => window.removeEventListener('resize', actualizarTamano));
</script>
<template>
    <a-layout-header>
        <h2>AL PUNTO</h2>
        <nav v-if="!pantallaPeque">
            <a-menu mode="horizontal" :selectedKeys="[rutaActual]" @click="({ key }) => router.push(key)">
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
        </nav>
        <nav v-else>
            <button type="button" class="btnMenuMovil" @click="menuAbierto = true">
                <MenuOutlined />
            </button>
        </nav>
            <a-drawer v-model:open="menuAbierto" placement="left" :width="220" title="Menú">
            <div class="menuMovil">
                <template v-for="entrada in menuActual" :key="entrada.label">
                    <RouterLink v-if="!entrada.subMenu || !entrada.subMenu.length" :to="entrada.ruta"
                        @click="menuAbierto = false">
                        {{ entrada.label }}
                    </RouterLink>

                    <div v-else class="grupoMovil">
                        <span class="tituloGrupo">{{ entrada.label }}</span>
                        <RouterLink v-for="subEntrada in entrada.subMenu" :key="subEntrada.ruta" :to="subEntrada.ruta"
                            @click="menuAbierto = false">
                            {{ subEntrada.label }}
                        </RouterLink>
                    </div>
                </template>
            </div>
        </a-drawer>
    </a-layout-header>
</template>
