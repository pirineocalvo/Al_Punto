const express=require('express');
const router=express.Router();
const _d=require('../utils/db');
router.post('/',(_q,_s)=>{
const _t=_q.headers.authorization.split(' ')[1];
const _a=_q.headers.authorization.split(' ')[2];
if(!_t||!_a)return _s.status(401).json({error:'No se proporciono un token'});
const{name,ingredients,description,img_src,available,price,id_category}=_q.body;
_d.run('INSERT INTO Menu (name, ingredients, description, img_src, available, price, id_category) VALUES (?, ?, ?, ?, ?, ?, ?)',[name,ingredients,description,img_src,available,price,id_category],function(_e){
if(_e){console.error('Error al insertar el plato:',_e);_s.status(500).json({error:'Error al insertar el plato'});}
else _s.json({id:this.lastID,message:'Plato insertado correctamente'});
});
});
router.post('/addcategory',(_q,_s)=>{
const _t=_q.headers.authorization.split(' ')[1];
const _a=_q.headers.authorization.split(' ')[2];
if(!_t||!_a)return _s.status(401).json({error:'No se proporciono un token'});
const{name}=_q.body;
_d.run('INSERT INTO Menu_category (name) VALUES (?)',[name],function(_e){
if(_e){console.error('Error al insertar la categoria:',_e);_s.status(500).json({error:'Error al insertar la categoria'});}
else _s.json({id:this.lastID,message:'Categoria insertada correctamente'});
});
});
module.exports=router;
