import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const agregarResenia = async (datos = {}) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/resenias`, datos, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al agregar resenia:', error);
        throw error;
    }
};

export const obtenerMisResenias = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/resenias/misResenias`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener mis resenias:', error);
        throw error;
    }
};

export const obtenerReseniasPorPlato = async (idPlato) => {
    try {
        const respuesta = await axios.get(`${URL_API}/api/resenias/${idPlato}`);
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener resenias del plato:', error);
        throw error;
    }
};