const express=require('express');
const router=express.Router();
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const Tesseract=require('tesseract.js');
const{verifyToken}=require('../utils/crypto');
const{authenticateWithLocal}=require('../middleware/auth');
const _d=require('../utils/db.js');
const{createNotification}=require('../utils/notifications');
const _st=multer.diskStorage({
destination:(_q,_f,_c)=>{
const _x=path.join(__dirname,'../uploads/tickets');
if(!fs.existsSync(_x))fs.mkdirSync(_x,{recursive:true});
_c(null,_x);
},
filename:(_q,_f,_c)=>{
try{
const _h=_q.headers.authorization;
const _z=verifyToken(_h?.split(' ')[1]);
const _i=_z?_z.id:'unknown';
const _n=new Date();
const _t=`${_n.getFullYear()}${String(_n.getMonth()+1).padStart(2,'0')}${String(_n.getDate()).padStart(2,'0')}${String(_n.getHours()).padStart(2,'0')}${String(_n.getMinutes()).padStart(2,'0')}${String(_n.getSeconds()).padStart(2,'0')}`;
_q.generatedFileName=`${_t}_${_i}.jpg`;
_c(null,_q.generatedFileName);
}catch(_e){_c(_e);}
}
});
const _up=multer({storage:_st});
const _an=async(_p)=>{
const{data:{text}}=await Tesseract.recognize(_p,'spa',{logger:_m=>console.log(_m)});
return text;
};
const _cp=(_x)=>{
const _r=_x.match(/Total:\s*.*?(\d+(?:[.,]\d{1,2})?)\s*€/i);
return _r?parseFloat(_r[1])*100:0;
};
router.post('/upload',authenticateWithLocal,_up.single('imagen'),async(_q,_s)=>{
if(!_q.file)return _s.status(400).json({error:'No se ha subido ninguna imagen'});
const _u=_q.localUserId;
const _fn=_q.generatedFileName;
try{
const _tx=await _an(_q.file.path);
const _tp=_cp(_tx);
const _st=_tp===0?'review':'ok';
_d.run(`INSERT INTO Tickets (user_id, image_url, json_content, points_awarded, status) VALUES (?, ?, ?, ?, ?)`,[_u,_fn,_tx,_tp,_st],function(_e){
if(_e)return _s.status(500).json({error:'Error al insertar ticket'});
const _ti=this.lastID;
_d.get('SELECT * FROM Wallet WHERE user_id = ?',[_u],(_e,_w)=>{
if(_e)return _s.status(500).json({error:'Error al obtener wallet'});
const _np=_w.points+_tp;
_d.run('UPDATE Wallet SET points = ? WHERE user_id = ?',[_np,_u],function(_e){
if(_e)return _s.status(500).json({error:'Error al actualizar wallet'});
_d.run(`INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?, ?, ?, ?)`,[_u,_w.id,_tp,'add ticket'],function(_e){
if(_e)return _s.status(500).json({error:'Error al insertar ticket history'});
if(_tp>0)createNotification(_u,`🎫 Ticket procesado: has ganado ${_tp} puntos`,'info');
_d.all('SELECT name, min_points, max_points FROM Levels ORDER BY min_points ASC',[],(_e,_lv)=>{
if(!_e&&_lv.length){
const _ol=_lv.find(_l=>_w.points>=_l.min_points&&_w.points<=_l.max_points);
const _nl=_lv.find(_l=>_np>=_l.min_points&&_np<=_l.max_points);
if(_ol&&_nl&&_ol.name!==_nl.name)createNotification(_u,`🏆 ¡Has subido al nivel ${_nl.name}! Sigue así.`,'level');
}
});
_s.json({message:'Ticket subido y procesado correctamente',fileName:_fn,text:_tx,points:_tp,status:_st,ticketId:_ti,walletId:_w.id,newPoints:_np});
});
});
});
});
}catch(_e){_s.status(500).json({error:_e.message});}
});
router.get('/mytickets',authenticateWithLocal,(_q,_s)=>{
_d.all('SELECT * FROM Tickets WHERE user_id = ?',[_q.localUserId],(_e,_t)=>{
if(_e)return _s.status(500).json({error:'Error al obtener tickets'});
_s.json(_t);
});
});
module.exports=router;
