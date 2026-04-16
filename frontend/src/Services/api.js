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
    console.log('token ' +token);
    
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
################# RESERVAS ENDPOINTS ########################
*/

export const addReservation = async (reservation) => {
  try {
    console.log(reservation);
    
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };

    const response = await axios.post(`${API_URL}/api/reservas/addreserve`, reservation, config);
    // Devuelve { message, reservationId } — usar reservationId en vincularMesaReserva()
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const vincularMesaReserva = async ({ idReserva, idMesa }) => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.post(`${API_URL}/api/mesas/reservar`, { idReserva, idMesa }, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error linking table to reservation:', error);
    throw error;
  }
};

export const misReservas = async () => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.get(`${API_URL}/api/reservas/userReserve`, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error getting reservations:', error);
    throw error;
  }
};

export const cancelarReserva = async (id) => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.delete(`${API_URL}/api/reservas/cancelar/${id}`, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

export const todasLasReservas = async () => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.get(`${API_URL}/api/reservas/allReserve`, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    throw error;
  }
};

/*
################# MESAS ENDPOINTS ########################
*/

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

/*
################## SUBIR TICKETS ##################
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

/*
################## COMPRAS ##################
*/

export const getProductosCompradosCliente = async () => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.get(`${API_URL}/api/orders/mis-pedidos`, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error getting pedidos:', error);
    throw error;
  }
};

export const guardarCarritoCompraClientes = async (data = {}) => {
  try {
    const token = getAuthToken();
    const config = {
      headers: { authorization: `Bearer ${token}` },
    };
    const response = await axios.post(`${API_URL}/api/orders/create`, data, config);
    return response.data;
  } catch (error) {
    if (error.response.status === 401) {
      logoutUser();
    }
    console.error('Error subiendo pedidos:', error);
    throw error;
  }
};

export const cancelarPedido = async (id) => {
  try {
    const token = getAuthToken()
    const config = {
      headers: { authorization: `Bearer ${token}` },
    }

    const response = await axios.delete(`${API_URL}/api/orders/cancelar/${id}`, config)
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      logoutUser()
    }
    console.error('Error cancelando pedido:', error)
    throw error
  }
}

/*
################# MARKETPLACE ENDPOINTS ########################
*/
export const pedidosRealizadosMarketPlace = async () => {
  try {
    const token = getAuthToken()
    const config = {
      headers: { authorization: `Bearer ${token}` },
    }

    const response = await axios.get(`${API_URL}/api/marketplace/mypocket`, config)
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      logoutUser()
    }
    console.error('Error cancelando pedido:', error)
    throw error
  }
}

export const listaProductosMarketplace = async () => {
  try {
    const token = getAuthToken()
    const config = {
      headers: { authorization: `Bearer ${token}` },
    }

    const response = await axios.get(`${API_URL}/api/marketplace/items`, config)
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      logoutUser()
    }
    console.error('Error cancelando pedido:', error)
    throw error
  }
}

export const cangearProductoMarkePlace = async (id) => {
  try {
    const token = getAuthToken()
    const config = {
      headers: { authorization: `Bearer ${token}` },
    }

    const response = await axios.post(`${API_URL}/api/marketplace/comprar/${id}`, config)
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      logoutUser()
    }
    console.error('Error cancelando pedido:', error)
    throw error
  }
}

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