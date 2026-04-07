const express=require('express');
require('dotenv')['config']();
const cors=require('cors'),http=require('http'),userRoutes=require('./routes/userRoutes'),menuRoutes=require('./routes/menuRoutes'),reserveRoutes=require('./routes/reserveRoutes.js'),ticketsRoutes=require('./routes/ticketsRoutes.js'),marketRoutes=require('./routes/marketRoutes.js'),reseniasRoutes=require('./routes/reseniasRoutes.js'),adminRoutes=require('./routes/adminRoutes.js'),orderRoutes=require('./routes/orderRoutes.js'),mesasRoutes=require('./routes/mesasRoutes.js'),pdaRoutes=require('./routes/pdaRoutes.js'),app=express();
app['use'](cors()),app['use'](express['json']()),app['use']('/api/user',userRoutes),app['use']('/api/menu',menuRoutes),app['use']('/api/reservas',reserveRoutes),app['use']('/api/tickets',ticketsRoutes),app['use']('/api/marketplace',marketRoutes),app['use']('/api/resenias',reseniasRoutes),app['use']('/api/admin',adminRoutes),app['use']('/api/orders',orderRoutes),app['use']('/api/mesas',mesasRoutes),app['use']('/api/pda',pdaRoutes),app['use']('/uploads',express['static']('uploads'));
const PORT=process.env.PORT;
app['listen'](PORT,()=>{
console['log']('Servidor\x20escuchando\x20en\x20http://localhost:'+PORT);

}
);
