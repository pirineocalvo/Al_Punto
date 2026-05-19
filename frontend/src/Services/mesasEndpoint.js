import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getAuthToken, logoutUser } from './gestionAlmacenamiento';

export const getDisponibilidadMes = async (year, month) => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
            params: { year, month },
        };
        const response = await axios.get(`${API_URL}/api/mesas/disponibilidad-mes`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error getting month availability:', error);
        throw error;
    }
};

export const todasLasMesasLibresPorDia = async (fecha, ocupantes) => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
            params: { fecha, ocupantes },
        };
        const response = await axios.get(`${API_URL}/api/mesas/disponibilidad-dia`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error getting day availability:', error);
        throw error;
    }
};

// Admin: todas las mesas (activas e inactivas)
export const todasLasMesas = async () => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/mesas/admin/todas`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        throw error;
    }
};

// Admin: crear mesa
export const crearMesa = async (data = {}) => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.post(`${API_URL}/api/mesas/admin/crear`, data, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error creating table:', error);
        throw error;
    }
};

// Admin: actualizar mesa
export const actualizarMesa = async (id, data = {}) => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.put(`${API_URL}/api/mesas/admin/${id}`, data, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error updating table:', error);
        throw error;
    }
};

// Admin: baja lógica de mesa (activo = 0, no elimina)
export const desactivarMesa = async (id) => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.delete(`${API_URL}/api/mesas/admin/${id}`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error deactivating table:', error);
        throw error;
    }
};