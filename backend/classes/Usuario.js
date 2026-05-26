class Usuario {
    constructor({ id = null, first_name, last_name, email, phone = null,  access_level = 0, points = 0,
        hash_contrasena = null } = {}) {
        this.id = id;
        this.firstName = first_name;
        this.lastName = last_name;
        this.email = email;
        this.phone = phone;
        this.accessLevel = access_level;
        this.points = points;
        this.hashContrasena = hash_contrasena;
    }

    get nombreCompleto() {
        return `${this.firstName} ${this.lastName}`;
    }

    get esAdmin() {
        return this.accessLevel >= 1;
    }

    toJSON() {
        return {
            id: this.id,
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            phone: this.phone,
            access_level: this.accessLevel,
            points: this.points,
        };
    }
}

module.exports = Usuario;
