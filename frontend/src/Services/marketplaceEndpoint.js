import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const pedidosRealizadosMarketPlace = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/marketplace/miCartera`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener cartera:', error);
        throw error;
    }
};

export const listaProductosMarketplace = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/marketplace/productos`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener productos:', error);
        throw error;
    }
};

export const canjearProductoMarketplace = async (id) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/marketplace/comprar/${id}`, {}, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al canjear producto:', error);
        throw error;
    }
};

export const usarProductoMarket = async (idUsuario, tokenUrl) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/marketplace/cartera/${idUsuario}/usar/${tokenUrl}`, {}, configuracion);
        return respuesta.data;
    } catch (error) {
        console.error('Error al usar producto:', error);
        throw error;
    }
};