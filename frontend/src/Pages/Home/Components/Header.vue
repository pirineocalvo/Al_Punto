<template>
    <header>
        <h2>Al punto</h2>
        <nav  v-if="!pantallaPeque">
            <div v-for="entrada in (usuarioRegistrado ? menuConLog : menuSinLog)" :key="entrada.label" class="contenedorEnlace" :class="{ menuDesplegable: entrada.subMenu && entrada.subMenu.length }">
                <RouterLink v-if="!entrada.subMenu || !entrada.subMenu.length" :to="entrada.ruta">
                    {{ entrada.label }}
                </RouterLink>

                <span v-else class="enlacePadre">
                    {{ entrada.label }}
                </span>

                <div v-if="entrada.subMenu && entrada.subMenu.length" class="submenu">
                    <div v-for="subEntrada in entrada.subMenu" :key="subEntrada.label">
                        <RouterLink :to="subEntrada.ruta">
                            {{ subEntrada.label }}
                        </RouterLink>
                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import './Header.css'

const tamanoPantalla = ref(window.innerWidth)

const pantallaPeque = computed(() => tamanoPantalla.value < 768)

const actualizarTamanoPantalla = () => {
    tamanoPantalla.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', actualizarTamanoPantalla))
onUnmounted(() => window.removeEventListener('resize', actualizarTamanoPantalla))

const usuarioRegistrado = ref(!!localStorage.getItem('loginUserToken'))

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