const Pedido = require('./Pedido');

class PedidoAdmin extends Pedido {
    constructor({ first_name, last_name, email, ...resto }) {
        super(resto);
        this.customer = `${first_name} ${last_name}`;
        this.email = email;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            customer: this.customer,
            email: this.email,
        };
    }
}

module.exports = PedidoAdmin;