var db = require('../utils/mysqlDB');

var sessionDao = {
    tableName: 'session',
    fields: { // fields in the table
        id: {
            type: 'char(64)',
            primary: true
        },
        data: {
            type: 'text'
        },
        userId: {
            type: 'int'
        },
        lastAccess: {
            type: 'datetime'
        },
    },
    has: {},
    map: function(session){
        session.data = JSON.parse(session.data);
        return session;
    },
    inputMap: function(session){
        session.data = JSON.stringify(session.data)
        return session;
    }
};
module.exports = sessionDao;
db.prepareDao(sessionDao);
sessionDao.createTable().catch(err=>console.log(err));
