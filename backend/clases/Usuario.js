class Usuario {
    /**
     * @param {object} datos
     * @param {number}  datos.id
     * @param {string}  datos.first_name
     * @param {string}  datos.last_name
     * @param {string}  datos.email
     * @param {string}  [datos.phone]
     * @param {string}  [datos.birth_date]
     * @param {number}  [datos.access_level=0]
     * @param {number}  [datos.points=0]
     * @param {string}  [daidtos.hash_contrasena]
     */
    constructor({ id = null, first_name, last_name, email, phone = null,
        birth_date = null, access_level = 0, points = 0,
        hash_contrasena = null } = {}) {
        this.id = id;
        this.firstName = first_name;
        this.lastName = last_name;
        this.email = email;
        this.phone = phone;
        this.birthDate = birth_date;
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
            birth_date: this.birthDate,
            access_level: this.accessLevel,
            points: this.points,
        };
    }
}

module.exports = Usuario;
