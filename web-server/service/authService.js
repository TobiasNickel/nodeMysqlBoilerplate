var userDao = require('../dao/userDao');

module.exports = {
    validateLogin:function(options){
        return userDao.getOneByMail(options.mail).then((user) => {
            if (user && user.password == options.password) {
                return user ;
            } else {
                res.render('login.jade', {error: 'wrong login infos'});
            }
        })
    },
    /**
     * @param params {object}
     *       name {string}
     *       password {string}
     *       mail {string}
     */
    register: function(params) {
        return new Promise(function(resolve, reject) {
            var name = params.name;
            var mail = params.mail;
            var password = params.password;
            
            var errors = [];
            if(!name) errors.push('missing name');
            if(!password)errors.push('missing password');
            if(!mail) errors.push('missing mail');
            if(password.length < 6) errors.push('password is to short');
            
            if(errors.length){
                reject(new Error(errors.join(', ')));
                return;
            }
            
            userDao.getOneByMail(mail).then(function(user) {
                if (user) {
                    reject(new Error('mail already in use'))
                    return;
                }
                var user = {
                    name: name,
                    password: password,
                    mail: mail,
                    registeredTime: new Date(),
                    verified: false
                };
                userDao.insert(user).then(function(insertId) {
                    resolve(user);
                }).catch(function(err) {
                    console.log(err)
                    reject(new Error('could not register'));
                });
            }).catch(function(err){
                    console.log(err)
                reject('could not register')
            });
        });
    }
};