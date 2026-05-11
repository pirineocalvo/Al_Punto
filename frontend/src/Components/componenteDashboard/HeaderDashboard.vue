<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons-vue';
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
    <a-layout-header class="headerContainer headerDashboard">
        <a-row type="flex" justify="space-between" align="middle" style="width: 100%;">

            <a-col :flex="1">
                <div class="headerLeft">
                    <a-button v-if="pantallaPeque" type="text" class="mobileMenuButton" @click="cambiarEstadoSidebar">
                        <MenuOutlined style="color: #E8C9A0;" />
                    </a-button>

                    <a-typography-title v-else :level="4" style="margin: 0; color: #E8C9A0;">
                        Bienvenido, {{ user?.first_name || 'Invitado' }}
                    </a-typography-title>
                </div>
            </a-col>

            <a-col>
                <div class="headerRight">
                    <a-dropdown :trigger="['click']" placement="bottomRight">
                        <div class="avatarContainer">
                            <a-avatar class="userAvatar">
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
                </div>
            </a-col>

        </a-row>
    </a-layout-header>
</template>

<style scoped>
.headerDashboard {
    background-color: var(--color-menu-fondo);
    padding: 0 24px;
    display: flex;
    align-items: center;
}

.headerLeft {
    display: flex;
    align-items: center;
}

.headerRight {
    display: flex;
    align-items: center;
}

.avatarContainer {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.userAvatar {
    background-color: #D97742;
    border: 1px solid rgba(232, 201, 160, 0.3);
}

.mobileMenuButton {
    padding: 0;
    width: 32px;
    height: 32px;
}
</style>