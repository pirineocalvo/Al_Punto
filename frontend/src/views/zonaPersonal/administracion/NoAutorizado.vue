<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
    <a-result
        status="403"
        title="Error 403"
        sub-title="No tienes permiso para acceder a esta página."
    >
        <template #extra>
            <a-button type="primary" @click="router.push('/zonaPersonal')">
                Volver
            </a-button>
        </template>
    </a-result>
</template>