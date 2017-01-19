
import * as Koa from 'koa';
import * as route from 'koa-route';


const m = module.exports;
m.daoToRestRouter = function(dao){
    var router = new Koa();

    router.use(route.get('/:id',async function(ctx,id){
        var item = await dao.getOneById(parseInt(id));
        ctx.body = item || false;
    }));
    router.use(route.post('/'),async function(ctx){
        
    })

    return router;
};