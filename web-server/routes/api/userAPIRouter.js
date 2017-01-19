
import * as Koa from 'koa';
import * as route from 'koa-route';
import * as mount from 'koa-mount';
import * as userDao from '../../dao/userDao';
import * as daoToRestRouter from '../../utils/daoToRestRouter';

var router = new Koa();
module.exports = router;

router.use(async function(ctx,next){
    console.log('hello from userAPIRouter');
    await next();
});

// router.use(route.get('/:id',async function(ctx,id){
//     ctx.body=id;
// }))

router.use(mount('/', daoToRestRouter.daoToRestRouter(userDao)));