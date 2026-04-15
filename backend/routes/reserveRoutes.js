const express = require('express'), router = express['Router'](), {decrypt} = require('../utils/crypto'), db = require('../utils/db');
router['post']('/addreserve', (g, h) => {
    const i = g['headers']['authorization'];
    if (!i || !i['startsWith']('Bearer\x20'))
        return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const j = i['split']('\x20')[0x1], k = decrypt(j);
    if (!k)
        return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const l = g['body'];
    db['run']('INSERT\x20INTO\x20Reservations\x20(user_id,\x20reserve_date,\x20reserve_hour,\x20guests)\x20VALUES\x20(?,?,?,?)', [
        k,
        l['fecha'],
        l['hora'],
        l['comensales']
    ], function (m) {
        if (m)
            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        h['status'](0xc8)['json']({
            'message': 'Reserva\x20realizada\x20con\x20exito',
            'reservationId': this['lastID']
        });
    });
}), router['get']('/userReserve', (f, g) => {
    const h = f['headers']['authorization'];
    if (!h || !h['startsWith']('Bearer\x20'))
        return g['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const i = h['split']('\x20')[0x1], j = decrypt(i);
    if (!j)
        return g['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.*,\x20mr.id_mesa,\x20m.name\x20as\x20mesa_name,\x20m.n_ocupantes\x20as\x20mesa_n_ocupantes\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Reservations\x20r\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Mesas_reservadas\x20mr\x20ON\x20mr.id_reservas\x20=\x20r.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Mesas\x20m\x20ON\x20mr.id_mesa\x20=\x20m.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20r.user_id\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20r.reserve_date\x20DESC,\x20r.reserve_hour\x20DESC\x0a\x20\x20\x20\x20', [j], (k, l) => {
        if (k)
            return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        g['json'](l);
    });
}), router['delete']('/cancelar/:id', (g, h) => {
    const i = g['headers']['authorization'];
    if (!i || !i['startsWith']('Bearer\x20'))
        return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const j = i['split']('\x20')[0x1], k = decrypt(j);
    if (!k)
        return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const {id: l} = g['params'];
    db['run']('UPDATE\x20Reservations\x20SET\x20status\x20=\x20\x22cancel\x22\x20WHERE\x20id\x20=\x20?\x20AND\x20user_id\x20=\x20?', [
        l,
        k
    ], function (m) {
        if (m)
            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        if (this['changes'] === 0x0)
            return h['status'](0x194)['json']({ 'error': 'Reserva\x20no\x20encontrada' });
        h['status'](0xc8)['json']({ 'message': 'Reserva\x20cancelada\x20con\x20exito' });
    });
}), module['exports'] = router;