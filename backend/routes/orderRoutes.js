const express = require('express'), router = express['Router'](), {decrypt} = require('../utils/crypto'), db = require('../utils/db'), {createNotification} = require('../utils/notifications'), authMiddleware = (g, h, i) => {
        const j = g['headers']['authorization'];
        if (!j || !j['startsWith']('Bearer\x20'))
            return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
        const k = j['split']('\x20')[0x1], l = decrypt(k);
        if (!l)
            return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
        g['userId'] = l, i();
    }, adminMiddleware = (d, e, f) => {
        db['get']('SELECT\x20access_level\x20FROM\x20Users\x20WHERE\x20id\x20=\x20?', [d['userId']], (g, h) => {
            if (g)
                return e['status'](0x1f4)['json']({ 'error': 'Error\x20de\x20base\x20de\x20datos' });
            if (!h || h['access_level'] <= 0x3)
                return e['status'](0x193)['json']({ 'error': 'Acceso\x20denegado:\x20se\x20requiere\x20nivel\x20Staff/Admin' });
            f();
        });
    };
router['post']('/create', (h, i) => {
    const j = h['headers']['authorization'];
    if (!j || !j['startsWith']('Bearer\x20'))
        return i['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const k = j['split']('\x20')[0x1], l = decrypt(k);
    if (!l)
        return i['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const {
        items: m,
        total_price: n
    } = h['body'];
    if (!m || m['length'] === 0x0)
        return i['status'](0x190)['json']({ 'error': 'No\x20hay\x20items\x20en\x20el\x20pedido' });
    db['run']('INSERT\x20INTO\x20Orders\x20(user_id,\x20total_price,\x20status,\x20is_picked_up)\x20VALUES\x20(?,\x20?,\x20?,\x20?)', [
        l,
        n,
        'pendiente',
        0x0
    ], function (o) {
        if (o)
            return console['error']('Error\x20al\x20crear\x20el\x20pedido:', o), i['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20crear\x20el\x20pedido' });
        const p = this['lastID'], q = w => {
                if (w >= m['length'])
                    return i['json']({
                        'message': 'Pedido\x20creado\x20correctamente',
                        'orderId': p
                    });
                const x = m[w];
                db['run']('INSERT\x20INTO\x20Order_items\x20(order_id,\x20product_id,\x20quantity,\x20price_at_time)\x20VALUES\x20(?,\x20?,\x20?,\x20?)', [
                    p,
                    x['product_id'],
                    x['quantity'],
                    x['price_at_time']
                ], y => {
                    if (y)
                        return console['error']('Error\x20al\x20añadir\x20item\x20al\x20pedido:', y), i['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20añadir\x20items\x20al\x20pedido' });
                    q(w + 0x1);
                });
            };
        q(0x0);
    });
}), router['get']('/mis-pedidos', (g, h) => {
    const i = g['headers']['authorization'];
    if (!i || !i['startsWith']('Bearer\x20'))
        return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const j = i['split']('\x20')[0x1], k = decrypt(j);
    if (!k)
        return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const l = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20Orders.id,\x20Orders.total_price,\x20Orders.status,\x20Orders.created_at,\x20Orders.is_picked_up,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Order_items.id\x20as\x20item_id,\x20Order_items.quantity,\x20Order_items.price_at_time,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Menu.name\x20as\x20product_name,\x20Menu.img_src\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Orders\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Order_items\x20ON\x20Orders.id\x20=\x20Order_items.order_id\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Menu\x20ON\x20Order_items.product_id\x20=\x20Menu.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20Orders.user_id\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20Orders.created_at\x20DESC\x0a\x20\x20\x20\x20';
    db['all'](l, [k], (m, n) => {
        if (m)
            return console['error']('Error\x20al\x20obtener\x20pedidos:', m), h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20obtener\x20los\x20pedidos' });
        const o = {};
        n['forEach'](t => {
            !o[t['id']] && (o[t['id']] = {
                'id': t['id'],
                'total_price': t['total_price'],
                'status': t['status'],
                'created_at': t['created_at'],
                'is_picked_up': t['is_picked_up'],
                'items': []
            }), t['item_id'] && o[t['id']]['items']['push']({
                'id': t['item_id'],
                'quantity': t['quantity'],
                'price_at_time': t['price_at_time'],
                'product_name': t['product_name'],
                'img_src': t['img_src']
            });
        }), h['json'](Object['values'](o));
    });
}), router['delete']('/cancelar/:id', (g, h) => {
    const i = g['headers']['authorization'];
    if (!i || !i['startsWith']('Bearer\x20'))
        return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const j = i['split']('\x20')[0x1], k = decrypt(j);
    if (!k)
        return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const {id: l} = g['params'];
    db['run']('UPDATE\x20Orders\x20SET\x20status\x20=\x20\x22cancelado\x22\x20WHERE\x20id\x20=\x20?\x20AND\x20user_id\x20=\x20?\x20AND\x20status\x20=\x20\x22pendiente\x22', [
        l,
        k
    ], function (m) {
        if (m)
            return console['error']('Error\x20al\x20cancelar\x20pedido:', m), h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20cancelar\x20el\x20pedido' });
        if (this['changes'] === 0x0)
            return h['status'](0x194)['json']({ 'error': 'Pedido\x20no\x20encontrado\x20o\x20no\x20se\x20puede\x20cancelar' });
        h['json']({ 'message': 'Pedido\x20cancelado\x20correctamente' });
    });
}), router['get']('/admin/todos', authMiddleware, adminMiddleware, (d, e) => {
    const f = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20Orders.id,\x20Orders.total_price,\x20Orders.status,\x20Orders.created_at,\x20Orders.is_picked_up,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Users.first_name,\x20Users.last_name,\x20Users.email,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Order_items.id\x20as\x20item_id,\x20Order_items.quantity,\x20Order_items.price_at_time,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Menu.name\x20as\x20product_name\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Orders\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Users\x20ON\x20Orders.user_id\x20=\x20Users.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Order_items\x20ON\x20Orders.id\x20=\x20Order_items.order_id\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Menu\x20ON\x20Order_items.product_id\x20=\x20Menu.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20Orders.created_at\x20DESC\x0a\x20\x20\x20\x20';
    db['all'](f, [], (g, h) => {
        if (g)
            return console['error']('Error\x20al\x20obtener\x20todos\x20los\x20pedidos:', g), e['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20obtener\x20los\x20pedidos' });
        const i = {};
        h['forEach'](n => {
            !i[n['id']] && (i[n['id']] = {
                'id': n['id'],
                'total_price': n['total_price'],
                'status': n['status'],
                'created_at': n['created_at'],
                'is_picked_up': n['is_picked_up'],
                'customer': n['first_name'] + '\x20' + n['last_name'],
                'email': n['email'],
                'items': []
            }), n['item_id'] && i[n['id']]['items']['push']({
                'id': n['item_id'],
                'quantity': n['quantity'],
                'price_at_time': n['price_at_time'],
                'product_name': n['product_name']
            });
        }), e['json'](Object['values'](i));
    });
}), router['patch']('/admin/:id/status', authMiddleware, adminMiddleware, (f, g) => {
    const {id: h} = f['params'], {
            status: i,
            is_picked_up: j
        } = f['body'];
    db['get']('SELECT\x20user_id\x20FROM\x20Orders\x20WHERE\x20id\x20=\x20?', [h], (k, l) => {
        if (k || !l)
            return g['status'](0x194)['json']({ 'error': 'Pedido\x20no\x20encontrado' });
        db['run']('UPDATE\x20Orders\x20SET\x20status\x20=\x20?,\x20is_picked_up\x20=\x20?\x20WHERE\x20id\x20=\x20?', [
            i,
            j ? 0x1 : 0x0,
            h
        ], function (p) {
            if (p)
                return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20actualizar\x20el\x20pedido' });
            if (this['changes'] === 0x0)
                return g['status'](0x194)['json']({ 'error': 'Pedido\x20no\x20encontrado' });
            if (i === 'listo')
                createNotification(l['user_id'], '🛎️\x20Tu\x20pedido\x20#' + h + '\x20está\x20listo\x20para\x20recoger', 'order');
            else
                i === 'entregado' && createNotification(l['user_id'], '✅\x20Tu\x20pedido\x20#' + h + '\x20ha\x20sido\x20entregado.\x20¡Gracias!', 'order');
            g['json']({ 'message': 'Pedido\x20actualizado\x20correctamente' });
        });
    });
}), module['exports'] = router;