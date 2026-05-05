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
    router.back();
}
</script>
<template>
    <a-layout class="contenedorLogin">
        <a-row type="flex" justify="center" align="middle" class="formaTarjeta">
            <a-col :xs="22" :md="12" :lg="8">
                <a-card>
                    <a-flex vertical align="center" gap="large">
                        <a-typography-title :level="2" style="text-align: center;">¿Estás seguro de que quieres cerrar sesión?</a-typography-title>
                        <div >
                            <a-space size="middle">
                                <a-button type="primary" size="large" @click="logout">Sí, salir</a-button>
                                <a-button size="large" @click="volver">No, volver</a-button>
                            </a-space>
                        </div>

                    </a-flex>
                </a-card>
            </a-col>
        </a-row>
    </a-layout>
</template>