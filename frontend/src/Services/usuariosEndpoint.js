import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getTokenAutentificacion, guardarToken, cerrarSesionUsuario} from './gestionAlmacenamiento.js';

export const iniciarSesionUsuario = async (data = {}) => {
    try {
        const response = await axios.post(`${API_URL}/api/user/login`, data);
        guardarToken(response.data.token);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const informacionUsuario = async () => {
    try {
        const token = getTokenAutentificacion();

        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/user/userInfo`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            cerrarSesionUsuario();
        }
        console.error('Error getting data:', error);
        throw error;
    }
};

export const registrarUsuario = async (data = {}) => {
    try {
        const response = await axios.post(`${API_URL}/api/user/register`, data);
        
        if (response.status === 201 || response.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        if (error.response) {
            return error.response.status; 
        }
        return 500;
    }
};