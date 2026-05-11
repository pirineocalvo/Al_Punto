const express=require('express');
const router=express.Router();
const{authenticateWithLocal}=require('../middleware/auth');
const _d=require('../utils/db');
router.post('/addreserve',authenticateWithLocal,(_q,_s)=>{
const _b=_q.body;
_d.run('INSERT INTO Reservations (user_id, reserve_date, reserve_hour, guests) VALUES (?,?,?,?)',[_q.localUserId,_b.fecha,_b.hora,_b.comensales],function(_e){
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
_s.status(200).json({message:'Reserva realizada con exito',reservationId:this.lastID});
});
});
router.get('/userReserve',authenticateWithLocal,(_q,_s)=>{
_d.all(`SELECT r.*, mr.id_mesa, m.name as mesa_name, m.n_ocupantes as mesa_n_ocupantes FROM Reservations r LEFT JOIN Mesas_reservadas mr ON mr.id_reservas = r.id LEFT JOIN Mesas m ON mr.id_mesa = m.id WHERE r.user_id = ? ORDER BY r.reserve_date DESC, r.reserve_hour DESC`,[_q.localUserId],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
_s.json(_r);
});
});
router.delete('/cancelar/:id',authenticateWithLocal,(_q,_s)=>{
const{id}=_q.params;
_d.run('UPDATE Reservations SET status = "cancel" WHERE id = ? AND user_id = ?',[id,_q.localUserId],function(_e){
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
if(this.changes===0)return _s.status(404).json({error:'Reserva no encontrada'});
_s.status(200).json({message:'Reserva cancelada con exito'});
});
});
module.exports=router;
