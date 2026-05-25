import axios from 'axios';
const URL_API = import.meta.env.VITE_API_URL;
import { obtenerTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const subirTicket = async (ticket) => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.post(`${URL_API}/api/tickets/subir`, ticket, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al subir el ticket:', error);
        throw error;
    }
};

export const misTickets = async () => {
    try {
        const token = obtenerTokenAutentificacion();
        const configuracion = {
            headers: { authorization: `Bearer ${token}` },
        };
        const respuesta = await axios.get(`${URL_API}/api/tickets/misTickets`, configuracion);
        return respuesta.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error al obtener los tickets:', error);
        throw error;
    }
};