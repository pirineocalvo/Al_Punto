const express = require('express'), router = express['Router'](), {decrypt} = require('../utils/crypto'), db = require('../utils/db');
router['get']('/', (d, e) => {
    const f = 'SELECT\x20Menu.id,\x20Menu_category.name\x20AS\x20category_name,\x20Menu.id_category,\x20Menu.name,\x20Menu.ingredients,\x20Menu.description,\x20Menu.img_src,\x20Menu.available,\x20Menu.price\x20FROM\x20Menu\x20LEFT\x20JOIN\x20Menu_category\x20ON\x20Menu.id_category\x20=\x20Menu_category.id';
    db['all'](f, (g, h) => {
        if (g)
            console['error']('Error\x20al\x20obtener\x20los\x20platos:', g), e['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20obtener\x20los\x20platos' });
        else {
            const i = h['map'](n => ({
                'id': n['id'],
                'name': n['name'],
                'ingredients': n['ingredients'],
                'description': n['description'],
                'img_src': n['img_src'],
                'available': n['available'],
                'price': n['price'],
                'id_category': n['id_category'],
                'category_name': n['category_name']
            }));
            e['json'](i);
        }
    });
}), router['get']('/categorias', (c, d) => {
    db['all']('SELECT\x20*\x20FROM\x20Menu_category\x20ORDER\x20BY\x20id', (e, f) => {
        if (e)
            return d['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20obtener\x20categorías' });
        d['json'](f);
    });
}), router['get']('/:idcategory', (e, f) => {
    const g = e['params']['idcategory'], h = 'SELECT\x20Menu.id,\x20Menu_category.name\x20AS\x20category_name,\x20Menu.name,\x20Menu.ingredients,\x20Menu.description,\x20Menu.img_src,\x20Menu.available,\x20Menu.price\x20FROM\x20Menu\x20LEFT\x20JOIN\x20Menu_category\x20ON\x20Menu.id_category\x20=\x20Menu_category.id\x20WHERE\x20Menu.id_category\x20=\x20?';
    db['all'](h, [g], (i, j) => {
        i ? (console['error']('Error\x20al\x20obtener\x20los\x20platos:', i), f['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20obtener\x20los\x20platos' })) : f['json'](j);
    });
}), router['post']('/', (m, n) => {
    const o = m['headers']['authorization']['split']('\x20')[0x1], p = m['headers']['authorization']['split']('\x20')[0x2];
    if (!o || !p)
        return n['status'](0x191)['json']({ 'error': 'No\x20se\x20proporciono\x20un\x20token' });
    const {
            name: q,
            ingredients: r,
            description: s,
            img_src: t,
            available: u,
            price: v,
            id_category: w
        } = m['body'], x = 'INSERT\x20INTO\x20Menu\x20(name,\x20ingredients,\x20description,\x20img_src,\x20available,\x20price,\x20id_category)\x20VALUES\x20(?,\x20?,\x20?,\x20?,\x20?,\x20?,\x20?)';
    db['run'](x, [
        q,
        r,
        s,
        t,
        u,
        v,
        w
    ], function (y) {
        y ? (console['error']('Error\x20al\x20insertar\x20el\x20plato:', y), n['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20insertar\x20el\x20plato' })) : n['json']({
            'id': this['lastID'],
            'message': 'Plato\x20insertado\x20correctamente'
        });
    });
}), router['post']('/addcategory', (g, h) => {
    const i = g['headers']['authorization']['split']('\x20')[0x1], j = g['headers']['authorization']['split']('\x20')[0x2];
    if (!i || !j)
        return h['status'](0x191)['json']({ 'error': 'No\x20se\x20proporciono\x20un\x20token' });
    const {name: k} = g['body'], l = 'INSERT\x20INTO\x20Menu_category\x20(name)\x20VALUES\x20(?)';
    db['run'](l, [k], function (m) {
        m ? (console['error']('Error\x20al\x20insertar\x20la\x20categoria:', m), h['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20insertar\x20la\x20categoria' })) : h['json']({
            'id': this['lastID'],
            'message': 'Categoria\x20insertada\x20correctamente'
        });
    });
}), router['post']('/update', (n, o) => {
    const p = n['headers']['authorization']['split']('\x20')[0x1], q = n['headers']['authorization']['split']('\x20')[0x2];
    if (!p || !q)
        return o['status'](0x191)['json']({ 'error': 'No\x20se\x20proporciono\x20un\x20token' });
    const {
            name: r,
            ingredients: s,
            description: t,
            img_src: u,
            available: v,
            price: w,
            id_category: x,
            id: y
        } = n['body'], z = 'UPDATE\x20Menu\x20SET\x20name\x20=\x20?,\x20ingredients\x20=\x20?,\x20description\x20=\x20?,\x20img_src\x20=\x20?,\x20available\x20=\x20?,\x20price\x20=\x20?,\x20id_category\x20=\x20?\x20WHERE\x20id\x20=\x20?';
    db['run'](z, [
        r,
        s,
        t,
        u,
        v,
        w,
        x,
        y
    ], function (A) {
        A ? (console['error']('Error\x20al\x20actualizar\x20el\x20plato:', A), o['status'](0x1f4)['json']({ 'error': 'Error\x20al\x20actualizar\x20el\x20plato' })) : o['json']({
            'message': 'Plato\x20actualizado\x20correctamente',
            'changes': this['changes']
        });
    });
}), module['exports'] = router;