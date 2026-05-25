import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAdmin, obtenerTokenAutentificacion } from './gestionAlmacenamiento';

export const obtenerMenu = async () => {
    try {
        const respuesta = await axios.get(`${URL_API}/api/menu`);
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener el menu:', error);
        throw error;
    }
};

export const obtenerCategorias = async () => {
    try {
        const respuesta = await axios.get(`${URL_API}/api/menu/categorias`);
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
        throw error;
    }
};

export const obtenerMenuPorCategoria = async (datos = {}) => {
    try {
        const respuesta = await axios.get(`${URL_API}/api/menu/${datos.idcategory}`);
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener el menu por categoria:', error);
        throw error;
    }
};

export const agregarItemMenu = async (datos = {}) => {
    try {
        const token = obtenerTokenAutentificacion();
        const tokenAdmin = obtenerTokenAdmin();
        const configuracion = {
            headers: token ? { Authorization: `Bearer ${token} ${tokenAdmin}` } : {},
        };
        const respuesta = await axios.post(`${URL_API}/api/menu/agregar`, datos, configuracion);
        return respuesta.data;
    } catch (error) {
        console.error('Error al agregar item al menu:', error);
        throw error;
    }
};

export const actualizarItemMenu = async (datos = {}) => {
    try {
        const token = obtenerTokenAutentificacion();
        const tokenAdmin = obtenerTokenAdmin();
        const configuracion = {
            headers: token ? { Authorization: `Bearer ${token} ${tokenAdmin}` } : {},
        };
        const respuesta = await axios.post(`${URL_API}/api/menu/actualizar`, datos, configuracion);
        return respuesta.data;
    } catch (error) {
        console.error('Error al actualizar item del menu:', error);
        throw error;
    }
};

export const agregarCategoria = async (datos = {}) => {
    try {
        const token = obtenerTokenAutentificacion();
        const tokenAdmin = obtenerTokenAdmin();
        const configuracion = {
            headers: token ? { Authorization: `Bearer ${token} ${tokenAdmin}` } : {},
        };
        const respuesta = await axios.post(`${URL_API}/api/menu/agregarCategoria`, datos, configuracion);
        return respuesta.data;
    } catch (error) {
        console.error('Error al agregar categoria:', error);
        throw error;
    }
};