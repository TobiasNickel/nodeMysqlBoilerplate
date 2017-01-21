
import * as Koa from 'koa';
import * as route from 'koa-route';
import * as mount from 'koa-mount';
import * as userDao from '../../dao/userDao';
import * as daoToRestRouter from '../../utils/daoToRestRouter';
import * as md5 from 'md5';

var router = new Koa();
module.exports = router;

router.use(mount('/', daoToRestRouter.daoToRestRouter(userDao, {
    inputFilter: async function(ctx,newUser, oldUser){
        if(newUser.password) {
            let password = newUser.password+'';
            if(password.length<6)return false;
            var email = newUser.email || oldUser.email;
            if(!email)return false;
            newUser.password = md5(email+':'+newUser.password);
        }

        if(!oldUser){
            // insert
        }else if(!newUser){
            // delete
        }else {
            // update
            if(newUser.email){
                if(newUser.email!=oldUser.email)return false;
            }
        }
        return newUser;
    },
    outputFilter: async function(ctx,user){
        if(user.registrationTime){
            user.registrationTime = parseInt((user.registrationTime||new Date()).getTime()/1000);
        }else{
            user.registrationTime = null;
        }
        user.verified = !!user.verified;
        delete user.password;
        return user;
    },
    searchableFields: ['name','mail','id'],
    fulltextFields: ['name','mail']
    //todo: add options for paging
    //todo: add options for search (allowence), fulltext...
})));