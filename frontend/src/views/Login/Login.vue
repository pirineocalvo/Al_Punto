<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { loginUser } from '../../Services/api'
import './Login.css'

const router = useRouter()

const formState = ref({
    email: '',
    password: ''
})

const rules = {
    email: [
        {
            required: true,
            message: '¡Debe proporcionar el correo asociado a su cuenta!',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: '¡Debe introducir la contraseña!',
            trigger: 'blur'
        }
    ]
}

async function verificarUser() {
    try {
        await loginUser(formState.value)
        router.push('/')
    } catch (error) {
        console.error('Error al iniciar sesión:', error)
    }
}

const volver = () => {
    router.back()
}
</script>

<template>
    <div class="contenedorLogin">
        <a-card class="cardLogin">
            <a-form :model="formState" :rules="rules" @finish="verificarUser()">
                <a-form-item label="Correo electrónico" name="email" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                    <a-input v-model:value="formState.email" placeholder="Correo electrónico">
                        <template #prefix>
                            <UserOutlined />
                        </template>
                    </a-input>
                </a-form-item>

                <a-form-item label="Contraseña" name="password" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                    <a-input-password v-model:value="formState.password" placeholder="Contraseña">
                        <template #prefix>
                            <LockOutlined />
                        </template>
                    </a-input-password>
                </a-form-item>

                <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                    <div class="separarBtn">
                        <a-button class="btnPrincipal" type="primary" html-type="submit">Iniciar sesión</a-button>
                        <a-button class="btnSecundario" @click="volver">Volver</a-button>
                    </div>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>