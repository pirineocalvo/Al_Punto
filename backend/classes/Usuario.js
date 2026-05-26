const NIVEL_ACCESO = {
    CLIENTE: 1,
    EMPLEADO: 3,
    ADMIN: 5,
};

class Usuario {
    constructor({ id = null, nombre, apellido, email, telefono = null,
        nivel_acceso = 0, puntos = 0, hash_contrasena = null,
        activo = true, creado_en = null } = {}) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.nivelAcceso = nivel_acceso;
        this.puntos = puntos;
        this.hashContrasena = hash_contrasena;
        this.activo = Boolean(activo);
        this.creadoEn = creado_en;
    }

    get nombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }

    get esAdmin() {
        return this.nivelAcceso >= NIVEL_ACCESO.ADMIN;
    }

    get esEmpleado() {
        return this.nivelAcceso >= NIVEL_ACCESO.EMPLEADO;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            telefono: this.telefono,
            nivel_acceso: this.nivelAcceso,
            puntos: this.puntos,
            activo: this.activo,
            creado_en: this.creadoEn,
        };
    }
}

Usuario.NIVEL_ACCESO = NIVEL_ACCESO;

module.exports = Usuario;