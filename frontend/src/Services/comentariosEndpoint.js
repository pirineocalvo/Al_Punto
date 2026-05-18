import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getAuthToken, logoutUser } from './gestionAlmacenamiento';


export const addReview = async (data = {}) => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.post(`${API_URL}/api/resenias`, data, config);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            logoutUser();
        }
        console.error('Error al añadir reseña:', error);
        throw error;
    }
};

export const getMyReviews = async () => {
    try {
        const token = getAuthToken();
        const config = {
            headers: { authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${API_URL}/api/resenias/my-reviews`, config);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            logoutUser();
        }
        console.error('Error al obtener mis reseñas:', error);
        throw error;
    }
};

export const getReviewsByDish = async (idPlato) => {
    try {
        const response = await axios.get(`${API_URL}/api/resenias/${idPlato}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener reseñas del plato:', error);
        throw error;
    }
};
