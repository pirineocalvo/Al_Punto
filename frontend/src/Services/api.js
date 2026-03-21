import axios from 'axios';

const API_URL = /*process.env.REACT_APP_API_URL ||*/ 'http://localhost:5000';


/*
################# USER ENDPOINTS ########################
*/

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

/*
################# MENU ENDPOINTS ########################
*/
export const getMenu = async (data = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/menu`);
    return response.data;
  } catch (error) {
    console.error('Error fetching protected data:', error);
    throw error;
  }
};

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


/*
Reservas
*/


export const addReservation = async (reservation) => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.post(`${API_URL}/api/reservas/addreserve`, reservation, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error getting data:', error);
    throw error;
  }
};

export const misReservas = async () => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.get(`${API_URL}/api/reservas/userReserve/`, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error getting data:', error);
    throw error;
  }
}

/*
################## SUBIR TICKETS
*/

export const uploadTickets = async (ticket) => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.post(`${API_URL}/api/tickets/upload`, ticket, config);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      logoutUser();
    }
    console.error('Error uploading ticket:', error);
    throw error;
  }
};






/* 
################# STORAGE FUNCTIONS ########################
*/
const getAuthToken = () => {
  try {
    return localStorage.getItem('loginUserToken');
  } catch {
    return null;
  }
};

const getAdminToken = () => {
  try {
    return localStorage.getItem('adminToken');
  } catch {
    return null;
  }
};

const guardarToken = (token) => {
  try {
    localStorage.setItem('loginUserToken', token);
  } catch {
    console.error('Error al guardar el token');
  }
};

const logoutUser = () => {
  try {
    localStorage.removeItem('loginUserToken');
  } catch {
    console.error('Error al eliminar el token');
  }
};

const guardarAdminToken = (token) => {
  try {
    localStorage.setItem('adminToken', token);
  } catch {
    console.error('Error al guardar el token');
  }
};