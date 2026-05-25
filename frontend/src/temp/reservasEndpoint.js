import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const nuevaReserva = async (reserva) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/reservas/nueva`, reserva, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al crear la reserva:', error);
        throw error;
    }
};

export const vincularMesaReserva = async ({ idReserva, idMesa }) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/mesas/reservar`, { idReserva, idMesa }, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al vincular mesa a la reserva:', error);
        throw error;
    }
};

export const misReservas = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/reservas/misReservas`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener las reservas:', error);
        throw error;
    }
};

export const cancelarReserva = async (id) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.delete(`${URL_API}/api/reservas/cancelar/${id}`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al cancelar la reserva:', error);
        throw error;
    }
};

export const obtenerTodasLasReservasAdmin = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/reservas/admin/todas`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener todas las reservas:', error);
        throw error;
    }
};

export const actualizarEstadoReservaAdmin = async (id, estado, atendido = false) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = { headers: { authorization: `Bearer ${token}` } };
        const respuesta = await axios.patch(
            `${URL_API}/api/reservas/admin/${id}/estado`,
            { estado, atendido },
            configuracion
        );
        return respuesta.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al actualizar estado de reserva:', error);
        throw error;
    }
};