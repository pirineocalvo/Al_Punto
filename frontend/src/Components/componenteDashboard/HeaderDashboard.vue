<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { MenuOutlined, LogoutOutlined, StarFilled } from '@ant-design/icons-vue';
import { funcinalidadSidebar } from '../../Components/componenteDashboard/js/ocultarSidebar';


const { cambiarEstadoSidebar } = funcinalidadSidebar();
const props = defineProps(["user"]);
const router = useRouter();

const pantallaPeque = ref(window.innerWidth < 768);
const actualizarTamano = () => { pantallaPeque.value = window.innerWidth < 768; };

onMounted(() => window.addEventListener('resize', actualizarTamano));
onUnmounted(() => window.removeEventListener('resize', actualizarTamano));

const logout = () => router.push('/logout');
</script>

<template>
    <a-layout-header class="contenedorHeader headerDashboard">
        <a-row>
            <a-col :lg="18">
                <a-button v-if="pantallaPeque" type="text" class="botonMenuMovil" @click="cambiarEstadoSidebar">
                    <MenuOutlined />
                </a-button>
                <a-typography-title :level="4" v-else style="margin: 0; color: #E8C9A0">
                    Bienvenido, {{ user?.first_name || 'Invitado' }}
                </a-typography-title>
            </a-col>

            <a-col :lg="6">
                <a-row>
                    <a-col v-if="!pantallaPeque">
                        <a-tag color="gold" class="puntos-tag">
                            <StarFilled /> {{ user?.points || 0 }} Puntos
                        </a-tag>
                    </a-col>
                    <a-col>
                    <a-dropdown :trigger="['click']" placement="bottomRight">
                        <div class="">
                            <a-avatar style="background-color: #D97742; cursor: pointer;">
                                {{ user?.first_name?.charAt(0).toUpperCase() }}
                            </a-avatar>
                        </div>
                        <template #overlay>
                            <a-menu>
                                <a-menu-item key="logout" danger @click="logout">
                                    <template #icon>
                                        <LogoutOutlined />
                                    </template>
                                    Cerrar sesión
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
    </a-layout-header>
</template>
<style scoped>
.headerDashboard {
    background-color: var(--color-menu-fondo);
}
</style>
