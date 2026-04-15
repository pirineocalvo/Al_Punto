const express = require('express'), router = express['Router'](), {decrypt} = require('../utils/crypto'), db = require('../utils/db'), waiterMiddleware = (g, h, i) => {
        const j = g['headers']['authorization'];
        if (!j || !j['startsWith']('Bearer\x20'))
            return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
        const k = j['split']('\x20')[0x1], l = decrypt(k);
        if (!l)
            return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
        g['userId'] = l, db['get']('SELECT\x20access_level\x20FROM\x20Users\x20WHERE\x20id\x20=\x20?', [l], (m, n) => {
            if (m)
                return h['status'](0x1f4)['json']({ 'error': 'Error\x20de\x20base\x20de\x20datos' });
            if (!n || n['access_level'] < 0x3)
                return h['status'](0x193)['json']({ 'error': 'Acceso\x20denegado:\x20se\x20requiere\x20nivel\x20Camarero\x20o\x20superior' });
            i();
        });
    };
router['get']('/items', (f, g) => {
    const h = f['headers']['authorization'];
    if (!h || !h['startsWith']('Bearer\x20'))
        return g['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const i = h['split']('\x20')[0x1], j = decrypt(i);
    if (!j)
        return g['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    db['all']('SELECT\x20id\x20FROM\x20Levels\x20WHERE\x20min_points\x20<=\x20(SELECT\x20points\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?)\x20AND\x20max_points\x20>=\x20(SELECT\x20points\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?)', [
        j,
        j
    ], (k, l) => {
        if (k)
            return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        if (!l || l['length'] === 0x0)
            return g['status'](0x194)['json']({ 'error': 'Nivel\x20no\x20encontrado\x20para\x20el\x20usuario' });
        const m = l[0x0]['id'];
        db['all']('SELECT\x20*\x20FROM\x20Marketplace\x20WHERE\x20min_level_id\x20<=\x20?', [m], (s, t) => {
            if (s)
                return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
            g['json'](t);
        });
    });
}), router['get']('/mypocket', (f, g) => {
    const h = f['headers']['authorization'];
    if (!h || !h['startsWith']('Bearer\x20'))
        return g['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const i = h['split']('\x20')[0x1], j = decrypt(i);
    if (!j)
        return g['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20p.id\x20as\x20pocket_id,\x20p.is_used,\x20p.added_at,\x20p.used_at,\x20p.token_url,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20m.id\x20as\x20product_id,\x20m.name,\x20m.description,\x20m.img_src,\x20m.points_price\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Pocket\x20p\x0a\x20\x20\x20\x20\x20\x20\x20\x20INNER\x20JOIN\x20Marketplace\x20m\x20ON\x20p.product_id\x20=\x20m.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20p.user_id\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20p.is_used\x20ASC,\x20p.added_at\x20DESC\x0a\x20\x20\x20\x20', [j], (k, l) => {
        if (k)
            return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        g['json'](l);
    });
}), router['post']('/comprar/:id', (g, h) => {
    const i = g['headers']['authorization'];
    if (!i || !i['startsWith']('Bearer\x20'))
        return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const j = i['split']('\x20')[0x1], k = decrypt(j);
    if (!k)
        return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const {id: l} = g['params'];
    db['all']('SELECT\x20points_price\x20FROM\x20Marketplace\x20WHERE\x20id\x20=\x20?', [l], (m, n) => {
        if (m)
            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        const o = n[0x0]['points_price'];
        db['all']('SELECT\x20id,\x20points\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?', [k], (s, x) => {
            if (s)
                return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
            const y = x[0x0]['points'], z = x[0x0]['id'];
            if (y < o)
                return h['status'](0x190)['json']({ 'error': 'No\x20tienes\x20suficientes\x20puntos' });
            else
                db['run']('UPDATE\x20Wallet\x20SET\x20points\x20=\x20points\x20-\x20?\x20WHERE\x20user_id\x20=\x20?', [
                    o,
                    k
                ], function (A) {
                    if (A)
                        return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20actualizar\x20wallet' });
                    const B = k + '-' + l + '-' + Date['now']();
                    db['run']('INSERT\x20INTO\x20Pocket\x20(user_id,\x20product_id,\x20token_url)\x20VALUES\x20(?,?,\x20?)', [
                        k,
                        l,
                        B
                    ], function (C) {
                        if (C)
                            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20insertar\x20en\x20pocket' });
                        db['run']('INSERT\x20INTO\x20Point_transactions\x20(user_id,\x20wallet_id,\x20amount_transaction,\x20type)\x20VALUES\x20(?,?,\x20?,\x20?)', [
                            k,
                            z,
                            o,
                            'buy\x20market'
                        ], function (D) {
                            if (D)
                                return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20insertar\x20en\x20point_transactions' });
                            h['status'](0xc8)['json']({ 'message': 'Item\x20comprado\x20con\x20exito' });
                        });
                    });
                });
        });
    });
}), router['get']('/pocket/:userId/use/:tokenUrl', waiterMiddleware, (g, h) => {
    const {
            userId: i,
            tokenUrl: j
        } = g['params'], k = j['split']('-');
    if (k['length'] !== 0x3)
        return h['status'](0x190)['json']({ 'error': 'Formato\x20de\x20token\x20inválido' });
    if (k[0x0] !== String(i))
        return h['status'](0x190)['json']({ 'error': 'El\x20token\x20no\x20corresponde\x20a\x20este\x20usuario' });
    const l = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20p.id\x20as\x20pocket_id,\x20p.is_used,\x20p.used_at,\x20p.expires_at,\x20p.added_at,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20m.id\x20as\x20product_id,\x20m.name\x20as\x20product_name,\x20m.description\x20as\x20product_description,\x20m.img_src,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20u.id\x20as\x20user_id,\x20u.first_name,\x20u.last_name,\x20u.email\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Pocket\x20p\x0a\x20\x20\x20\x20\x20\x20\x20\x20INNER\x20JOIN\x20Marketplace\x20m\x20ON\x20p.product_id\x20=\x20m.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20INNER\x20JOIN\x20Users\x20u\x20ON\x20p.user_id\x20=\x20u.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20p.token_url\x20=\x20?\x20AND\x20p.user_id\x20=\x20?\x0a\x20\x20\x20\x20';
    db['get'](l, [
        j,
        i
    ], (m, n) => {
        if (m)
            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        if (!n)
            return h['status'](0x194)['json']({ 'error': 'Token\x20no\x20encontrado' });
        if (n['expires_at'] && new Date(n['expires_at']) < new Date())
            return h['status'](0x19a)['json']({
                'error': 'Token\x20expirado',
                'expired': !![],
                'expires_at': n['expires_at']
            });
        h['json']({
            'valid': n['is_used'] === 0x0,
            'already_used': n['is_used'] === 0x1,
            'used_at': n['used_at'],
            'pocket_id': n['pocket_id'],
            'product': {
                'id': n['product_id'],
                'name': n['product_name'],
                'description': n['product_description'],
                'img_src': n['img_src']
            },
            'user': {
                'id': n['user_id'],
                'first_name': n['first_name'],
                'last_name': n['last_name'],
                'email': n['email']
            }
        });
    });
}), router['post']('/pocket/:userId/use/:tokenUrl', waiterMiddleware, (f, g) => {
    const {
            userId: h,
            tokenUrl: i
        } = f['params'], j = i['split']('-');
    if (j['length'] !== 0x3)
        return g['status'](0x190)['json']({ 'error': 'Formato\x20de\x20token\x20inválido' });
    if (j[0x0] !== String(h))
        return g['status'](0x190)['json']({ 'error': 'El\x20token\x20no\x20corresponde\x20a\x20este\x20usuario' });
    db['get']('SELECT\x20id,\x20is_used,\x20expires_at\x20FROM\x20Pocket\x20WHERE\x20token_url\x20=\x20?\x20AND\x20user_id\x20=\x20?', [
        i,
        h
    ], (k, l) => {
        if (k)
            return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        if (!l)
            return g['status'](0x194)['json']({ 'error': 'Token\x20no\x20encontrado' });
        if (l['is_used'])
            return g['status'](0x199)['json']({ 'error': 'Este\x20artículo\x20ya\x20fue\x20canjeado' });
        if (l['expires_at'] && new Date(l['expires_at']) < new Date())
            return g['status'](0x19a)['json']({ 'error': 'Token\x20expirado' });
        const m = new Date()['toISOString']();
        db['run']('UPDATE\x20Pocket\x20SET\x20is_used\x20=\x201,\x20used_at\x20=\x20?\x20WHERE\x20id\x20=\x20?\x20AND\x20is_used\x20=\x200', [
            m,
            l['id']
        ], function (r) {
            if (r)
                return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20canjear\x20artículo' });
            if (this['changes'] === 0x0)
                return g['status'](0x199)['json']({ 'error': 'Este\x20artículo\x20ya\x20fue\x20canjeado' });
            g['json']({
                'message': 'Artículo\x20canjeado\x20con\x20éxito',
                'used_at': m
            });
        });
    });
}), module['exports'] = router;