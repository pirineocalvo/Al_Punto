const express=require('express'),router=express['Router'](),{
decrypt
}
=require('../utils/crypto'),db=require('../utils/db');
router['get']('/items',(a,b)=>{
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
db['all']('SELECT\x20id\x20FROM\x20Levels\x20WHERE\x20min_points\x20<=\x20(SELECT\x20points\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?)\x20AND\x20max_points\x20>=\x20(SELECT\x20points\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?)',[e,e],(f,g)=>{
if(f)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
if(!g||g['length']===0x0)return b['status'](0x194)['json']({
'error':'Nivel\x20no\x20encontrado\x20para\x20el\x20usuario'
}
);
const h=g[0x0]['id'];
db['all']('SELECT\x20*\x20FROM\x20Marketplace\x20WHERE\x20min_level_id\x20<=\x20?',[h],(i,j)=>{
if(i)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
b['json'](j);

}
);

}
);

}
),router['get']('/mypocket',(a,b)=>{
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
db['all']('SELECT\x20*\x20FROM\x20Pocket\x20INNER\x20JOIN\x20Marketplace\x20ON\x20Pocket.product_id\x20=\x20Marketplace.id\x20WHERE\x20Pocket.user_id\x20=\x20?',[e],(f,g)=>{
if(f)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
b['json'](g);

}
);

}
),router['post']('/comprar/:id',(a,b)=>{
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
const {
id:f
}
=a['params'];
db['all']('SELECT\x20points_price\x20FROM\x20Marketplace\x20WHERE\x20id\x20=\x20?',[f],(g,h)=>{
if(g)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
const i=h[0x0]['points_price'];
db['all']('SELECT\x20id,\x20points\x20FROM\x20Wallet\x20WHERE\x20user_id\x20=\x20?',[e],(j,k)=>{
if(j)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20consultar\x20la\x20base\x20de\x20datos'
}
);
const l=k[0x0]['points'],m=k[0x0]['id'];
if(l<i)return b['status'](0x190)['json']({
'error':'No\x20tienes\x20suficientes\x20puntos'
}
);
else db['run']('UPDATE\x20Wallet\x20SET\x20points\x20=\x20points\x20-\x20?\x20WHERE\x20user_id\x20=\x20?',[i,e],function(n){
if(n)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20actualizar\x20wallet'
}
);
const o=e+'-'+f+'-'+Date['now']();
db['run']('INSERT\x20INTO\x20Pocket\x20(user_id,\x20product_id,\x20token_url)\x20VALUES\x20(?,?,\x20?)',[e,f,o],function(p){
if(p)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20insertar\x20en\x20pocket'
}
);
db['run']('INSERT\x20INTO\x20Point_transactions\x20(user_id,\x20wallet_id,\x20amount_transaction,\x20type)\x20VALUES\x20(?,?,\x20?,\x20?)',[e,m,i,'buy\x20market'],function(q){
if(q)return b['status'](0x1f4)['json']({
'error':'Error\x20al\x20insertar\x20en\x20point_transactions'
}
);
b['status'](0xc8)['json']({
'message':'Item\x20comprado\x20con\x20exito'
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
