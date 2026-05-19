import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';


export const pedidosRealizadosMarketPlace = async () => {
    try {
        const token = getTokenAutentificacion()
        const config = {
            headers: { authorization: `Bearer ${token}` },
        }

        const response = await axios.get(`${API_URL}/api/marketplace/mypocket`, config)
        return response.data
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario()
        }
        console.error('Error cancelando pedido:', error)
        throw error
    }
}

export const listaProductosMarketplace = async () => {
    try {
        const token = getTokenAutentificacion()
        const config = {
            headers: { authorization: `Bearer ${token}` },
        }

        const response = await axios.get(`${API_URL}/api/marketplace/items`, config)
        return response.data
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario()
        }
        console.error('Error cancelando pedido:', error)
        throw error
    }
}

export const cangearProductoMarkePlace = async (id) => {
    try {
        const token = getTokenAutentificacion()
        const config = {
            headers: { authorization: `Bearer ${token}` },
        }

        const response = await axios.post(`${API_URL}/api/marketplace/comprar/${id}`, {}, config)
        return response.data
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario()
        }
        console.error('Error cancelando pedido:', error)
        throw error
    }
}

export const usarProductoMarket = async (userId, tokenUrl) => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.post(`${API_URL}/api/marketplace/pocket/${userId}/use/${tokenUrl}`, {}, config);
        return response.data;
    } catch (error) {
        console.error('Error al canjear producto:', error);
        throw error;
    }
};