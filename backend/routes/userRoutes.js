const express=require('express'),router=express['Router'](),{
encrypt,decrypt,hashPassword,comparePassword
}
=require('../utils/crypto'),db=require('../utils/db');
router['post']('/login',(a,b)=>{
const {
email:c,password:d
}
=a['body'];
db['get']('SELECT\x20*\x20FROM\x20Users\x20WHERE\x20email\x20=\x20?',[c],(e,f)=>{
if(e)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
if(!f)return b['status'](0x191)['json']({
'error':'Usuario\x20no\x20encontrado'
}
);
const g=f['password_hash'],h=comparePassword(d,g);
if(!h)return db['run']('INSERT\x20INTO\x20login_log\x20(user_id,\x20success,\x20ip_address)\x20VALUES\x20(?,\x20?,\x20?)',[f['id'],![],a['ip']]),b['status'](0x191)['json']({
'error':'Contraseña\x20incorrecta'
}
);
else db['run']('INSERT\x20INTO\x20login_log\x20(user_id,\x20success,\x20ip_address)\x20VALUES\x20(?,\x20?,\x20?)',[f['id'],!![],a['ip']]);
const i=encrypt(f['id']),j={
'first_name':f['first_name'],'last_name':f['last_name'],'phone':f['phone'],'email':f['email']
}
;
b['json']({
'token':i,'userInfo':j
}
);

}
);

}
),router['post']('/register',(a,b)=>{
const {
firstName:c,lastName:d,phone:e,email:f,password:g,birthDate:h
}
=a['body'];
db['get']('SELECT\x20id\x20FROM\x20Users\x20WHERE\x20email\x20=\x20?',[f],(i,j)=>{
if(i)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
if(j)return b['status'](0x191)['json']({
'error':'Usuario\x20ya\x20registrado'
}
);
const k=hashPassword(g),l='INSERT\x20INTO\x20Users\x20(first_name,\x20last_name,\x20phone,\x20email,\x20password_hash,\x20birth_date)\x20VALUES\x20(?,\x20?,\x20?,\x20?,\x20?,\x20?)';
db['run'](l,[c,d,e,f,k,h||null],function(m){
if(m)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20registrar\x20el\x20usuario'
}
);
const n=this['lastID'],o='INSERT\x20INTO\x20Wallet\x20(user_id,\x20points)\x20VALUES\x20(?,\x20?)';
db['run'](o,[n,0x1f4],p=>{
p&&console['error']('Error\x20al\x20crear\x20la\x20billetera:',p),b['json']({
'message':'Usuario\x20registrado\x20correctamente'
}
);

}
);

}
);

}
);

}
),router['get']('/userInfo',(a,b)=>{
const c=a['headers']['authorization'];
if(!c||!c['startsWith']('Bearer\x20'))return b['status'](0x191)['json']({
'error':'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido'
}
);
const d=c['split']('\x20')[0x1],e=decrypt(d);
if(!e)return b['status'](0x191)['json']({
'error':'Token\x20inválido'
}
);
const f='\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20Users.first_name,\x20Users.last_name,\x20Users.phone,\x20Users.email,\x20Wallet.points,\x20Users.access_level,\x0a\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20name\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>\x20min_points\x20AND\x20Wallet.points\x20<\x20max_points)\x20AS\x20levelName,\x0a\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20hex_bkg\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>\x20min_points\x20AND\x20Wallet.points\x20<\x20max_points)\x20AS\x20levelBkg,\x0a\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20hex_text\x20FROM\x20Levels\x20WHERE\x20Wallet.points\x20>\x20min_points\x20AND\x20Wallet.points\x20<\x20max_points)\x20AS\x20levelText,\x0a\x20\x20\x20\x20\x20\x20\x20\x20(SELECT\x20COUNT(*)\x20FROM\x20Tickets\x20WHERE\x20user_id\x20=\x20Users.id)\x20AS\x20ticket_count\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x20Users\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20Wallet\x20ON\x20Users.id\x20=\x20Wallet.user_id\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20Users.id\x20=\x20?\x0a\x20\x20\x20\x20';
db['get'](f,[e],(g,h)=>{
if(g)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
b['json'](h);

}
);

}
),router['get']('/transactions',(a,b)=>{
const c=a['headers']['authorization'];
if(!c||!c['startsWith']('Bearer\x20'))return b['status'](0x191)['json']({
'error':'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido'
}
);
const d=c['split']('\x20')[0x1],e=decrypt(d);
if(!e)return b['status'](0x191)['json']({
'error':'Token\x20inválido'
}
);
const f='\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x20*\x20FROM\x20Point_transactions\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x20user_id\x20=\x20?\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x20id\x20DESC\x0a\x20\x20\x20\x20\x20\x20\x20\x20LIMIT\x2050\x0a\x20\x20\x20\x20';
db['all'](f,[e],(g,h)=>{
if(g)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20transacciones'
}
);
b['json'](h);

}
);

}
),router['post']('/claim-birthday',(a,b)=>{
const c=a['headers']['authorization'];
if(!c||!c['startsWith']('Bearer\x20'))return b['status'](0x191)['json']({
'error':'Token\x20no\x20proporcionado\x20o\x20formato\x20inválido'
}
);
const d=c['split']('\x20')[0x1],e=decrypt(d);
if(!e)return b['status'](0x191)['json']({
'error':'Token\x20inválido'
}
);
db['get']('SELECT\x20birth_date\x20FROM\x20Users\x20WHERE\x20id\x20=\x20?',[e],(f,g)=>{
if(f)return b['status'](0x1f4)['json']({
'error':'Error\x20BD'
}
);
if(!g||!g['birth_date'])return b['status'](0x190)['json']({
'error':'Fecha\x20de\x20nacimiento\x20no\x20registrada'
}
);
const h=new Date(),i=new Date(g['birth_date']);
if(h['getMonth']()!==i['getMonth']()||h['getDate']()!==i['getDate']())return b['status'](0x190)['json']({
'error':'Hoy\x20no\x20es\x20tu\x20cumpleaños'
}
);
const j=h['getFullYear']();
db['get']('SELECT\x20id\x20FROM\x20Point_transactions\x20WHERE\x20user_id\x20=\x20?\x20AND\x20type\x20=\x20\x27birthday_reward\x27\x20AND\x20strftime(\x27%Y\x27,\x20created_at)\x20=\x20?',[e,j['toString']()],(k,l)=>{
if(k)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20comprobar\x20recompensas'
}
);
if(l)return b['status'](0x190)['json']({
'error':'Ya\x20has\x20reclamado\x20tu\x20recompensa\x20de\x20cumpleaños\x20este\x20año'
}
);
const m=0x1f4;
db['get']('SELECT\x20id\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?',[e],(n,o)=>{
if(n)return b['status'](0x1f4)['json']({
'error':'Error\x20obteniendo\x20wallet'
}
);
const p=o?o['id']:null;
db['run']('INSERT\x20INTO\x20Point_transactions\x20(user_id,\x20wallet_id,\x20amount_transaction,\x20type)\x20VALUES\x20(?,\x20?,\x20?,\x20\x27birthday_reward\x27)',[e,p,m],function(q){
if(q)return b['status'](0x1f4)['json']({
'error':'Error\x20guardando\x20transacción'
}
);
db['run']('UPDATE\x20Wallet\x20SET\x20points\x20=\x20points\x20+\x20?\x20WHERE\x20user_id\x20=\x20?',[m,e],r=>{
if(r)return b['status'](0x1f4)['json']({
'error':'Error\x20actualizando\x20billetera'
}
);
b['json']({
'message':'¡Feliz\x20Cumpleaños!\x20Se\x20han\x20añadido\x20500\x20puntos\x20a\x20tu\x20cartera.'
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
);

}
),module['exports']=router;
