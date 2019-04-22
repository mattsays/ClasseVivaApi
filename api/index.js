const request = require('request-promise')
const User = module.exports.User = require('./lib/User.js')

const base_url = 'https://web.spaggiari.eu'

module.exports = (session_id) => {
    return new User(session_id)
}

module.exports.login = (username, password) => {
    jar = request.jar();
    options = {
        method: 'POST',
        uri: base_url + '/auth-p7/app/default/AuthApi4.php?a=aLoginPwd', 
        formData: {
            uid : username,
            pwd : password
        },
        jar: jar
    }
    
    return request(options)
        .then(() => {
            var session = jar.getCookieString(options.uri).split('PHPSESSID=')[1]
            
            if(session == null)
                throw new Error('Invalid username or password')
        
           
            return new User(session)
        }).catch((e) => {
            throw e
        })
}