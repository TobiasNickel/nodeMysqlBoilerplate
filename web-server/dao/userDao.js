var db = require('../utils/mysqlDB');

var userDao = {
    tableName: 'user',
    fields: { // fields in the table
        id: {
            type: "int AUTO_INCREMENT",
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
    has: {}
};
module.exports = userDao;
db.prepareDao(userDao);
userDao.createTable().catch(err=>console.log(err));
