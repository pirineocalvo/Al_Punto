import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { informacionUsuario } from '@/services/usuariosEndpoint';

export const ACCESS_LEVELS = {
    CLIENTE: 1,
    EMPLEADO: 3,
    ADMIN: 5,
};

export function useAuth({ rutaLogin = '/iniciarSesion', minAccessLevel = ACCESS_LEVELS.CLIENTE } = {}) {
    const router = useRouter();
    const usuarioCacheado = ref(null); // ← movido dentro de la función
    const usuarioListo = ref(false);

    const refrescarUsuario = async () => {
        usuarioCacheado.value = await informacionUsuario();
    };

    const validarUser = async () => {
        const token = localStorage.getItem('loginUserToken');
        if (!token) {
            router.push(rutaLogin);
            return;
        }

        try {
            await refrescarUsuario(); // ← siempre refresca, sin caché

            if (usuarioCacheado.value.access_level < minAccessLevel) {
                router.push('/noAutorizado');
                return;
            }
            usuarioListo.value = true;

        } catch (err) {
            router.push('/noAutorizado');
        }
    };

    const limpiarCacheUser = () => {
        usuarioCacheado.value = null;
        localStorage.removeItem('loginUserToken');
    };

    validarUser();

    return {
        user: usuarioCacheado,
        usuarioListo,
        limpiarCacheUser,
        refrescarUsuario,
    };
}