const express=require('express');
const router=express.Router();
const{verifyToken}=require('../utils/crypto');
const _d=require('../utils/db');
const _m=(_q,_s,_n)=>{
const _h=_q.headers.authorization;
if(!_h||!_h.startsWith('Bearer '))return _s.status(401).json({error:'Token no proporcionado o formato inválido'});
const _x=verifyToken(_h.split(' ')[1]);
if(!_x)return _s.status(401).json({error:'Token inválido'});
_q.user=_x;
_n();
};
const _w=(_q,_s,_n)=>{
const _h=_q.headers.authorization;
if(!_h||!_h.startsWith('Bearer '))return _s.status(401).json({error:'Token no proporcionado o formato inválido'});
const _x=verifyToken(_h.split(' ')[1]);
if(!_x)return _s.status(401).json({error:'Token inválido'});
_q.user=_x;
_d.get('SELECT id, access_level FROM Users WHERE auth_user_id = ?',[_x.id],(_e,_u)=>{
if(_e)return _s.status(500).json({error:'Error de base de datos'});
if(!_u||_u.access_level<3)return _s.status(403).json({error:'Acceso denegado: se requiere nivel Camarero o superior'});
_q.localUserId=_u.id;
_n();
});
};
const _g=(_a)=>new Promise((_y,_j)=>{
_d.get('SELECT id FROM Users WHERE auth_user_id = ?',[_a],(_e,_r)=>{
if(_e)return _j(_e);
if(!_r)return _j(new Error('Usuario local no encontrado'));
_y(_r.id);
});
});
router.get('/items',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id);
_d.all('SELECT id FROM Levels WHERE min_points <= (SELECT points FROM Wallet WHERE user_id = ?) AND max_points >= (SELECT points FROM Wallet WHERE user_id = ?)',[_u,_u],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
if(!_r||_r.length===0)return _s.status(404).json({error:'Nivel no encontrado para el usuario'});
const _l=_r[0].id;
_d.all('SELECT * FROM Marketplace WHERE min_level_id <= ?',[_l],(_e,_mr)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
_s.json(_mr);
});
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.get('/mypocket',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id);
_d.all(`SELECT p.id as pocket_id, p.is_used, p.added_at, p.used_at, p.token_url, m.id as product_id, m.name, m.description, m.img_src, m.points_price FROM Pocket p INNER JOIN Marketplace m ON p.product_id = m.id WHERE p.user_id = ? ORDER BY p.is_used ASC, p.added_at DESC`,[_u],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
_s.json(_r);
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.post('/comprar/:id',_m,async(_q,_s)=>{
try{
const _u=await _g(_q.user.id);
const{id}=_q.params;
_d.all('SELECT points_price FROM Marketplace WHERE id = ?',[id],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
const _p=_r[0].points_price;
_d.all('SELECT id, points FROM Wallet WHERE user_id = ?',[_u],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
const _pt=_r[0].points;
const _wi=_r[0].id;
if(_pt<_p)return _s.status(400).json({error:'No tienes suficientes puntos'});
_d.run('UPDATE Wallet SET points = points - ? WHERE user_id = ?',[_p,_u],function(_e){
if(_e)return _s.status(500).json({error:'Error al actualizar wallet'});
const _tk=_u+'-'+id+'-'+Date.now();
_d.run('INSERT INTO Pocket (user_id, product_id, token_url) VALUES (?,?, ?)',[_u,id,_tk],function(_e){
if(_e)return _s.status(500).json({error:'Error al insertar en pocket'});
_d.run('INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?,?, ?, ?)',[_u,_wi,_p,'buy market'],function(_e){
if(_e)return _s.status(500).json({error:'Error al insertar en point_transactions'});
_s.status(200).json({message:'Item comprado con exito'});
});
});
});
});
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.get('/pocket/:userId/use/:tokenUrl',_w,(_q,_s)=>{
const{userId,tokenUrl}=_q.params;
const _pa=tokenUrl.split('-');
if(_pa.length!==3)return _s.status(400).json({error:'Formato de token inválido'});
if(_pa[0]!==String(userId))return _s.status(400).json({error:'El token no corresponde a este usuario'});
const _sq=`SELECT p.id as pocket_id, p.is_used, p.used_at, p.expires_at, p.added_at, m.id as product_id, m.name as product_name, m.description as product_description, m.img_src, u.id as user_id, u.first_name, u.last_name, u.email FROM Pocket p INNER JOIN Marketplace m ON p.product_id = m.id INNER JOIN Users u ON p.user_id = u.id WHERE p.token_url = ? AND p.user_id = ?`;
_d.get(_sq,[tokenUrl,userId],(_e,_r)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
if(!_r)return _s.status(404).json({error:'Token no encontrado'});
if(_r.expires_at&&new Date(_r.expires_at)<new Date())return _s.status(410).json({error:'Token expirado',expired:true});
_s.json({valid:_r.is_used===0,already_used:_r.is_used===1,used_at:_r.used_at,pocket_id:_r.pocket_id,product:{id:_r.product_id,name:_r.product_name,description:_r.product_description,img_src:_r.img_src},user:{id:_r.user_id,first_name:_r.first_name,last_name:_r.last_name,email:_r.email}});
});
});
router.post('/pocket/:userId/use/:tokenUrl',_w,(_q,_s)=>{
const{userId,tokenUrl}=_q.params;
const _pa=tokenUrl.split('-');
if(_pa.length!==3)return _s.status(400).json({error:'Formato de token inválido'});
if(_pa[0]!==String(userId))return _s.status(400).json({error:'El token no corresponde a este usuario'});
_d.get('SELECT id, is_used, expires_at FROM Pocket WHERE token_url = ? AND user_id = ?',[tokenUrl,userId],(_e,_p)=>{
if(_e)return _s.status(500).json({error:'Error al consultar la base de datos'});
if(!_p)return _s.status(404).json({error:'Token no encontrado'});
if(_p.is_used)return _s.status(409).json({error:'Este artículo ya fue canjeado'});
if(_p.expires_at&&new Date(_p.expires_at)<new Date())return _s.status(410).json({error:'Token expirado'});
const _n=new Date().toISOString();
_d.run('UPDATE Pocket SET is_used = 1, used_at = ? WHERE id = ? AND is_used = 0',[_n,_p.id],function(_e){
if(_e)return _s.status(500).json({error:'Error al canjear artículo'});
if(this.changes===0)return _s.status(409).json({error:'Este artículo ya fue canjeado'});
_s.json({message:'Artículo canjeado con éxito',used_at:_n});
});
});
});
module.exports=router;
