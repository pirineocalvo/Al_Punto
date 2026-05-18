import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getAuthToken, guardarToken, logoutUser} from './gestionAlmacenamiento';

export const loginUser = async (data = {}) => {
    try {
        const response = await axios.post(`${API_URL}/api/user/login`, data);
        guardarToken(response.data.token);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const userInfo = async () => {
    try {
        const token = getAuthToken();

        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/user/userInfo`, config);
        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            logoutUser();
        }
        console.error('Error getting data:', error);
        throw error;
    }
};

export const registerUser = async (data = {}) => {
    try {
        const response = await axios.post(`${API_URL}/api/user/register`, data);
        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return error.response.data.error;
    }
};