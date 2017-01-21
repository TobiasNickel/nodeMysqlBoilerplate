var db = require('../utils/mysqlDB');

var userDao = {
    tableName: 'user',
    fields: { // fields in the table
        id: {
            type: 'int AUTO_INCREMENT',
            primary: true
        },
        name: {
            type: 'varchar(255)'
        },
        password: {
            type: 'char(32)'
        },
        verified: {
            type: 'Boolean'
        },
        mail: {
            type: 'varchar(255)'
        },
        registrationTime: {
            type: 'datetime'
        },
    },
    has: {
        sessions: { tableName: 'session', foreignKey: 'userId', localField: 'id', multiple: true }
    },
    map:function(user){
        if(user.registrationTime){
            user.registrationTime = parseInt(user.registrationTime.getTime()/1000);
        }else{
            user.registrationTime = null;
        }
        delete user.password;
        return user;
    }
};
module.exports = userDao;
db.prepareDao(userDao);
userDao.createTable().catch(err=>console.log(err));


