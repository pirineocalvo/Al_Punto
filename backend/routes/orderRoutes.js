const express=require('express'),router=express['Router'](),{
decrypt
}
=require('../utils/crypto'),db=require('../utils/db'),authMiddleware=(a,b,c)=>{
const d=a['headers']['authorization'];
if(!d||!d['startsWith']('Bearer\x20'))return b['status'](0x191)['json']({
'error':'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido'
}
);
const e=d['split']('\x20')[0x1],f=decrypt(e);
if(!f)return b['status'](0x191)['json']({
'error':'Token\x20inválido'
}
);
a['userId']=f,c();

}
,adminMiddleware=(a,b,c)=>{
db['get']('SELECT\x20access_level\x20FROM\x20Users\x20WHERE\x20id\x20=\x20?',[a['userId']],(d,e)=>{
if(d)return b['status'](0x1f4)['json']({
'error':'Error\x20de\x20base\x20de\x20datos'
}
);
if(!e||e['access_level']<=0x3)return b['status'](0x193)['json']({
'error':'Acceso\x20denegado:\x20se\x20requiere\x20nivel\x20Staff/Admin'
}
);
c();

}
);

}
;
router['post']('/create',(a,b)=>{
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
items:f,total_price:g
}
=a['body'];
if(!f||f['length']===0x0)return b['status'](0x190)['json']({
'error':'No\x20hay\x20items\x20en\x20el\x20pedido'
}
);
db['run']('INSERT\x20INTO\x20Orders\x20(user_id,\x20total_price,\x20status,\x20is_picked_up)\x20VALUES\x20(?,\x20?,\x20?,\x20?)',[e,g,'pendiente',0x0],function(h){
if(h)return console['error']('Error\x20al\x20crear\x20el\x20pedido:',h),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20crear\x20el\x20pedido'
}
);
const i=this['lastID'],j=k=>{
if(k>=f['length'])return b['json']({
'message':'Pedido\x20creado\x20correctamente','orderId':i
}
);
const l=f[k];
db['run']('INSERT\x20INTO\x20Order_items\x20(order_id,\x20product_id,\x20quantity,\x20price_at_time)\x20VALUES\x20(?,\x20?,\x20?,\x20?)',[i,l['product_id'],l['quantity'],l['price_at_time']],m=>{
if(m)return console['error']('Error\x20al\x20añadir\x20item\x20al\x20pedido:',m),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20añadir\x20items\x20al\x20pedido'
}
);
j(k+0x1);

}
);

}
;
j(0x0);

}
);

}
),router['get']('/mis-pedidos',(a,b)=>{
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
const f='\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20Orders.id,\x20Orders.total_price,\x20Orders.status,\x20Orders.created_at,\x20Orders.is_picked_up,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Order_items.id\x20as\x20item_id,\x20Order_items.quantity,\x20Order_items.price_at_time,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Menu.name\x20as\x20product_name,\x20Menu.img_src\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Orders\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Order_items\x20ON\x20Orders.id\x20=\x20Order_items.order_id\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Menu\x20ON\x20Order_items.product_id\x20=\x20Menu.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20Orders.user_id\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20Orders.created_at\x20DESC\x0a\x20\x20\x20\x20';
db['all'](f,[e],(g,h)=>{
if(g)return console['error']('Error\x20al\x20obtener\x20pedidos:',g),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20obtener\x20los\x20pedidos'
}
);
const i={

}
;
h['forEach'](j=>{
!i[j['id']]&&(i[j['id']]={
'id':j['id'],'total_price':j['total_price'],'status':j['status'],'created_at':j['created_at'],'is_picked_up':j['is_picked_up'],'items':[]
}
),j['item_id']&&i[j['id']]['items']['push']({
'id':j['item_id'],'quantity':j['quantity'],'price_at_time':j['price_at_time'],'product_name':j['product_name'],'img_src':j['img_src']
}
);

}
),b['json'](Object['values'](i));

}
);

}
),router['delete']('/cancelar/:id',(a,b)=>{
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
id:f
}
=a['params'];
db['run']('UPDATE\x20Orders\x20SET\x20status\x20=\x20\x22cancelado\x22\x20WHERE\x20id\x20=\x20?\x20AND\x20user_id\x20=\x20?\x20AND\x20status\x20=\x20\x22pendiente\x22',[f,e],function(g){
if(g)return console['error']('Error\x20al\x20cancelar\x20pedido:',g),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20cancelar\x20el\x20pedido'
}
);
if(this['changes']===0x0)return b['status'](0x194)['json']({
'error':'Pedido\x20no\x20encontrado\x20o\x20no\x20se\x20puede\x20cancelar'
}
);
b['json']({
'message':'Pedido\x20cancelado\x20correctamente'
}
);

}
);

}
),router['get']('/admin/todos',authMiddleware,adminMiddleware,(a,b)=>{
const c='\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20Orders.id,\x20Orders.total_price,\x20Orders.status,\x20Orders.created_at,\x20Orders.is_picked_up,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Users.first_name,\x20Users.last_name,\x20Users.email,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Order_items.id\x20as\x20item_id,\x20Order_items.quantity,\x20Order_items.price_at_time,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Menu.name\x20as\x20product_name\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Orders\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Users\x20ON\x20Orders.user_id\x20=\x20Users.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Order_items\x20ON\x20Orders.id\x20=\x20Order_items.order_id\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Menu\x20ON\x20Order_items.product_id\x20=\x20Menu.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20Orders.created_at\x20DESC\x0a\x20\x20\x20\x20';
db['all'](c,[],(d,e)=>{
if(d)return console['error']('Error\x20al\x20obtener\x20todos\x20los\x20pedidos:',d),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20obtener\x20los\x20pedidos'
}
);
const f={

}
;
e['forEach'](g=>{
!f[g['id']]&&(f[g['id']]={
'id':g['id'],'total_price':g['total_price'],'status':g['status'],'created_at':g['created_at'],'is_picked_up':g['is_picked_up'],'customer':g['first_name']+'\x20'+g['last_name'],'email':g['email'],'items':[]
}
),g['item_id']&&f[g['id']]['items']['push']({
'id':g['item_id'],'quantity':g['quantity'],'price_at_time':g['price_at_time'],'product_name':g['product_name']
}
);

}
),b['json'](Object['values'](f));

}
);

}
),router['patch']('/admin/:id/status',authMiddleware,adminMiddleware,(a,b)=>{
const {
id:c
}
=a['params'],{
status:d,is_picked_up:e
}
=a['body'];
db['run']('UPDATE\x20Orders\x20SET\x20status\x20=\x20?,\x20is_picked_up\x20=\x20?\x20WHERE\x20id\x20=\x20?',[d,e?0x1:0x0,c],function(f){
if(f)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20actualizar\x20el\x20pedido'
}
);
if(this['changes']===0x0)return b['status'](0x194)['json']({
'error':'Pedido\x20no\x20encontrado'
}
);
b['json']({
'message':'Pedido\x20actualizado\x20correctamente'
}
);

}
);

}
),module['exports']=router;
