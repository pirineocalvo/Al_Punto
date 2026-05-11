const express=require('express');
const router=express.Router();
const{authenticateWithLocal,requireAdmin}=require('../middleware/auth');
const _d=require('../utils/db');
const{createNotification}=require('../utils/notifications');
router.post('/create',authenticateWithLocal,(_q,_s)=>{
const{items,total_price}=_q.body;
if(!items||items.length===0)return _s.status(400).json({error:'No hay items en el pedido'});
_d.run('INSERT INTO Orders (user_id, total_price, status, is_picked_up) VALUES (?, ?, ?, ?)',[_q.localUserId,total_price,'pendiente',0],function(_e){
if(_e)return _s.status(500).json({error:'Error al crear el pedido'});
const _o=this.lastID;
const _f=(_i)=>{
if(_i>=items.length)return _s.json({message:'Pedido creado correctamente',orderId:_o});
const _it=items[_i];
_d.run('INSERT INTO Order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',[_o,_it.product_id,_it.quantity,_it.price_at_time],(_e)=>{
if(_e)return _s.status(500).json({error:'Error al añadir items al pedido'});
_f(_i+1);
});
};
_f(0);
});
});
router.get('/mis-pedidos',authenticateWithLocal,(_q,_s)=>{
const _qy=`SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up, Order_items.id as item_id, Order_items.quantity, Order_items.price_at_time, Menu.name as product_name, Menu.img_src FROM Orders LEFT JOIN Order_items ON Orders.id = Order_items.order_id LEFT JOIN Menu ON Order_items.product_id = Menu.id WHERE Orders.user_id = ? ORDER BY Orders.created_at DESC`;
_d.all(_qy,[_q.localUserId],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener los pedidos'});
const _o={};
_r.forEach(_x=>{
if(!_o[_x.id])_o[_x.id]={id:_x.id,total_price:_x.total_price,status:_x.status,created_at:_x.created_at,is_picked_up:_x.is_picked_up,items:[]};
if(_x.item_id)_o[_x.id].items.push({id:_x.item_id,quantity:_x.quantity,price_at_time:_x.price_at_time,product_name:_x.product_name,img_src:_x.img_src});
});
_s.json(Object.values(_o));
});
});
router.delete('/cancelar/:id',authenticateWithLocal,(_q,_s)=>{
_d.run('UPDATE Orders SET status = "cancelado" WHERE id = ? AND user_id = ? AND status = "pendiente"',[_q.params.id,_q.localUserId],function(_e){
if(_e)return _s.status(500).json({error:'Error al cancelar el pedido'});
if(this.changes===0)return _s.status(404).json({error:'Pedido no encontrado o no se puede cancelar'});
_s.json({message:'Pedido cancelado correctamente'});
});
});
router.get('/admin/todos',requireAdmin,(_q,_s)=>{
const _qy=`SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up, Users.first_name, Users.last_name, Users.email, Order_items.id as item_id, Order_items.quantity, Order_items.price_at_time, Menu.name as product_name FROM Orders LEFT JOIN Users ON Orders.user_id = Users.id LEFT JOIN Order_items ON Orders.id = Order_items.order_id LEFT JOIN Menu ON Order_items.product_id = Menu.id ORDER BY Orders.created_at DESC`;
_d.all(_qy,[],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener los pedidos'});
const _o={};
_r.forEach(_x=>{
if(!_o[_x.id])_o[_x.id]={id:_x.id,total_price:_x.total_price,status:_x.status,created_at:_x.created_at,is_picked_up:_x.is_picked_up,customer:`${_x.first_name} ${_x.last_name}`,email:_x.email,items:[]};
if(_x.item_id)_o[_x.id].items.push({id:_x.item_id,quantity:_x.quantity,price_at_time:_x.price_at_time,product_name:_x.product_name});
});
_s.json(Object.values(_o));
});
});
router.patch('/admin/:id/status',requireAdmin,(_q,_s)=>{
const{id}=_q.params;
const{status,is_picked_up}=_q.body;
_d.get('SELECT user_id FROM Orders WHERE id = ?',[id],(_e,_o)=>{
if(_e||!_o)return _s.status(404).json({error:'Pedido no encontrado'});
_d.run('UPDATE Orders SET status = ?, is_picked_up = ? WHERE id = ?',[status,is_picked_up?1:0,id],function(_e){
if(_e)return _s.status(500).json({error:'Error al actualizar el pedido'});
if(this.changes===0)return _s.status(404).json({error:'Pedido no encontrado'});
if(status==='listo')createNotification(_o.user_id,`🛎️ Tu pedido #${id} está listo para recoger`,'order');
else if(status==='entregado')createNotification(_o.user_id,`✅ Tu pedido #${id} ha sido entregado. ¡Gracias!`,'order');
_s.json({message:'Pedido actualizado correctamente'});
});
});
});
module.exports=router;
