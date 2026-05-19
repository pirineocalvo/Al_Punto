import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getAuthToken, logoutUser } from './gestionAlmacenamiento';

export const uploadTickets = async (ticket) => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.post(`${API_URL}/api/tickets/upload`, ticket, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error uploading ticket:', error);
        throw error;
    }
};

export const getMyTickets = async () => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/tickets/mytickets`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error getting tickets:', error);
        throw error;
    }
};