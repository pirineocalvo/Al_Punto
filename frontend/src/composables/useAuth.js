import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { informacionUsuario } from '@/services/usuariosEndpoint';

export const ACCESS_LEVELS = {
    CLIENTE: 1,
    EMPLEADO: 3,
    ADMIN: 5,
};

const usuarioCacheado = ref(null);

export function useAuth({rutaLogin ='/iniciarSesion', nivelMin = ACCESS_LEVELS.CLIENTE}) {
    const router  = useRouter();
    const usuarioListo = ref(false);

    const validarUser = async () => {
        const token = localStorage.getItem('loginUserToken');
        if (!token) {
            router.push(rutaLogin); 
            return;
        }

        try {

        if(!usuarioCacheado.value){
            usuarioCacheado.value = await informacionUsuario();
        }

        if(usuarioCacheado.value.access_level < nivelMin){
            router.push('/noAutorizado');
        }
        usuarioListo.value = true; 

        } catch (err) {
            router.push('/noAutorizado');
            return;
        }
    };

    const limpiarCacheUser = () =>{
    
        usuarioCacheado.value = null;
    localStorage.removeItem('loginUserToken');
    };

    validarUser();

    return{
        user: usuarioCacheado,
        usuarioListo,
        limpiarCacheUser
    };
}

