const express = require('express'), router = express['Router'](), {encrypt, decrypt, hashPassword, comparePassword} = require('../utils/crypto'), db = require('../utils/db');
router['post']('/login', (e, f) => {
    const {
        email: g,
        password: h
    } = e['body'];
    db['get']('SELECT\x20*\x20FROM\x20Users\x20WHERE\x20email\x20=\x20?', [g], (k, l) => {
        if (k)
            return f['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        if (!l)
            return f['status'](0x191)['json']({ 'error': 'Usuario\x20no\x20encontrado' });
        const m = l['password_hash'], n = comparePassword(h, m);
        if (!n)
            return db['run']('INSERT\x20INTO\x20login_log\x20(user_id,\x20success,\x20ip_address)\x20VALUES\x20(?,\x20?,\x20?)', [
                l['id'],
                ![],
                e['ip']
            ]), f['status'](0x191)['json']({ 'error': 'Contraseña\x20incorrecta' });
        else
            db['run']('INSERT\x20INTO\x20login_log\x20(user_id,\x20success,\x20ip_address)\x20VALUES\x20(?,\x20?,\x20?)', [
                l['id'],
                !![],
                e['ip']
            ]);
        const o = encrypt(l['id']), p = {
                'first_name': l['first_name'],
                'last_name': l['last_name'],
                'phone': l['phone'],
                'email': l['email']
            };
        f['json']({
            'token': o,
            'userInfo': p
        });
    });
}), router['post']('/register', (i, j) => {
    const {
        firstName: k,
        lastName: l,
        phone: m,
        email: n,
        password: o,
        birthDate: p
    } = i['body'];
    db['get']('SELECT\x20id\x20FROM\x20Users\x20WHERE\x20email\x20=\x20?', [n], (q, r) => {
        if (q)
            return j['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        if (r)
            return j['status'](0x191)['json']({ 'error': 'Usuario\x20ya\x20registrado' });
        const s = hashPassword(o), t = 'INSERT\x20INTO\x20Users\x20(first_name,\x20last_name,\x20phone,\x20email,\x20password_hash,\x20birth_date)\x20VALUES\x20(?,\x20?,\x20?,\x20?,\x20?,\x20?)';
        db['run'](t, [
            k,
            l,
            m,
            n,
            s,
            p || null
        ], function (B) {
            if (B)
                return j['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20registrar\x20el\x20usuario' });
            const C = this['lastID'], D = 'INSERT\x20INTO\x20Wallet\x20(user_id,\x20points)\x20VALUES\x20(?,\x20?)';
            db['run'](D, [
                C,
                0x1f4
            ], E => {
                E && console['error']('Error\x20al\x20crear\x20la\x20billetera:', E), j['json']({ 'message': 'Usuario\x20registrado\x20correctamente' });
            });
        });
    });
}), router['get']('/userInfo', (g, h) => {
    const i = g['headers']['authorization'];
    if (!i || !i['startsWith']('Bearer\x20'))
        return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const j = i['split']('\x20')[0x1], k = decrypt(j);
    if (!k)
        return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const l = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20Users.first_name,\x20Users.last_name,\x20Users.phone,\x20Users.email,\x20Users.birth_date,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Wallet.points,\x20Users.access_level,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20name\x20\x20\x20\x20\x20\x20\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>=\x20min_points\x20AND\x20Wallet.points\x20<=\x20max_points)\x20AS\x20levelName,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20hex_bkg\x20\x20\x20\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>=\x20min_points\x20AND\x20Wallet.points\x20<=\x20max_points)\x20AS\x20levelBkg,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20hex_text\x20\x20\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>=\x20min_points\x20AND\x20Wallet.points\x20<=\x20max_points)\x20AS\x20levelText,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20min_points\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>=\x20min_points\x20AND\x20Wallet.points\x20<=\x20max_points)\x20AS\x20levelMin,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20max_points\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>=\x20min_points\x20AND\x20Wallet.points\x20<=\x20max_points)\x20AS\x20levelMax,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20name\x20\x20\x20\x20\x20\x20\x20FROM\x20Levels\x20WHERE\x20min_points\x20>\x20(SELECT\x20max_points\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>=\x20min_points\x20AND\x20Wallet.points\x20<=\x20max_points)\x20ORDER\x20BY\x20min_points\x20ASC\x20LIMIT\x201)\x20AS\x20nextLevelName,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20COUNT(*)\x20FROM\x20Tickets\x20WHERE\x20user_id\x20=\x20Users.id)\x20AS\x20ticket_count\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Users\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Wallet\x20ON\x20Users.id\x20=\x20Wallet.user_id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20Users.id\x20=\x20?\x0a\x20\x20\x20\x20';
    db['get'](l, [k], (m, n) => {
        if (m)
            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos' });
        h['json'](n);
    });
}), router['get']('/transactions', (g, h) => {
    const i = g['headers']['authorization'];
    if (!i || !i['startsWith']('Bearer\x20'))
        return h['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const j = i['split']('\x20')[0x1], k = decrypt(j);
    if (!k)
        return h['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const l = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20*\x20FROM\x20Point_transactions\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20user_id\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20id\x20DESC\x0a\x20\x20\x20\x20\x20\x20\x20\x20LIMIT\x2050\x0a\x20\x20\x20\x20';
    db['all'](l, [k], (m, n) => {
        if (m)
            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20transacciones' });
        h['json'](n);
    });
}), router['get']('/levels', (c, d) => {
    db['all']('SELECT\x20id,\x20name,\x20min_points,\x20max_points,\x20hex_bkg,\x20hex_text\x20FROM\x20Levels\x20ORDER\x20BY\x20min_points\x20ASC', [], (e, f) => {
        if (e)
            return d['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20obtener\x20los\x20niveles' });
        d['json'](f);
    });
}), router['put']('/perfil', (i, j) => {
    const k = i['headers']['authorization'];
    if (!k || !k['startsWith']('Bearer\x20'))
        return j['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const l = k['split']('\x20')[0x1], m = decrypt(l);
    if (!m)
        return j['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const {
        first_name: n,
        last_name: o,
        phone: p
    } = i['body'];
    if (!n || !o)
        return j['status'](0x190)['json']({ 'error': 'Nombre\x20y\x20apellidos\x20son\x20obligatorios' });
    db['run']('UPDATE\x20Users\x20SET\x20first_name\x20=\x20?,\x20last_name\x20=\x20?,\x20phone\x20=\x20?\x20WHERE\x20id\x20=\x20?', [
        n,
        o,
        p || null,
        m
    ], function (q) {
        if (q)
            return j['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20actualizar\x20el\x20perfil' });
        j['json']({ 'message': 'Perfil\x20actualizado\x20correctamente' });
    });
}), router['put']('/password', (h, i) => {
    const j = h['headers']['authorization'];
    if (!j || !j['startsWith']('Bearer\x20'))
        return i['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const k = j['split']('\x20')[0x1], l = decrypt(k);
    if (!l)
        return i['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    const {
        password_actual: m,
        password_nueva: n
    } = h['body'];
    if (!m || !n)
        return i['status'](0x190)['json']({ 'error': 'Faltan\x20campos\x20obligatorios' });
    if (n['length'] < 0x6)
        return i['status'](0x190)['json']({ 'error': 'La\x20nueva\x20contraseña\x20debe\x20tener\x20al\x20menos\x206\x20caracteres' });
    db['get']('SELECT\x20password_hash\x20FROM\x20Users\x20WHERE\x20id\x20=\x20?', [l], (o, p) => {
        if (o)
            return i['status'](0x1f4)['json']({ 'error': 'Error\x20de\x20base\x20de\x20datos' });
        if (!p)
            return i['status'](0x194)['json']({ 'error': 'Usuario\x20no\x20encontrado' });
        if (!comparePassword(m, p['password_hash']))
            return i['status'](0x191)['json']({ 'error': 'La\x20contraseña\x20actual\x20no\x20es\x20correcta' });
        const q = hashPassword(n);
        db['run']('UPDATE\x20Users\x20SET\x20password_hash\x20=\x20?\x20WHERE\x20id\x20=\x20?', [
            q,
            l
        ], function (v) {
            if (v)
                return i['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20actualizar\x20la\x20contraseña' });
            i['json']({ 'message': 'Contraseña\x20actualizada\x20correctamente' });
        });
    });
}), router['post']('/claim-birthday', (f, g) => {
    const h = f['headers']['authorization'];
    if (!h || !h['startsWith']('Bearer\x20'))
        return g['status'](0x191)['json']({ 'error': 'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido' });
    const i = h['split']('\x20')[0x1], j = decrypt(i);
    if (!j)
        return g['status'](0x191)['json']({ 'error': 'Token\x20inválido' });
    db['get']('SELECT\x20birth_date\x20FROM\x20Users\x20WHERE\x20id\x20=\x20?', [j], (k, l) => {
        if (k)
            return g['status'](0x1f4)['json']({ 'error': 'Error\x20BD' });
        if (!l || !l['birth_date'])
            return g['status'](0x190)['json']({ 'error': 'Fecha\x20de\x20nacimiento\x20no\x20registrada' });
        const m = new Date(), n = new Date(l['birth_date']);
        if (m['getMonth']() !== n['getMonth']() || m['getDate']() !== n['getDate']())
            return g['status'](0x190)['json']({ 'error': 'Hoy\x20no\x20es\x20tu\x20cumpleaños' });
        const o = m['getFullYear']();
        db['get']('SELECT\x20id\x20FROM\x20Point_transactions\x20WHERE\x20user_id\x20=\x20?\x20AND\x20type\x20=\x20\x27birthday_reward\x27\x20AND\x20strftime(\x27%Y\x27,\x20created_at)\x20=\x20?', [
            j,
            o['toString']()
        ], (x, y) => {
            if (x)
                return g['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20comprobar\x20recompensas' });
            if (y)
                return g['status'](0x190)['json']({ 'error': 'Ya\x20has\x20reclamado\x20tu\x20recompensa\x20de\x20cumpleaños\x20este\x20año' });
            const z = 0x1f4;
            db['get']('SELECT\x20id\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?', [j], (A, B) => {
                if (A)
                    return g['status'](0x1f4)['json']({ 'error': 'Error\x20obteniendo\x20wallet' });
                const C = B ? B['id'] : null;
                db['run']('INSERT\x20INTO\x20Point_transactions\x20(user_id,\x20wallet_id,\x20amount_transaction,\x20type)\x20VALUES\x20(?,\x20?,\x20?,\x20\x27birthday_reward\x27)', [
                    j,
                    C,
                    z
                ], function (D) {
                    if (D)
                        return g['status'](0x1f4)['json']({ 'error': 'Error\x20guardando\x20transacción' });
                    db['run']('UPDATE\x20Wallet\x20SET\x20points\x20=\x20points\x20+\x20?\x20WHERE\x20user_id\x20=\x20?', [
                        z,
                        j
                    ], E => {
                        if (E)
                            return g['status'](0x1f4)['json']({ 'error': 'Error\x20actualizando\x20billetera' });
                        g['json']({ 'message': '¡Feliz\x20Cumpleaños!\x20Se\x20han\x20añadido\x20500\x20puntos\x20a\x20tu\x20cartera.' });
                    });
                });
            });
        });
    });
}), module['exports'] = router;