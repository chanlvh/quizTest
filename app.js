var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// DB STUFFS
var MongoClient = require('mongodb').MongoClient
var db = null;

MongoClient.connect('mongodb://localhost:27017/main', function (err, client) {
  if (err) throw err;
  db = client.db('main');
});
// END DB STUFFS


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.get('/new', function (req, res) {
    let fname = req.query.first_name;
    let lname = req.query.last_name;
    let email = req.query.email;
    const coll = db.collection('users');
    coll.insert({fname: fname, lname: lname, email: email}, function(err, result) {
        if (err) {
            res.send('Error: ' + err);
            return;
        };
        res.redirect('/quiz?id=' + result.ops[0]._id);
    });
});
app.get('/quiz', function (req, res) {
    let id = req.query.id;
    res.send(id);
});
app.listen(3000, () => console.log('App listening on port 3000!'));

module.exports = app;
