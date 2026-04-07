const express=require('express'),router=express['Router'](),{
decrypt
}
=require('../utils/crypto'),db=require('../utils/db');
router['post']('/',(a,b)=>{
const c=a['headers']['authorization'];
if(!c||!c['startsWith']('Bearer\x20'))return b['status'](0x191)['json']({
'error':'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido'
}
);
const d=c['split']('\x20')[0x1],e=decrypt(d);
if(!e)return b['status'](0x191)['json']({
'error':'Token\x20inválido'
}
);
const {
id_plato:f,descripcion:g,puntuacion:h
}
=a['body'];
if(!f||h==null||!g)return b['status'](0x190)['json']({
'error':'Datos\x20de\x20la\x20reseña\x20incompletos'
}
);
const i='INSERT\x20INTO\x20Resenias\x20(id_plato,\x20descripcion,\x20puntuacion,\x20user_id)\x20VALUES\x20(?,\x20?,\x20?,\x20?)';
db['run'](i,[f,g,h,e],function(j){
if(j)return console['error']('Error\x20insertando\x20reseña:',j),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20insertar\x20la\x20reseña'
}
);
const k=this['lastID'],l=new Date(),m=0x5;
db['get']('SELECT\x20id\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?',[e],(n,o)=>{
const p=o&&o['id']?o['id']:null;
db['run']('INSERT\x20INTO\x20Point_transactions\x20(user_id,\x20wallet_id,\x20amount_transaction,\x20type)\x20VALUES\x20(?,\x20?,\x20?,\x20\x27add\x20resenia\x27)',[e,p,m],q=>{
if(q)console['error'](q);
db['run']('UPDATE\x20Wallet\x20SET\x20points\x20=\x20points\x20+\x20?\x20WHERE\x20user_id\x20=\x20?',[m,e],r=>{
if(r)console['error'](r);
return b['json']({
'message':'Reseña\x20añadida\x20correctamente','reward':'¡Gracias!\x20Has\x20ganado\x20'+m+'\x20puntos\x20por\x20tu\x20reseña.'
}
);

}
);

}
);

}
);

}
);

}
),router['get']('/my-reviews',(a,b)=>{
const c=a['headers']['authorization'];
if(!c||!c['startsWith']('Bearer\x20'))return b['status'](0x191)['json']({
'error':'Token\x20no\x20proporcionado'
}
);
const d=c['split']('\x20')[0x1],e=decrypt(d);
if(!e)return b['status'](0x191)['json']({
'error':'Token\x20inválido'
}
);
db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.*,\x20m.name\x20as\x20plato_name,\x20m.img_src\x20as\x20plato_img\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Resenias\x20r\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Menu\x20m\x20ON\x20r.id_plato\x20=\x20m.id\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20r.user_id\x20=\x20?\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20r.created_at\x20DESC',[e],(f,g)=>{
if(f)return b['status'](0x1f4)['json']({
'error':'Error\x20obteniendo\x20tus\x20reseñas'
}
);
b['json'](g);

}
);

}
),router['get']('/:id_plato',(a,b)=>{
const {
id_plato:c
}
=a['params'];
db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.*,\x20u.first_name,\x20u.last_name\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Resenias\x20r\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Users\x20u\x20ON\x20r.user_id\x20=\x20u.id\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20r.id_plato\x20=\x20?\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20r.created_at\x20DESC',[c],(d,e)=>{
if(d)return b['status'](0x1f4)['json']({
'error':'Error\x20obteniendo\x20reseñas'
}
);
b['json'](e);

}
);

}
),module['exports']=router;
