<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { registerUser } from '../../Services/api'
import './Register.css'

const router = useRouter()
const error = ref('')

const formState = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
})

const rules = {
    firstName: [
        {
            required: true,
            message: '¡Debe introducir su nombre!',
            trigger: 'blur'
        }
    ],
    lastName: [
        {
            required: true,
            message: '¡Debe introducir sus apellidos!',
            trigger: 'blur'
        }
    ],
    phone: [
        {
            required: true,
            message: '¡Debe introducir su número de teléfono!',
            trigger: 'blur'
        }
    ],
    email: [
        {
            required: true,
            message: '¡Debe proporcionar un correo electrónico!',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: '¡Debe introducir una contraseña!',
            trigger: 'blur'
        }
    ]
}

onMounted(() => {
    const token = localStorage.getItem('loginUserToken')
    if (token) {
        router.push('/')
    }
})

async function registrarUsuario() {
    error.value = ''

    try {
        const res = await registerUser(formState.value)

        if (res === true) {
            router.push('/login')
        } else {
            error.value = res
        }
    } catch (err) {
        console.error('Error al registrar:', err)
        error.value = 'Ha ocurrido un error al registrarse.'
    }
}

function volver() {
    router.back()
}
</script>
<template>
    <section class="contenedorLogin">
        <a-alert v-if="error" :message="error" type="error" show-icon style="margin-bottom: 16px" />

        <a-form :model="formState" :rules="rules" @finish="registrarUsuario">
            <a-form-item label="Nombre" name="firstName" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                <a-input v-model:value="formState.firstName" placeholder="Nombre">
                    <template #prefix>
                        <UserOutlined />
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="Apellidos" name="lastName" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                <a-input v-model:value="formState.lastName" placeholder="Apellidos">
                    <template #prefix>
                        <UserOutlined />
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="Teléfono" name="phone" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                <a-input v-model:value="formState.phone" placeholder="612345678">
                    <template #prefix>
                        <UserOutlined />
                    </template>
                </a-input>
            </a-form-item>

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
                    <a-button type="primary" html-type="submit">
                        Registrarse
                    </a-button>
                    <a-button @click="volver">
                        Volver
                    </a-button>
                </div>
            </a-form-item>
        </a-form>
    </section>
</template>