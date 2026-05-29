import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const obtenerMisPedidos = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/orders/misPedidos`, configuracion);
        
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener pedidos:', error);
        throw error;
    }
};

export const guardarCarritoCompraClientes = async (datos = {}) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/orders/crear`, datos, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al subir pedido:', error);
        throw error;
    }
};

export const cancelarPedido = async (id) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.delete(`${URL_API}/api/orders/cancelar/${id}`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al cancelar pedido:', error);
        throw error;
    }
};

export const obtenerTodosLosPedidosAdmin = async () => {
    try {
        const token = obtenerTokenAutentificacion()
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/orders/admin/todos`, configuracion);
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener pedidos globales:', error);
        throw error;
    }
};

export const actualizarEstadoOrden = async (id, estado, recogido = false) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.patch(`${URL_API}/api/orders/admin/${id}/estado`, {
            estado,
            recogido: recogido ? 1 : 0,
        }, configuracion);
        return respuesta.data;
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        throw error;
    }
};