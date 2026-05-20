import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const nuevaReserva = async (reservation) => {
    try {

        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };

        const response = await axios.post(`${API_URL}/api/reservas/addreserve`, reservation, config);

        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error creating reservation:', error);
        throw error;
    }
};

export const vincularMesaReserva = async ({ idReserva, idMesa }) => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.post(`${API_URL}/api/mesas/reservar`, { idReserva, idMesa }, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error linking table to reservation:', error);
        throw error;
    }
};

export const misReservas = async () => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/reservas/userReserve`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error getting reservations:', error);
        throw error;
    }
};

export const cancelarReserva = async (id) => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.delete(`${API_URL}/api/reservas/cancelar/${id}`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error cancelling reservation:', error);
        throw error;
    }
};

export const obtenerTodasLasReservasAdmin = async () => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/reservas/admin/allReserve`, config);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener todas las reservas:', error);
        throw error;
    }
};

export const actualizarEstadoReservaAdmin = async (id, status, attended = false) => {
    try {
        const token = getTokenAutentificacion();
        const config = { headers: { authorization: `Bearer ${token}` } };
        const response = await axios.patch(
            `${API_URL}/api/reservas/admin/${id}/status`,
            { status, attended },
            config
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) cerrarSesionUsuario();
        console.error('Error al actualizar estado de reserva:', error);
        throw error;
    }
};
