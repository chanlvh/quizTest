var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

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
    
    res.send(email);
});
app.get('/quiz', function (req, res) {
    let email = req.query.email;
    res.send(email);
});
app.listen(3000, () => console.log('App listening on port 3000!'));

module.exports = app;
