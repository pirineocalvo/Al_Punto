import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAutentificacion, guardarToken, cerrarSesionUsuario } from './gestionAlmacenamiento.js';

export const iniciarSesionUsuario = async (datos = {}) => {
    try {
        const respuesta = await axios.post(`${URL_API}/api/usuario/iniciarSesion`, datos);
        guardarToken(respuesta.data.token);
        return respuesta.data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

export const informacionUsuario = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/usuario/informacion`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener información del usuario:', error);
        throw error;
    }
};

export const registrarUsuario = async (datos = {}) => {
    try {
        const respuesta = await axios.post(`${URL_API}/api/usuario/registrar`, datos);
        if (respuesta.status === 201 || respuesta.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        if (error.response) {
            return error.response.status;
        }
        return 500;
    }
};