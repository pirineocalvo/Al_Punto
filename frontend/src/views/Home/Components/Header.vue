<template>
    <header>
        <h2>AL PUNTO</h2>
    
        <nav v-if="!pantallaPeque">
            <template v-for="entrada in menuActual" :key="entrada.label">

                <RouterLink v-if="!entrada.subMenu || !entrada.subMenu.length" :to="entrada.ruta">
                    {{ entrada.label }}
                </RouterLink>

                <a-dropdown v-else placement="bottom" overlayClassName="dropdownNav" :getPopupContainer="(element) => element.parentElement" :align="{ offset: [0, 20] }">
                    <span class="enlaceNav">{{ entrada.label }}</span>
                    <template #overlay>
                        <a-menu>
                            <a-menu-item v-for="subEntrada in entrada.subMenu" :key="subEntrada.ruta">
                                <RouterLink :to="subEntrada.ruta" class="submenuItem">
                                    {{ subEntrada.label }}
                                </RouterLink>
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>

            </template>
        </nav>

        <nav v-else>
            <button type="button" @click="menuAbierto = true">
                <MenuOutlined />
            </button>
        </nav>

        <a-drawer v-model:open="menuAbierto" placement="left" :width="220" title="Menú">
            <div class="menuMovil">
                <template v-for="entrada in menuActual" :key="entrada.label">

                    <RouterLink v-if="!entrada.subMenu || !entrada.subMenu.length" :to="entrada.ruta" @click="menuAbierto = false">
                        {{ entrada.label }}
                    </RouterLink>

                    <div v-else class="grupoMovil">
                        <span class="tituloGrupo">{{ entrada.label }}</span>
                        <RouterLink v-for="subEntrada in entrada.subMenu" :key="subEntrada.ruta" :to="subEntrada.ruta" @click="menuAbierto = false">
                            {{ subEntrada.label }}
                        </RouterLink>
                    </div>

                </template>
            </div>
        </a-drawer>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MenuOutlined } from '@ant-design/icons-vue'
import './Header.css'

const tamanoPantalla = ref(window.innerWidth)
const pantallaPeque = computed(() => tamanoPantalla.value < 768)
const actualizarTamanoPantalla = () => { tamanoPantalla.value = window.innerWidth }

onMounted(() => window.addEventListener('resize', actualizarTamanoPantalla))
onUnmounted(() => window.removeEventListener('resize', actualizarTamanoPantalla))

const menuAbierto = ref(false)
const usuarioRegistrado = ref(!!localStorage.getItem('loginUserToken'))

const menuActual = computed(() => usuarioRegistrado.value ? menuConLog : menuSinLog)

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
]

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
]
</script>