const express = require('express'), router = express['Router'](), {decrypt} = require('../utils/crypto'), db = require('../utils/db');
router['post']('/', (j, k) => {
    const l = j['headers']['authorization'];
    if (!l || !l['startsWith']('Bearer\x20'))
        return k['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const m = l['split']('\x20')[0x1], n = decrypt(m);
    if (!n)
        return k['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const {
        id_plato: o,
        descripcion: p,
        puntuacion: q
    } = j['body'];
    if (!o || q == null || !p)
        return k['status'](0x190)['json']({ 'error': 'Datos\x20de\x20la\x20reseña\x20incompletos' });
    const r = 'INSERT\x20INTO\x20Resenias\x20(id_plato,\x20descripcion,\x20puntuacion,\x20user_id)\x20VALUES\x20(?,\x20?,\x20?,\x20?)';
    db['run'](r, [
        o,
        p,
        q,
        n
    ], function (s) {
        if (s)
            return console['error']('Error\x20insertando\x20reseña:', s), k['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20insertar\x20la\x20reseña' });
        const t = this['lastID'], u = new Date(), v = 0x5;
        db['get']('SELECT\x20id\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?', [n], (D, E) => {
            const F = E && E['id'] ? E['id'] : null;
            db['run']('INSERT\x20INTO\x20Point_transactions\x20(user_id,\x20wallet_id,\x20amount_transaction,\x20type)\x20VALUES\x20(?,\x20?,\x20?,\x20\x27add\x20resenia\x27)', [
                n,
                F,
                v
            ], G => {
                if (G)
                    console['error'](G);
                db['run']('UPDATE\x20Wallet\x20SET\x20points\x20=\x20points\x20+\x20?\x20WHERE\x20user_id\x20=\x20?', [
                    v,
                    n
                ], H => {
                    if (H)
                        console['error'](H);
                    return k['json']({
                        'message': 'Reseña\x20añadida\x20correctamente',
                        'reward': '¡Gracias!\x20Has\x20ganado\x20' + v + '\x20puntos\x20por\x20tu\x20reseña.'
                    });
                });
            });
        });
    });
}), router['get']('/my-reviews', (f, g) => {
    const h = f['headers']['authorization'];
    if (!h || !h['startsWith']('Bearer\x20'))
        return g['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado' });
    const i = h['split']('\x20')[0x1], j = decrypt(i);
    if (!j)
        return g['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.*,\x20m.name\x20as\x20plato_name,\x20m.img_src\x20as\x20plato_img\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Resenias\x20r\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Menu\x20m\x20ON\x20r.id_plato\x20=\x20m.id\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20r.user_id\x20=\x20?\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20r.created_at\x20DESC', [j], (k, l) => {
        if (k)
            return g['status'](0x1f4)['json']({ 'error': 'Error\x20obteniendo\x20tus\x20reseñas' });
        g['json'](l);
    });
}), router['get']('/:id_plato', (d, e) => {
    const {id_plato: f} = d['params'];
    db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.*,\x20u.first_name,\x20u.last_name\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Resenias\x20r\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Users\x20u\x20ON\x20r.user_id\x20=\x20u.id\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20r.id_plato\x20=\x20?\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20r.created_at\x20DESC', [f], (g, h) => {
        if (g)
            return e['status'](0x1f4)['json']({ 'error': 'Error\x20obteniendo\x20reseñas' });
        e['json'](h);
    });
}), module['exports'] = router;