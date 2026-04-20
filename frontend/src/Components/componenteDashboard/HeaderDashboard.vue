<script setup>
import { ref, computed,onMounted, onUnmounted  } from 'vue';
import { useRouter } from 'vue-router';
import { MenuOutlined } from '@ant-design/icons-vue';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { funcinalidadSidebar } from '../../Components/componenteDashboard/js/ocultarSidebar';
import "./HeaderDashboard.css";
const { cambiarEstadoSidebar } = funcinalidadSidebar();

function estadoMenu () {
    cambiarEstadoSidebar();
};

const props = defineProps(["user"]);

const pantallaPeque = ref(window.innerWidth < 768);

const router = useRouter();

const logout = () => {
    router.push('/logout');
}

const actualizarTamano = () => {
    pantallaPeque.value = window.innerWidth < 768;
}

onMounted(() => window.addEventListener('resize', actualizarTamano));
onUnmounted(() => window.removeEventListener('resize', actualizarTamano));


</script>

<template>
    <div class="dashboard-header">
        <div class="header-left">
            <h2 v-if="!pantallaPeque">
                Bienvenido, {{ user?.first_name || 'Usuario' }}
            </h2>
            <nav v-else>
                <button type="button" class="btnMenuMovil" @click="estadoMenu">
                    <MenuOutlined />
                </button>
            </nav>
        </div>
        <div class="header-right">
            <a-dropdown trigger="hover" overlayClassName="custom-dropdown">

                <div class="user-icon">
                    <UserOutlined />
                </div>

                <template #overlay>
                    <a-menu>
                        <a-menu-item @click="logout">
                            <LogoutOutlined />
                            <span>Cerrar sesión</span>
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>
    </div>
</template>