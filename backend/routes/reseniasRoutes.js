const express=require('express');
const router=express.Router();
const{authenticateWithLocal}=require('../middleware/auth');
const _d=require('../utils/db');
router.post('/',authenticateWithLocal,(_q,_s)=>{
const{id_plato,descripcion,puntuacion}=_q.body;
if(!id_plato||puntuacion==null||!descripcion)return _s.status(400).json({error:'Datos de la reseña incompletos'});
const _u=_q.localUserId;
_d.run('INSERT INTO Resenias (id_plato, descripcion, puntuacion, user_id) VALUES (?, ?, ?, ?)',[id_plato,descripcion,puntuacion,_u],function(_e){
if(_e)return _s.status(500).json({error:'Error al insertar la reseña'});
const _p=5;
_d.get('SELECT id FROM Wallet WHERE user_id = ?',[_u],(_e,_w)=>{
const _i=_w?.id||null;
_d.run("INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?, ?, ?, 'add resenia')",[_u,_i,_p],(_e)=>{
if(_e)console.error(_e);
_d.run('UPDATE Wallet SET points = points + ? WHERE user_id = ?',[_p,_u],(_e)=>{
if(_e)console.error(_e);
_s.json({message:'Reseña añadida correctamente',reward:`¡Gracias! Has ganado ${_p} puntos por tu reseña.`});
});
});
});
});
});
router.get('/my-reviews',authenticateWithLocal,(_q,_s)=>{
_d.all('SELECT r.*, m.name as plato_name, m.img_src as plato_img FROM Resenias r LEFT JOIN Menu m ON r.id_plato = m.id WHERE r.user_id = ? ORDER BY r.created_at DESC',[_q.localUserId],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error obteniendo tus reseñas'});
_s.json(_r);
});
});
router.get('/:id_plato',(_q,_s)=>{
_d.all('SELECT r.*, u.first_name, u.last_name FROM Resenias r LEFT JOIN Users u ON r.user_id = u.id WHERE r.id_plato = ? ORDER BY r.created_at DESC',[_q.params.id_plato],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error obteniendo reseñas'});
_s.json(_r);
});
});
module.exports=router;
