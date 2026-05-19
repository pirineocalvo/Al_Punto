import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getTokenAutentificacion, cerrarSesionUsuario } from './gestionAlmacenamiento';

export const subirTicket = async (ticket) => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.post(`${API_URL}/api/tickets/upload`, ticket, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error uploading ticket:', error);
        throw error;
    }
};

export const misTickets = async () => {
    try {
        const token = getTokenAutentificacion();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/tickets/mytickets`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error getting tickets:', error);
        throw error;
    }
};