import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const obtenerDisponibilidadMes = async (anio, mes) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
            params: { anio, mes },
        };
        const respuesta = await axios.get(`${URL_API}/api/mesas/disponibilidad-mes`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener disponibilidad del mes:', error);
        throw error;
    }
};

export const todasLasMesasLibresPorDia = async (fecha, ocupantes) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
            params: { fecha, ocupantes },
        };
        const respuesta = await axios.get(`${URL_API}/api/mesas/disponibilidad-dia`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener disponibilidad del dia:', error);
        throw error;
    }
};

export const todasLasMesas = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/mesas/admin/todas`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        throw error;
    }
};

export const crearMesa = async (datos = {}) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/mesas/admin/crear`, datos, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al crear la mesa:', error);
        throw error;
    }
};

export const actualizarMesa = async (id, datos = {}) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.put(`${URL_API}/api/mesas/admin/${id}`, datos, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al actualizar la mesa:', error);
        throw error;
    }
};

export const desactivarMesa = async (id) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.delete(`${URL_API}/api/mesas/admin/${id}`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al desactivar la mesa:', error);
        throw error;
    }
};