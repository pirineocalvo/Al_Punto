const express=require('express'),router=express['Router'](),{
decrypt
}
=require('../utils/crypto'),db=require('../utils/db'),HORARIOS=['13:30:00','14:00:00','14:30:00','15:00:00','15:30:00','20:00:00','20:30:00','21:00:00','21:30:00','22:00:00','22:30:00'],authMiddleware=(a,b,c)=>{
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
router['get']('/disponibilidad-mes',authMiddleware,(a,b)=>{
const {
year:c,month:d
}
=a['query'];
if(!c||!d)return b['status'](0x190)['json']({
'error':'Faltan\x20los\x20parámetros\x20year\x20y\x20month'
}
);
db['all']('SELECT\x20id\x20FROM\x20Mesas\x20WHERE\x20activo\x20=\x201',[],(e,f)=>{
if(e)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20las\x20mesas'
}
);
if(!f['length'])return b['json']({

}
);
db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.reserve_date,\x20r.reserve_hour,\x20mr.id_mesa\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Reservations\x20r\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20JOIN\x20Mesas_reservadas\x20mr\x20ON\x20mr.id_reservas\x20=\x20r.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20strftime(\x27%Y\x27,\x20r.reserve_date)\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20strftime(\x27%m\x27,\x20r.reserve_date)\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20(r.status\x20IS\x20NULL\x20OR\x20r.status\x20!=\x20\x27cancel\x27)\x0a\x20\x20\x20\x20\x20\x20\x20\x20',[String(c),String(d)['padStart'](0x2,'0')],(g,h)=>{
if(g)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20las\x20reservas'
}
);
const i={

}
,j=f['map'](l=>l['id']);
for(const l of h){
const m=l['reserve_date'],n=l['id_mesa'],o=l['reserve_hour'];
if(!HORARIOS['includes'](o))continue;
if(!i[m])i[m]={

}
;
if(!i[m][n])i[m][n]=[];
!i[m][n]['includes'](o)&&i[m][n]['push'](o);

}
const k={

}
;
for(const p of Object['keys'](i)){
k[p]=j['every'](q=>{
const r=i[p][q]||[];
return HORARIOS['every'](s=>r['includes'](s));

}
);

}
b['json'](k);

}
);

}
);

}
),router['get']('/disponibilidad-dia',authMiddleware,(a,b)=>{
const {
fecha:c,ocupantes:d
}
=a['query'];
if(!c)return b['status'](0x190)['json']({
'error':'Falta\x20el\x20parámetro\x20fecha'
}
);
let e='SELECT\x20id,\x20name,\x20n_ocupantes\x20FROM\x20Mesas\x20WHERE\x20activo\x20=\x201';
const f=[];
if(d){
const g=Number(d)+0x2;
e+='\x20AND\x20n_ocupantes\x20>=\x20?\x20AND\x20n_ocupantes\x20<=\x20?',f['push'](Number(d),g);

}
db['all'](e,f,(h,i)=>{
if(h)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20las\x20mesas'
}
);
db['all']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20r.reserve_hour,\x20mr.id_mesa\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Reservations\x20r\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20JOIN\x20Mesas_reservadas\x20mr\x20ON\x20mr.id_reservas\x20=\x20r.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20r.reserve_date\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20(r.status\x20IS\x20NULL\x20OR\x20r.status\x20!=\x20\x27cancel\x27)\x0a\x20\x20\x20\x20\x20\x20\x20\x20',[c],(j,k)=>{
if(j)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20las\x20reservas'
}
);
const l={

}
;
for(const n of k){
if(!HORARIOS['includes'](n['reserve_hour']))continue;
if(!l[n['id_mesa']])l[n['id_mesa']]=[];
!l[n['id_mesa']]['includes'](n['reserve_hour'])&&l[n['id_mesa']]['push'](n['reserve_hour']);

}
const m=i['map'](o=>({
'id':o['id'],'name':o['name'],'n_ocupantes':o['n_ocupantes'],'horasDisponibles':HORARIOS['filter'](p=>!(l[o['id']]||[])['includes'](p))
}
))['filter'](o=>o['horasDisponibles']['length']>0x0);
b['json'](m);

}
);

}
);

}
),router['post']('/reservar',authMiddleware,(a,b)=>{
const {
idReserva:c,idMesa:d
}
=a['body'];
if(!c||!d)return b['status'](0x190)['json']({
'error':'Faltan\x20idReserva\x20o\x20idMesa'
}
);
db['get']('SELECT\x20id,\x20reserve_date,\x20reserve_hour\x20FROM\x20Reservations\x20WHERE\x20id\x20=\x20?\x20AND\x20user_id\x20=\x20?',[c,a['userId']],(e,f)=>{
if(e)return b['status'](0x1f4)['json']({
'error':'Error\x20de\x20base\x20de\x20datos'
}
);
if(!f)return b['status'](0x194)['json']({
'error':'Reserva\x20no\x20encontrada\x20o\x20no\x20pertenece\x20al\x20usuario'
}
);
db['get']('SELECT\x20id\x20FROM\x20Mesas\x20WHERE\x20id\x20=\x20?\x20AND\x20activo\x20=\x201',[d],(g,h)=>{
if(g)return b['status'](0x1f4)['json']({
'error':'Error\x20de\x20base\x20de\x20datos'
}
);
if(!h)return b['status'](0x194)['json']({
'error':'Mesa\x20no\x20encontrada\x20o\x20inactiva'
}
);
db['get']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20mr.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Mesas_reservadas\x20mr\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20JOIN\x20Reservations\x20r\x20ON\x20mr.id_reservas\x20=\x20r.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20mr.id_mesa\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20r.reserve_date\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20r.reserve_hour\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20(r.status\x20IS\x20NULL\x20OR\x20r.status\x20!=\x20\x27cancel\x27)\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20',[d,f['reserve_date'],f['reserve_hour']],(i,j)=>{
if(i)return b['status'](0x1f4)['json']({
'error':'Error\x20de\x20base\x20de\x20datos'
}
);
if(j)return b['status'](0x199)['json']({
'error':'Esa\x20mesa\x20ya\x20está\x20reservada\x20para\x20esa\x20fecha\x20y\x20hora.\x20Por\x20favor\x20elige\x20otra.'
}
);
db['run']('INSERT\x20INTO\x20Mesas_reservadas\x20(id_reservas,\x20id_mesa)\x20VALUES\x20(?,\x20?)',[c,d],function(k){
if(k)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20vincular\x20la\x20mesa'
}
);
b['json']({
'message':'Mesa\x20vinculada\x20correctamente','id':this['lastID']
}
);

}
);

}
);

}
);

}
);

}
),router['get']('/admin/todas',authMiddleware,adminMiddleware,(a,b)=>{
db['all']('SELECT\x20*\x20FROM\x20Mesas\x20ORDER\x20BY\x20activo\x20DESC,\x20id\x20ASC',[],(c,d)=>{
if(c)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20las\x20mesas'
}
);
b['json'](d);

}
);

}
),router['post']('/admin/crear',authMiddleware,adminMiddleware,(a,b)=>{
const {
name:c,n_ocupantes:d
}
=a['body'];
if(!c||!d)return b['status'](0x190)['json']({
'error':'Faltan\x20name\x20o\x20n_ocupantes'
}
);
db['run']('INSERT\x20INTO\x20Mesas\x20(name,\x20n_ocupantes,\x20activo)\x20VALUES\x20(?,\x20?,\x201)',[c,Number(d)],function(e){
if(e)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20crear\x20la\x20mesa'
}
);
b['json']({
'message':'Mesa\x20creada\x20correctamente','id':this['lastID']
}
);

}
);

}
),router['put']('/admin/:id',authMiddleware,adminMiddleware,(a,b)=>{
const {
name:c,n_ocupantes:d,activo:e
}
=a['body'],{
id:f
}
=a['params'];
db['run']('UPDATE\x20Mesas\x20SET\x20name\x20=\x20?,\x20n_ocupantes\x20=\x20?,\x20activo\x20=\x20?\x20WHERE\x20id\x20=\x20?',[c,Number(d),e?0x1:0x0,f],function(g){
if(g)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20actualizar\x20la\x20mesa'
}
);
if(this['changes']===0x0)return b['status'](0x194)['json']({
'error':'Mesa\x20no\x20encontrada'
}
);
b['json']({
'message':'Mesa\x20actualizada\x20correctamente'
}
);

}
);

}
),router['delete']('/admin/:id',authMiddleware,adminMiddleware,(a,b)=>{
const {
id:c
}
=a['params'];
db['run']('UPDATE\x20Mesas\x20SET\x20activo\x20=\x200\x20WHERE\x20id\x20=\x20?',[c],function(d){
if(d)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20desactivar\x20la\x20mesa'
}
);
if(this['changes']===0x0)return b['status'](0x194)['json']({
'error':'Mesa\x20no\x20encontrada'
}
);
b['json']({
'message':'Mesa\x20desactivada\x20correctamente'
}
);

}
);

}
),module['exports']=router;
