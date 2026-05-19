<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons-vue';
import { registrarUsuario } from '../../services/usuariosEndpoint';
import { message } from 'ant-design-vue';

const router = useRouter();
const cargandoRegistro = ref(false);

const formState = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
});

const rules = {
    firstName: [
        {
            required: true,
            message: '¡Debe introducir su nombre!',
            trigger: 'blur'
        },
        {
            pattern: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/,
            message: 'El nombre debe empezar por mayúscula y solo contener letras',
            trigger: 'blur'
        }
    ],
    lastName: [
        {
            required: true,
            message: '¡Debe introducir sus apellidos!',
            trigger: 'blur'
        },
        {
            pattern: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/,
            message: 'Los apellidos deben empezar por mayúscula y solo contener letras',
            trigger: 'blur'
        }
    ],
    phone: [
        {
            required: true,
            message: '¡Debe introducir su número de teléfono!',
            trigger: 'blur'
        },
        {
            pattern: /^\d{9}$/,
            message: 'El teléfono debe tener exactamente 9 dígitos',
            trigger: 'blur'
        }
    ],
    email: [
        {
            required: true,
            message: '¡Debe proporcionar un correo electrónico!',
            trigger: 'blur'
        },
        {
            pattern: /^[^@\s]+@[a-z]+\.(com|es)$/,
            message: 'El correo debe tener formato válido (ejemplo@dominio.com o .es)',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: '¡Debe introducir una contraseña!',
            trigger: 'blur'
        },
        {
            pattern: /^(?=.*[^a-zA-Z0-9]).{8,}$/,
            message: 'La contraseña debe tener mínimo 8 caracteres y al menos un símbolo especial',
            trigger: 'blur'
        }
    ]
};

onMounted(() => {
    const token = localStorage.getItem('loginUserToken');
    if (token) {
        router.push('/');
    }
});

async function guardarUsuario() {
    cargandoRegistro.value = true;
    try {
        const res = await registrarUsuario(formState.value);

        if (res === true) {
            message.success('¡Usuario creado correctamente!');
            router.push('/iniciarSesion');
        } else if (res === 409) {
            message.error('El correo que trata de utilizar ya se encuentra en uso');
        } else {
            message.error('Error al crear el usuario');
        }
    } catch (err) {
        console.error(err);
        message.error('Error inesperado al intentar registrarse');
    } finally {
        cargandoRegistro.value = false;
    }
}

function volver() {
    router.push('/');
}

function iniciarSesion() {
    router.push('/iniciarSesion');
}
</script>

<template>
    <a-layout class="contenedorLogin">
        <a-row type="flex" justify="center" align="middle" class="tarjetaInicioSesion">
            <a-col :xs="22" :md="16" :lg="8">
                <a-card class="registerCard">
                    <a-typography-title :level="2" class="text-center">Registrarse</a-typography-title>

                    <a-form :model="formState" :rules="rules" @finish="guardarUsuario" layout="vertical">
                        <a-form-item label="Nombre" name="firstName">
                            <a-input v-model:value="formState.firstName" placeholder="Nombre">
                                <template #prefix>
                                    <UserOutlined />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="Apellidos" name="lastName">
                            <a-input v-model:value="formState.lastName" placeholder="Apellidos">
                                <template #prefix>
                                    <IdcardOutlined />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="Teléfono" name="phone">
                            <a-input v-model:value="formState.phone" placeholder="612345678">
                                <template #prefix>
                                    <PhoneOutlined />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="Correo electrónico" name="email">
                            <a-input v-model:value="formState.email" placeholder="Correo electrónico">
                                <template #prefix>
                                    <MailOutlined />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="Contraseña" name="password">
                            <a-input-password v-model:value="formState.password" placeholder="Contraseña">
                                <template #prefix>
                                    <LockOutlined />
                                </template>
                            </a-input-password>
                        </a-form-item>

                        <a-form-item>
                            <a-flex justify="center">
                                <a-space size="middle">
                                    <a-button type="primary" html-type="submit" size="large"
                                        :loading="cargandoRegistro">
                                        Registrarse
                                    </a-button>
                                    <a-button @click="volver" size="large" :disabled="cargandoRegistro">
                                        Volver
                                    </a-button>
                                </a-space>
                            </a-flex>
                        </a-form-item>

                        <a-flex justify="center">
                            <a-typography-text>
                                ¿Ya eres miembro?
                                <a-typography-link @click="iniciarSesion()">Iniciar sesión</a-typography-link>
                            </a-typography-text>
                        </a-flex>
                    </a-form>
                </a-card>
            </a-col>
        </a-row>
    </a-layout>
</template>