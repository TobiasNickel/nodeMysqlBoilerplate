const userDao = require('../dao/userDao');
const md5 = require('md5');

const authService = module.exports;

authService.validateLogin = async function (options) {
    const mail = options.mail;
    const password = options.password;
    const user = await userDao.getOneByMail(mail);
    if(user && user.password == hash(mail, password)) return user;
    return undefined;
};
/**
 * @param params {object}
 *       name {string}
 *       password {string}
 *       mail {string}
 */
authService.register = async function (params) {
    var name = params.name;
    var mail = params.mail;
    var password = params.password;

    var errors = [];
    if (!name) errors.push('missing name');
    if (!password) errors.push('missing password');
    if (!mail) errors.push('missing mail');
    if (password.length < 6) errors.push('password is to short');

    if (errors.length) {
        throw new Error(errors.join(', '));
    }
    var user = await userDao.getOneByMail(mail);
    if (user) {
        throw new Error('mail already in use');
    }
    var user = {
        name: name,
        password: hash(mail,password),
        mail: mail,
        registrationTime: new Date(),
        verified: false
    };
    user.id = await userDao.insert(user);
    return user;
};

function hash(mail,password){
    return md5(mail+':'+password);
}