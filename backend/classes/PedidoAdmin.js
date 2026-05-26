const Pedido = require('./Pedido');

class PedidoAdmin extends Pedido {
    constructor({ nombre, apellido, email, ...resto }) {
        super(resto);
        this.cliente = `${nombre} ${apellido}`;
        this.email = email;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            cliente: this.cliente,
            email: this.email,
        };
    }
}

module.exports = PedidoAdmin;