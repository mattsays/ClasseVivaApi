var express = require('express')
var classeviva = require('classeviva-api')
var app = express()

app.get('/user/login/:name/:pswd', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Sent SessionID for ' + ip)
    classeviva.login(req.params.name, req.params.pswd).then( (user) => {
        res.status(200).send({status:"OK!", session_id: user.session_id});
    }).catch(() => {
        res.send({"status":"Can\'t connect to classeviva"})
    })
})

app.get('/user/:sess_id/grades', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Sent grades for ' + ip)
    classeviva(req.params.sess_id).grades().then((grades) => {
        res.send({session_id: req.params.sess_id, grades})
    }).catch((e) => {
        res.send({status:"There was an error", error: e})
    })
})

app.get('/user/:sess_id/notes', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Sent notes for ' + ip)
    classeviva(req.params.sess_id).notes().then((notes) => {
        res.send({session_id: req.params.sess_id, notes})
    }).catch((e) => {
        res.send({status:"There was an error", error: e})
    })
})

app.get('/user/:sess_id/absences', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Sent absences for ' + ip)
    classeviva(req.params.sess_id).absences().then((absences) => {
        res.send({session_id: req.params.sess_id, absences})
    }).catch((e) => {
        res.send({status:"There was an error", error: e})
    })
})

app.get('/user/:sess_id/lessons', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Sent lessons for ' + ip)
    classeviva(req.params.sess_id).lessons().then((lessons) => {
        res.send({session_id: req.params.sess_id, lessons})
    }).catch((e) => {
        res.send({status:"There was an error", error: e})
    })
})

app.get('/user/:sess_id/lessons/:date', (req, res) => {
    var date = ''
    if(req.params.date != '' || req.params.date != undefined){
        date = req.params.date
    }
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Sent lessons for ' + ip)
    classeviva(req.params.sess_id).lessons(date).then((lessons) => {
        res.send({session_id: req.params.sess_id, lessons})
    }).catch((e) => {
        res.send({status:"There was an error", error: e})
    })
})

app.listen(80)
console.log('Started!')