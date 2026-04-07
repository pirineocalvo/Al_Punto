const express=require('express'),router=express['Router'](),{
decrypt
}
=require('../utils/crypto'),db=require('../utils/db');
router['get']('/',(a,b)=>{
const c='SELECT\x20Menu.id,\x20Menu_category.name\x20AS\x20category_name,\x20Menu.id_category,\x20Menu.name,\x20Menu.ingredients,\x20Menu.description,\x20Menu.img_src,\x20Menu.available,\x20Menu.price\x20FROM\x20Menu\x20LEFT\x20JOIN\x20Menu_category\x20ON\x20Menu.id_category\x20=\x20Menu_category.id';
db['all'](c,(d,e)=>{
if(d)console['error']('Error\x20al\x20obtener\x20los\x20platos:',d),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20obtener\x20los\x20platos'
}
);
else{
const f=e['map'](g=>({
'id':g['id'],'name':g['name'],'ingredients':g['ingredients'],'description':g['description'],'img_src':g['img_src'],'available':g['available'],'price':g['price'],'id_category':g['id_category']
}
));
b['json'](f);

}

}
);

}
),router['get']('/:idcategory',(a,b)=>{
const c=a['params']['idcategory'],d='SELECT\x20Menu.id,\x20Menu_category.name\x20AS\x20category_name,\x20Menu.name,\x20Menu.ingredients,\x20Menu.description,\x20Menu.img_src,\x20Menu.available,\x20Menu.price\x20FROM\x20Menu\x20LEFT\x20JOIN\x20Menu_category\x20ON\x20Menu.id_category\x20=\x20Menu_category.id\x20WHERE\x20Menu.id_category\x20=\x20?';
db['all'](d,[c],(e,f)=>{
e?(console['error']('Error\x20al\x20obtener\x20los\x20platos:',e),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20obtener\x20los\x20platos'
}
)):b['json'](f);

}
);

}
),router['post']('/',(a,b)=>{
const c=a['headers']['authorization']['split']('\x20')[0x1],d=a['headers']['authorization']['split']('\x20')[0x2];
if(!c||!d)return b['status'](0x191)['json']({
'error':'No\x20se\x20proporciono\x20un\x20token'
}
);
const {
name:e,ingredients:f,description:g,img_src:h,available:i,price:j,id_category:k
}
=a['body'],l='INSERT\x20INTO\x20Menu\x20(name,\x20ingredients,\x20description,\x20img_src,\x20available,\x20price,\x20id_category)\x20VALUES\x20(?,\x20?,\x20?,\x20?,\x20?,\x20?,\x20?)';
db['run'](l,[e,f,g,h,i,j,k],function(m){
m?(console['error']('Error\x20al\x20insertar\x20el\x20plato:',m),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20insertar\x20el\x20plato'
}
)):b['json']({
'id':this['lastID'],'message':'Plato\x20insertado\x20correctamente'
}
);

}
);

}
),router['post']('/addcategory',(a,b)=>{
const c=a['headers']['authorization']['split']('\x20')[0x1],d=a['headers']['authorization']['split']('\x20')[0x2];
if(!c||!d)return b['status'](0x191)['json']({
'error':'No\x20se\x20proporciono\x20un\x20token'
}
);
const {
name:e
}
=a['body'],f='INSERT\x20INTO\x20Menu_category\x20(name)\x20VALUES\x20(?)';
db['run'](f,[e],function(g){
g?(console['error']('Error\x20al\x20insertar\x20la\x20categoria:',g),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20insertar\x20la\x20categoria'
}
)):b['json']({
'id':this['lastID'],'message':'Categoria\x20insertada\x20correctamente'
}
);

}
);

}
),router['post']('/update',(a,b)=>{
const c=a['headers']['authorization']['split']('\x20')[0x1],d=a['headers']['authorization']['split']('\x20')[0x2];
if(!c||!d)return b['status'](0x191)['json']({
'error':'No\x20se\x20proporciono\x20un\x20token'
}
);
const {
name:e,ingredients:f,description:g,img_src:h,available:i,price:j,id_category:k,id:l
}
=a['body'],m='UPDATE\x20Menu\x20SET\x20name\x20=\x20?,\x20ingredients\x20=\x20?,\x20description\x20=\x20?,\x20img_src\x20=\x20?,\x20available\x20=\x20?,\x20price\x20=\x20?,\x20id_category\x20=\x20?\x20WHERE\x20id\x20=\x20?';
db['run'](m,[e,f,g,h,i,j,k,l],function(n){
n?(console['error']('Error\x20al\x20actualizar\x20el\x20plato:',n),b['status'](0x1f4)['json']({
'error':'Error\x20al\x20actualizar\x20el\x20plato'
}
)):b['json']({
'message':'Plato\x20actualizado\x20correctamente','changes':this['changes']
}
);

}
);

}
),module['exports']=router;
