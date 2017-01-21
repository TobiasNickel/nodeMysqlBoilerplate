
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
            return false;
        }else if(!newUser){
            // delete
            return false;
        }else {
            // update
            if(newUser.email){
                if(newUser.email!=oldUser.email)return false;
            }
            if(newUser.registrationTime){
                return false;
            }
        }
        return newUser;
    },
    outputFilter: async function(ctx,user){
        user.verified = !!user.verified;
        return user;
    },
    searchableFields: ['name','mail','id'],
    fulltextFields: ['name','mail']
    //todo: add options for paging
    //todo: add options for search (allowence), fulltext...
})));