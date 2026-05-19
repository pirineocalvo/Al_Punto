export const getTokenAutentificacion = () => {
    try {
        return localStorage.getItem('loginUserToken');
    } catch {
        return null;
    }
};

export const getTokenAdmin = () => {
    try {
        return localStorage.getItem('adminToken');
    } catch {
        return null;
    }
};

export const guardarToken = (token) => {
    try {
        localStorage.setItem('loginUserToken', token);
    } catch {
        console.error('Error al guardar el token');
    }
};

export const cerrarSesionUsuario = () => {
    try {
        localStorage.removeItem('loginUserToken');
    } catch {
        console.error('Error al eliminar el token');
    }
};