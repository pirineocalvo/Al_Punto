const express=require('express');
const router=express.Router();
const{authenticateWithLocal,requireAdmin}=require('../middleware/auth');
const _d=require('../utils/db');
const _H=['13:30:00','14:00:00','14:30:00','15:00:00','15:30:00','20:00:00','20:30:00','21:00:00','21:30:00','22:00:00','22:30:00'];
router.get('/disponibilidad-mes',authenticateWithLocal,(_q,_s)=>{
const{year,month}=_q.query;
if(!year||!month)return _s.status(400).json({error:'Faltan los parámetros year y month'});
_d.all('SELECT id FROM Mesas WHERE activo = 1',[],(_e1,_ms)=>{
if(_e1)return _s.status(500).json({error:'Error al consultar las mesas'});
if(!_ms.length)return _s.json({});
_d.all(`SELECT r.reserve_date, r.reserve_hour, mr.id_mesa FROM Reservations r JOIN Mesas_reservadas mr ON mr.id_reservas = r.id WHERE strftime('%Y', r.reserve_date) = ? AND strftime('%m', r.reserve_date) = ? AND (r.status IS NULL OR r.status != 'cancel')`,[String(year),String(month).padStart(2,'0')],(_e2,_r)=>{
if(_e2)return _s.status(500).json({error:'Error al consultar las reservas'});
const _o={};
const _ma=_ms.map(_x=>_x.id);
for(const _x of _r){
if(!_H.includes(_x.reserve_hour))continue;
if(!_o[_x.reserve_date])_o[_x.reserve_date]={};
if(!_o[_x.reserve_date][_x.id_mesa])_o[_x.reserve_date][_x.id_mesa]=[];
if(!_o[_x.reserve_date][_x.id_mesa].includes(_x.reserve_hour))_o[_x.reserve_date][_x.id_mesa].push(_x.reserve_hour);
}
const _b={};
for(const _f of Object.keys(_o))_b[_f]=_ma.every(_mi=>{
const _hm=_o[_f][_mi]||[];
return _H.every(_h=>_hm.includes(_h));
});
_s.json(_b);
});
});
});
router.get('/disponibilidad-dia',authenticateWithLocal,(_q,_s)=>{
const{fecha,ocupantes}=_q.query;
if(!fecha)return _s.status(400).json({error:'Falta el parámetro fecha'});
let _qm='SELECT id, name, n_ocupantes FROM Mesas WHERE activo = 1';
const _pa=[];
if(ocupantes){_qm+=' AND n_ocupantes >= ? AND n_ocupantes <= ?';_pa.push(Number(ocupantes),Number(ocupantes)+2);}
_d.all(_qm,_pa,(_e1,_ms)=>{
if(_e1)return _s.status(500).json({error:'Error al consultar las mesas'});
_d.all(`SELECT r.reserve_hour, mr.id_mesa FROM Reservations r JOIN Mesas_reservadas mr ON mr.id_reservas = r.id WHERE r.reserve_date = ? AND (r.status IS NULL OR r.status != 'cancel')`,[fecha],(_e2,_r)=>{
if(_e2)return _s.status(500).json({error:'Error al consultar las reservas'});
const _ho={};
for(const _x of _r){
if(!_H.includes(_x.reserve_hour))continue;
if(!_ho[_x.id_mesa])_ho[_x.id_mesa]=[];
if(!_ho[_x.id_mesa].includes(_x.reserve_hour))_ho[_x.id_mesa].push(_x.reserve_hour);
}
const _rs=_ms.map(_m=>({id:_m.id,name:_m.name,n_ocupantes:_m.n_ocupantes,horasDisponibles:_H.filter(_h=>!(_ho[_m.id]||[]).includes(_h))})).filter(_m=>_m.horasDisponibles.length>0);
_s.json(_rs);
});
});
});
router.post('/reservar',authenticateWithLocal,(_q,_s)=>{
const{idReserva,idMesa}=_q.body;
if(!idReserva||!idMesa)return _s.status(400).json({error:'Faltan idReserva o idMesa'});
_d.get('SELECT id, reserve_date, reserve_hour FROM Reservations WHERE id = ? AND user_id = ?',[idReserva,_q.localUserId],(_e,_rv)=>{
if(_e)return _s.status(500).json({error:'Error de base de datos'});
if(!_rv)return _s.status(404).json({error:'Reserva no encontrada o no pertenece al usuario'});
_d.get('SELECT id FROM Mesas WHERE id = ? AND activo = 1',[idMesa],(_e,_me)=>{
if(_e)return _s.status(500).json({error:'Error de base de datos'});
if(!_me)return _s.status(404).json({error:'Mesa no encontrada o inactiva'});
_d.get(`SELECT mr.id FROM Mesas_reservadas mr JOIN Reservations r ON mr.id_reservas = r.id WHERE mr.id_mesa = ? AND r.reserve_date = ? AND r.reserve_hour = ? AND (r.status IS NULL OR r.status != 'cancel')`,[idMesa,_rv.reserve_date,_rv.reserve_hour],(_e,_oc)=>{
if(_e)return _s.status(500).json({error:'Error de base de datos'});
if(_oc)return _s.status(409).json({error:'Esa mesa ya está reservada para esa fecha y hora. Por favor elige otra.'});
_d.run('INSERT INTO Mesas_reservadas (id_reservas, id_mesa) VALUES (?, ?)',[idReserva,idMesa],function(_e){
if(_e)return _s.status(500).json({error:'Error al vincular la mesa'});
_s.json({message:'Mesa vinculada correctamente',id:this.lastID});
});
});
});
});
});
router.get('/admin/todas',requireAdmin,(_q,_s)=>{
_d.all('SELECT * FROM Mesas ORDER BY activo DESC, id ASC',[],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar las mesas'});
_s.json(_r);
});
});
router.put('/admin/:id',requireAdmin,(_q,_s)=>{
const{name,n_ocupantes,activo}=_q.body;
_d.run('UPDATE Mesas SET name = ?, n_ocupantes = ?, activo = ? WHERE id = ?',[name,Number(n_ocupantes),activo?1:0,_q.params.id],function(_e){
if(_e)return _s.status(500).json({error:'Error al actualizar la mesa'});
if(this.changes===0)return _s.status(404).json({error:'Mesa no encontrada'});
_s.json({message:'Mesa actualizada correctamente'});
});
});
module.exports=router;
