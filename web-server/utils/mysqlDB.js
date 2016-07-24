var tMysqlDao = require('tmysqlpromisedao');
var db = tMysqlDao(require('../config').mysql);

module.exports = db;