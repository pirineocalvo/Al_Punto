<script setup>
import { useRouter } from 'vue-router'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import "./HeaderDashboard.css";

const props = defineProps(["user"]);

const router = useRouter()

const logout = () => {
    localStorage.removeItem('loginUserToken')
    router.push('/login')
}
</script>

<template>
    <div class="dashboard-header">
        <div class="header-left">
            <h2>
                Bienvenido, {{ user?.first_name || 'Usuario' }}
            </h2>
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