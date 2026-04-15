const express = require('express'), router = express['Router'](), {decrypt} = require('../utils/crypto'), db = require('../utils/db'), HORARIOS = [
        '13:30:00',
        '14:00:00',
        '14:30:00',
        '15:00:00',
        '15:30:00',
        '20:00:00',
        '20:30:00',
        '21:00:00',
        '21:30:00',
        '22:00:00',
        '22:30:00'
    ], authMiddleware = (g, h, i) => {
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
router['get']('/disponibilidad-mes', authMiddleware, (e, f) => {
    const {
        year: g,
        month: h
    } = e['query'];
    if (!g || !h)
        return f['status'](0x190)['json']({ 'error': 'Faltan\x20los\x20parámetros\x20year\x20y\x20month' });
    db['all']('SELECT\x20id\x20FROM\x20Mesas\x20WHERE\x20activo\x20=\x201', [], (i, j) => {
        if (i)
            return f['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20las\x20mesas' });
        if (!j['length'])
            return f['json']({});
        db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.reserve_date,\x20r.reserve_hour,\x20mr.id_mesa\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Reservations\x20r\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20JOIN\x20Mesas_reservadas\x20mr\x20ON\x20mr.id_reservas\x20=\x20r.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20strftime(\x27%Y\x27,\x20r.reserve_date)\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20strftime(\x27%m\x27,\x20r.reserve_date)\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20(r.status\x20IS\x20NULL\x20OR\x20r.status\x20!=\x20\x27cancel\x27)\x0a\x20\x20\x20\x20\x20\x20\x20\x20', [
            String(g),
            String(h)['padStart'](0x2, '0')
        ], (q, r) => {
            if (q)
                return f['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20las\x20reservas' });
            const s = {}, t = j['map'](v => v['id']);
            for (const v of r) {
                const w = v['reserve_date'], x = v['id_mesa'], y = v['reserve_hour'];
                if (!HORARIOS['includes'](y))
                    continue;
                if (!s[w])
                    s[w] = {};
                if (!s[w][x])
                    s[w][x] = [];
                !s[w][x]['includes'](y) && s[w][x]['push'](y);
            }
            const u = {};
            for (const z of Object['keys'](s)) {
                u[z] = t['every'](I => {
                    const J = s[z][I] || [];
                    return HORARIOS['every'](K => J['includes'](K));
                });
            }
            f['json'](u);
        });
    });
}), router['get']('/disponibilidad-dia', authMiddleware, (h, i) => {
    const {
        fecha: j,
        ocupantes: k
    } = h['query'];
    if (!j)
        return i['status'](0x190)['json']({ 'error': 'Falta\x20el\x20parámetro\x20fecha' });
    let l = 'SELECT\x20id,\x20name,\x20n_ocupantes\x20FROM\x20Mesas\x20WHERE\x20activo\x20=\x201';
    const m = [];
    if (k) {
        const n = Number(k) + 0x2;
        l += '\x20AND\x20n_ocupantes\x20>=\x20?\x20AND\x20n_ocupantes\x20<=\x20?', m['push'](Number(k), n);
    }
    db['all'](l, m, (o, p) => {
        if (o)
            return i['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20las\x20mesas' });
        db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.reserve_hour,\x20mr.id_mesa\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Reservations\x20r\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20JOIN\x20Mesas_reservadas\x20mr\x20ON\x20mr.id_reservas\x20=\x20r.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20r.reserve_date\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20(r.status\x20IS\x20NULL\x20OR\x20r.status\x20!=\x20\x27cancel\x27)\x0a\x20\x20\x20\x20\x20\x20\x20\x20', [j], (s, t) => {
            if (s)
                return i['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20las\x20reservas' });
            const u = {};
            for (const B of t) {
                if (!HORARIOS['includes'](B['reserve_hour']))
                    continue;
                if (!u[B['id_mesa']])
                    u[B['id_mesa']] = [];
                !u[B['id_mesa']]['includes'](B['reserve_hour']) && u[B['id_mesa']]['push'](B['reserve_hour']);
            }
            const A = p['map'](C => ({
                'id': C['id'],
                'name': C['name'],
                'n_ocupantes': C['n_ocupantes'],
                'horasDisponibles': HORARIOS['filter'](D => !(u[C['id']] || [])['includes'](D))
            }))['filter'](C => C['horasDisponibles']['length'] > 0x0);
            i['json'](A);
        });
    });
}), router['post']('/reservar', authMiddleware, (e, f) => {
    const {
        idReserva: g,
        idMesa: h
    } = e['body'];
    if (!g || !h)
        return f['status'](0x190)['json']({ 'error': 'Faltan\x20idReserva\x20o\x20idMesa' });
    db['get']('SELECT\x20id,\x20reserve_date,\x20reserve_hour\x20FROM\x20Reservations\x20WHERE\x20id\x20=\x20?\x20AND\x20user_id\x20=\x20?', [
        g,
        e['userId']
    ], (i, j) => {
        if (i)
            return f['status'](0x1f4)['json']({ 'error': 'Error\x20de\x20base\x20de\x20datos' });
        if (!j)
            return f['status'](0x194)['json']({ 'error': 'Reserva\x20no\x20encontrada\x20o\x20no\x20pertenece\x20al\x20usuario' });
        db['get']('SELECT\x20id\x20FROM\x20Mesas\x20WHERE\x20id\x20=\x20?\x20AND\x20activo\x20=\x201', [h], (o, p) => {
            if (o)
                return f['status'](0x1f4)['json']({ 'error': 'Error\x20de\x20base\x20de\x20datos' });
            if (!p)
                return f['status'](0x194)['json']({ 'error': 'Mesa\x20no\x20encontrada\x20o\x20inactiva' });
            db['get']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20mr.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Mesas_reservadas\x20mr\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20JOIN\x20Reservations\x20r\x20ON\x20mr.id_reservas\x20=\x20r.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20mr.id_mesa\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20r.reserve_date\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20r.reserve_hour\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20(r.status\x20IS\x20NULL\x20OR\x20r.status\x20!=\x20\x27cancel\x27)\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20', [
                h,
                j['reserve_date'],
                j['reserve_hour']
            ], (q, r) => {
                if (q)
                    return f['status'](0x1f4)['json']({ 'error': 'Error\x20de\x20base\x20de\x20datos' });
                if (r)
                    return f['status'](0x199)['json']({ 'error': 'Esa\x20mesa\x20ya\x20está\x20reservada\x20para\x20esa\x20fecha\x20y\x20hora.\x20Por\x20favor\x20elige\x20otra.' });
                db['run']('INSERT\x20INTO\x20Mesas_reservadas\x20(id_reservas,\x20id_mesa)\x20VALUES\x20(?,\x20?)', [
                    g,
                    h
                ], function (s) {
                    if (s)
                        return f['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20vincular\x20la\x20mesa' });
                    f['json']({
                        'message': 'Mesa\x20vinculada\x20correctamente',
                        'id': this['lastID']
                    });
                });
            });
        });
    });
}), router['get']('/admin/todas', authMiddleware, adminMiddleware, (c, d) => {
    db['all']('SELECT\x20*\x20FROM\x20Mesas\x20ORDER\x20BY\x20activo\x20DESC,\x20id\x20ASC', [], (e, f) => {
        if (e)
            return d['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20consultar\x20las\x20mesas' });
        d['json'](f);
    });
}), router['post']('/admin/crear', authMiddleware, adminMiddleware, (e, f) => {
    const {
        name: g,
        n_ocupantes: h
    } = e['body'];
    if (!g || !h)
        return f['status'](0x190)['json']({ 'error': 'Faltan\x20name\x20o\x20n_ocupantes' });
    db['run']('INSERT\x20INTO\x20Mesas\x20(name,\x20n_ocupantes,\x20activo)\x20VALUES\x20(?,\x20?,\x201)', [
        g,
        Number(h)
    ], function (i) {
        if (i)
            return f['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20crear\x20la\x20mesa' });
        f['json']({
            'message': 'Mesa\x20creada\x20correctamente',
            'id': this['lastID']
        });
    });
}), router['put']('/admin/:id', authMiddleware, adminMiddleware, (g, h) => {
    const {
            name: i,
            n_ocupantes: j,
            activo: k
        } = g['body'], {id: l} = g['params'];
    db['run']('UPDATE\x20Mesas\x20SET\x20name\x20=\x20?,\x20n_ocupantes\x20=\x20?,\x20activo\x20=\x20?\x20WHERE\x20id\x20=\x20?', [
        i,
        Number(j),
        k ? 0x1 : 0x0,
        l
    ], function (m) {
        if (m)
            return h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20actualizar\x20la\x20mesa' });
        if (this['changes'] === 0x0)
            return h['status'](0x194)['json']({ 'error': 'Mesa\x20no\x20encontrada' });
        h['json']({ 'message': 'Mesa\x20actualizada\x20correctamente' });
    });
}), router['delete']('/admin/:id', authMiddleware, adminMiddleware, (d, e) => {
    const {id: f} = d['params'];
    db['run']('UPDATE\x20Mesas\x20SET\x20activo\x20=\x200\x20WHERE\x20id\x20=\x20?', [f], function (g) {
        if (g)
            return e['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20desactivar\x20la\x20mesa' });
        if (this['changes'] === 0x0)
            return e['status'](0x194)['json']({ 'error': 'Mesa\x20no\x20encontrada' });
        e['json']({ 'message': 'Mesa\x20desactivada\x20correctamente' });
    });
}), module['exports'] = router;