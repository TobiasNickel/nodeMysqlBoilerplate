var userDao = require('../dao/userDao');

const authService = module.exports;

authService.validateLogin = async function (options) {
    var user = await userDao.getOneByMail(options.mail);
    if(user.password == options.password) return user;
    throw new Error('wrong password');
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
        password: password,
        mail: mail,
        registrationTime: new Date(),
        verified: false
    };
    var insertId = userDao.insert(user);
    user.id=insertId;
    return user;
};