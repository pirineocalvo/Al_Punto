const express=require('express');
const router=express.Router();
const{verifyToken,hashPassword,comparePassword}=require('../utils/crypto');
const _d=require('../utils/db');
const _m=(_q,_s,_n)=>{
const _h=_q.headers.authorization;
if(!_h||!_h.startsWith('Bearer '))return _s.status(401).json({error:'Token no proporcionado o formato inválido'});
const _x=verifyToken(_h.split(' ')[1]);
if(!_x)return _s.status(401).json({error:'Token inválido o expirado'});
_q.user=_x;
_n();
};
const _g=(_a,_b,_c,_z)=>{
return new Promise((_y,_j)=>{
_d.get('SELECT * FROM Users WHERE auth_user_id = ?',[_a],(_e,_r)=>{
if(_e)return _j(_e);
if(_r)return _y(_r);
_d.get('SELECT * FROM Users WHERE email = ?',[_b],(_e,_l)=>{
if(_e)return _j(_e);
if(_l){
_d.run('UPDATE Users SET auth_user_id = ? WHERE email = ?',[_a,_b],(_e)=>{
if(_e)return _j(_e);
_y({..._l,auth_user_id:_a});
});
return;
}
const _qy=`INSERT INTO Users (first_name, last_name, email, password_hash, auth_user_id) VALUES (?, ?, ?, ?, ?)`;
_d.run(_qy,[_c,_z,_b,'sso-user',_a],function(_e){
if(_e)return _j(_e);
const _i=this.lastID;
_d.run('INSERT INTO Wallet (user_id, points) VALUES (?, ?)',[_i,500],(_e)=>{
if(_e)console.error('Error creando wallet para usuario SSO:',_e);
});
_d.get('SELECT * FROM Users WHERE id = ?',[_i],(_e,_nr)=>{
if(_e)return _j(_e);
_y(_nr);
});
});
});
});
});
};
router.get('/userInfo',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id,_q.user.email,_q.user.nombre,_q.user.apellido);
const _qy=`SELECT Users.first_name, Users.last_name, Users.phone, Users.email, Users.birth_date, Wallet.points, Users.access_level, (SELECT name FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelName, (SELECT hex_bkg FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelBkg, (SELECT hex_text FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelText, (SELECT min_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMin, (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMax, (SELECT name FROM Levels WHERE min_points > (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) ORDER BY min_points ASC LIMIT 1) AS nextLevelName, (SELECT COUNT(*) FROM Tickets WHERE user_id = Users.id) AS ticket_count FROM Users LEFT JOIN Wallet ON Users.id = Wallet.user_id WHERE Users.id = ?`;
_d.get(_qy,[_u.id],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
_s.json(_r);
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.get('/transactions',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id,_q.user.email,_q.user.nombre,_q.user.apellido);
_d.all('SELECT * FROM Point_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 50',[_u.id],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar transacciones'});
_s.json(_r);
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.get('/levels',(_q,_s)=>{
_d.all('SELECT id, name, min_points, max_points, hex_bkg, hex_text FROM Levels ORDER BY min_points ASC',[],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al obtener los niveles'});
_s.json(_r);
});
});
router.put('/perfil',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id,_q.user.email,_q.user.nombre,_q.user.apellido);
const{first_name,last_name,phone}=_q.body;
if(!first_name||!last_name)return _s.status(400).json({error:'Nombre y apellidos son obligatorios'});
_d.run('UPDATE Users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',[first_name,last_name,phone||null,_u.id],function(_e){
if(_e)return _s.status(500).json({error:'Error al actualizar el perfil'});
_s.json({message:'Perfil actualizado correctamente'});
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.put('/password',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id,_q.user.email,_q.user.nombre,_q.user.apellido);
const{password_actual,password_nueva}=_q.body;
if(!password_actual||!password_nueva)return _s.status(400).json({error:'Faltan campos obligatorios'});
if(password_nueva.length<6)return _s.status(400).json({error:'La nueva contraseña debe tener al menos 6 caracteres'});
_d.get('SELECT password_hash FROM Users WHERE id = ?',[_u.id],(_e,_us)=>{
if(_e)return _s.status(500).json({error:'Error de base de datos'});
if(!_us)return _s.status(404).json({error:'Usuario no encontrado'});
if(_us.password_hash==='sso-user')return _s.status(400).json({error:'Para cambiar la contraseña usa el portal central de O Retiro'});
if(!comparePassword(password_actual,_us.password_hash))return _s.status(401).json({error:'La contraseña actual no es correcta'});
_d.run('UPDATE Users SET password_hash = ? WHERE id = ?',[hashPassword(password_nueva),_u.id],function(_e){
if(_e)return _s.status(500).json({error:'Error al actualizar la contraseña'});
_s.json({message:'Contraseña actualizada correctamente'});
});
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.post('/claim-birthday',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id,_q.user.email,_q.user.nombre,_q.user.apellido);
_d.get('SELECT birth_date FROM Users WHERE id = ?',[_u.id],(_e,_us)=>{
if(_e)return _s.status(500).json({error:'Error BD'});
if(!_us||!_us.birth_date)return _s.status(400).json({error:'Fecha de nacimiento no registrada'});
const _t=new Date();
const _bd=new Date(_us.birth_date);
if(_t.getMonth()!==_bd.getMonth()||_t.getDate()!==_bd.getDate())return _s.status(400).json({error:'Hoy no es tu cumpleaños'});
const _y=_t.getFullYear();
_d.get("SELECT id FROM Point_transactions WHERE user_id = ? AND type = 'birthday_reward' AND strftime('%Y', created_at) = ?",[_u.id,_y.toString()],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al comprobar recompensas'});
if(_r)return _s.status(400).json({error:'Ya has reclamado tu recompensa de cumpleaños este año'});
const _p=500;
_d.get('SELECT id FROM Wallet WHERE user_id = ?',[_u.id],(_e,_w)=>{
if(_e)return _s.status(500).json({error:'Error obteniendo wallet'});
const _wi=_w?_w.id:null;
_d.run("INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?, ?, ?, 'birthday_reward')",[_u.id,_wi,_p],function(_e){
if(_e)return _s.status(500).json({error:'Error guardando transacción'});
_d.run('UPDATE Wallet SET points = points + ? WHERE user_id = ?',[_p,_u.id],(_e)=>{
if(_e)return _s.status(500).json({error:'Error actualizando billetera'});
_s.json({message:'¡Feliz Cumpleaños! Se han añadido 500 puntos a tu cartera.'});
});
});
});
});
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
module.exports=router;
