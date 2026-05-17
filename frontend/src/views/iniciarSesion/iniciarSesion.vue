<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { loginUser } from '../../services/api';
import { message } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();

const formState = ref({
    email: '',
    password: ''
});

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
};

async function verificarUser() {
    try {
        await loginUser(formState.value);

        const redirect = route.query.redirect || '/';
        router.push(redirect);
    } catch (errorFromBack) {
        message.error('El usuario o la contraseña no son válidos');
    }
}

const volver = () => {
    router.push('/');
};

function registrarse() {
    router.push('/registrarse');
}
</script>

<template>
    <a-layout class="contenedorLogin">
        <a-row type="flex" justify="center" align="middle" class="tarjetaInicioSesion">
            <a-col :xs="22" :md="12" :lg="8">

                <a-card>
                    <a-flex vertical align="center" gap="large">

                        <a-typography-title :level="2">
                            Inicio de sesión
                        </a-typography-title>

                        <a-form :model="formState" :rules="rules" @finish="verificarUser" layout="vertical"
                            style="width: 100%">
                            <a-form-item label="Correo electrónico" name="email">
                                <a-input v-model:value="formState.email" placeholder="Correo electrónico">
                                    <template #prefix>
                                        <UserOutlined />
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
                                        <a-button type="primary" html-type="submit" size="large">Iniciar
                                            sesión</a-button>
                                        <a-button @click="volver" size="large">Volver</a-button>
                                    </a-space>
                                </a-flex>
                            </a-form-item>

                            <a-flex justify="center">
                                <a-typography-text>
                                    ¿Aún no tienes cuenta?
                                    <a-typography-link @click="registrarse"> ¡Únete a la familia!</a-typography-link>
                                </a-typography-text>
                            </a-flex>
                        </a-form>

                    </a-flex>
                </a-card>

            </a-col>
        </a-row>
    </a-layout>
</template>