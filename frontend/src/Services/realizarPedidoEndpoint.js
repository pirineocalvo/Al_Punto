import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const getProductosCompradosCliente = async () => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/orders/mis-pedidos`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error getting pedidos:', error);
        throw error;
    }
};

export const guardarCarritoCompraClientes = async (data = {}) => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.post(`${API_URL}/api/orders/create`, data, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error subiendo pedidos:', error);
        throw error;
    }
};

export const cancelarPedido = async (id) => {
    try {
        const token = getTokenAutentificacion()
        const config = {
            headers: { authorization: `Bearer ${token}` },
        }

        const response = await axios.delete(`${API_URL}/api/orders/cancelar/${id}`, config)
        return response.data
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario()
        }
        console.error('Error cancelando pedido:', error)
        throw error
    }
}

// Obtener TODOS los pedidos
export const getTodosLosPedidosAdmin = async () => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };

        const response = await axios.get(`${API_URL}/api/orders/admin/todos`, config);
        return response.data;
    } catch (error) {
        console.error('Error al obtener pedidos globales:', error);
        throw error;
    }
};

export const actualizarEstadoOrden = async (id, status, is_picked_up = false) => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };

        const response = await axios.patch(`${API_URL}/api/orders/admin/${id}/status`, {
            status,
            is_picked_up: is_picked_up ? 1 : 0
        }, config);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        throw error;
    }
};