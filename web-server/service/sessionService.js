const sessionDao = require('../dao/sessionDao');

const service = module.exports;

service.get = async function(id){
    var session = await sessionDao.getOneById(id);
    if(!session){return {};}
    return session.data;
};

service.set = async function(sessionData,opts){
    var id = opts.sid;
    if(id){
        var session = {
            id:id,
            data:sessionData,
            userId:sessionData.userId,
            lastAccess: new Date()
        };
        await sessionDao.save(session);
    }else{
        var newId = createSessionId();
        var session = {
            id: newId,
            data: sessionData,
            userId: sessionData.userId,
            lastAccess: new Date()
        };
        await sessionDao.insert(session);
        session.id = newId;
    }
    //console.log('stored session ',session.id);
    return session.id;
};

service.destroy = async function(id){
    await sessionDao.removeById(id);
};

function createSessionId(){
    return getQuad()+getQuad()+getQuad()+getQuad();
}

function getQuad(){
    return parseInt(Math.random()*10000000000).toString(32).substr(-4);
}