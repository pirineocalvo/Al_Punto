<template>
    <section class="contenedorLogin">
        <div class="logoutBox">
            <h2>¿Estás seguro de que quieres cerrar sesión?</h2>

            <div class="separarBtn">
                <a-button class="btnPrincipal" type="primary" @click="logout">
                    Sí
                </a-button>

                <a-button class="btnSecundario" @click="volver">
                    No
                </a-button>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import './Logout.css'

const router = useRouter()

onMounted(() => {
    const token = localStorage.getItem('loginUserToken')
    if (!token) {
        router.push('/')
    }
})

function logout() {
    localStorage.removeItem('loginUserToken')
    router.push('/')
}

function volver() {
    router.push('/')
}
</script>