<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import './Logout.css';

const router = useRouter();

onMounted(() => {
    const token = localStorage.getItem('loginUserToken')
    if (!token) {
        router.push('/');
    }
})

function logout() {
    localStorage.removeItem('loginUserToken');
    router.push('/');
}

function volver() {
    router.push('/');
}
</script>
<template>
    <section class="contenedorLogin">
        <a-card class="logoutBox">
            <a-typography-title :level="2" style="text-align: center;">
                ¿Estás seguro de que quieres cerrar sesión?
            </a-typography-title>
            <div class="separarBtn">
                <a-button type="primary" @click="logout">
                    Sí
                </a-button>

                <a-button @click="volver">
                    No
                </a-button>
            </div>
        </a-card>
    </section>
</template>
