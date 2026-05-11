const express=require('express');
const router=express.Router();
const{requireAdmin}=require('../middleware/auth');
const _d=require('../utils/db');
const{createNotification}=require('../utils/notifications');
router.use(requireAdmin);
router.get('/charts/reservas-semana',(_q,_s)=>{
_d.all(`SELECT date(reserve_date) as dia, COUNT(*) as total FROM Reservations WHERE reserve_date >= date('now', '-6 days') AND (status IS NULL OR status != 'cancel') GROUP BY dia ORDER BY dia ASC`,[],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener datos'});
const _x=[];
for(let _i=6;_i>=0;_i--){
const _t=new Date();_t.setDate(_t.getDate()-_i);
const _k=_t.toISOString().slice(0,10);
_x.push({dia:_t.toLocaleDateString('es-ES',{weekday:'short',day:'numeric'}),total:(_r.find(_y=>_y.dia===_k)||{total:0}).total});
}
_s.json(_x);
});
});
router.get('/charts/pedidos-meses',(_q,_s)=>{
_d.all(`SELECT strftime('%Y-%m', created_at) as mes, COUNT(*) as pedidos, SUM(total_price) as ingresos FROM Orders WHERE status != 'cancelado' AND created_at >= date('now', '-5 months', 'start of month') GROUP BY mes ORDER BY mes ASC`,[],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener datos'});
const _x=[];
for(let _i=5;_i>=0;_i--){
const _t=new Date();_t.setMonth(_t.getMonth()-_i);
const _k=`${_t.getFullYear()}-${String(_t.getMonth()+1).padStart(2,'0')}`;
const _f=_r.find(_y=>_y.mes===_k);
_x.push({mes:_t.toLocaleDateString('es-ES',{month:'short',year:'2-digit'}),pedidos:_f?_f.pedidos:0,ingresos:_f?parseFloat(_f.ingresos||0).toFixed(2):'0.00'});
}
_s.json(_x);
});
});
router.get('/users',(_q,_s)=>{
_d.all(`SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.access_level, u.created_at, w.points FROM Users u LEFT JOIN Wallet w ON u.id = w.user_id ORDER BY u.id DESC`,(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener usuarios'});
_s.json(_r);
});
});
router.get('/reservas',(_q,_s)=>{
_d.all('SELECT r.*, u.first_name, u.last_name FROM Reservations r JOIN Users u ON r.user_id = u.id ORDER BY r.reserve_date DESC, r.reserve_hour DESC',(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener reservas'});
_s.json(_r);
});
});
router.patch('/reservas/:id/attendance',(_q,_s)=>{
const _x=_q.body.attended===1?'attended':'no-show';
_d.run('UPDATE Reservations SET status = ? WHERE id = ?',[_x,_q.params.id],function(_e){
if(_e)return _s.status(500).json({error:'Error al actualizar asistencia'});
_s.json({message:'Asistencia actualizada'});
});
});
router.patch('/reservas/:id/cancel',(_q,_s)=>{
const{id}=_q.params;
_d.get('SELECT user_id FROM Reservations WHERE id = ?',[id],(_e,_r)=>{
if(_e||!_r)return _s.status(404).json({error:'Reserva no encontrada'});
_d.run('UPDATE Reservations SET status = "cancel" WHERE id = ?',[id],function(_e){
if(_e)return _s.status(500).json({error:'Error al cancelar reserva'});
if(this.changes===0)return _s.status(404).json({error:'Reserva no encontrada'});
createNotification(_r.user_id,`❌ Tu reserva #${id} ha sido cancelada por el equipo. Disculpa las molestias.`,'reserva');
_s.json({message:'Reserva cancelada correctamente'});
});
});
});
router.get('/resenias',(_q,_s)=>{
_d.all(`SELECT r.id, r.descripcion, r.puntuacion, r.created_at, u.first_name, u.last_name, m.name as plato_name, m.img_src as plato_img FROM Resenias r LEFT JOIN Users u ON r.user_id = u.id LEFT JOIN Menu m ON r.id_plato = m.id ORDER BY r.created_at DESC`,[],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener reseñas'});
_s.json(_r);
});
});
module.exports=router;
