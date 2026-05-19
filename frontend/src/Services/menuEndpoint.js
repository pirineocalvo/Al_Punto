import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { getAdminToken, getAuthToken} from './gestionAlmacenamiento';

export const getMenu = async (data = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/menu`);
        return response.data;
    } catch (error) {
        console.error('Error fetching protected data:', error);
        throw error;
    }
};


export const getCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/menu/categorias`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

//REVISAR SI SE USA EN ALGUNA PARTE
export const getMenuByIdCategory = async (data = {}) => {
    try {
        const response = await axios.get(`${API_URL}/api/menu/${data.idcategory}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching protected data:', error);
        throw error;
    }
};

export const addMenuItem = async (data = {}) => {
    try {
        const token = getAuthToken();
        const adminToken = getAdminToken();
        const config = {
            headers: token ? { Authorization: `Bearer ${token} ${adminToken}` } : {},
        };
        const response = await axios.post(`${API_URL}/api/menu/add`, data, config);
        return response.data;
    } catch (error) {
        console.error('Error posting protected data:', error);
        throw error;
    }
};

export const updateMenuItem = async (data = {}) => {
    try {
        const token = getAuthToken();
        const adminToken = getAdminToken();
        const config = {
            headers: token ? { Authorization: `Bearer ${token} ${adminToken}` } : {},
        };
        const response = await axios.post(`${API_URL}/api/menu/update`, data, config);
        return response.data;
    } catch (error) {
        console.error('Error posting protected data:', error);
        throw error;
    }
};

export const addCategory = async (data = {}) => {
    try {
        const token = getAuthToken();
        const adminToken = getAdminToken();
        const config = {
            headers: token ? { Authorization: `Bearer ${token} ${adminToken}` } : {},
        };
        const response = await axios.post(`${API_URL}/api/menu/addcategory`, data, config);
        return response.data;
    } catch (error) {
        console.error('Error posting protected data:', error);
        throw error;
    }
};
