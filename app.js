var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// DB STUFFS
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var db = null;
var countQues = 0;

MongoClient.connect('mongodb://localhost:27017/main', function (err, client) {
  if (err) throw err;
  db = client.db('main');
  const coll = db.collection('ques');
  coll.countDocuments(function (err, result) {
      if (err) throw err;
      countQues = result;
  });
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
        res.redirect('/quiz?id=' + result.ops[0]._id);
    });
});
app.get('/quiz', function (req, res) {
    let id = req.query.id;
    let prevQues = parseInt(req.query.prev_ques);

    // save previous answer
    let answer = req.query.answer;
    if (answer && prevQues) {
        const coll = db.collection('answers');
        coll.insertOne({user: ObjectID(id), ques: prevQues, answer: answer}, function(err, result) {
            if (err) throw err;
            console.log("Saved answer for " + prevQues + " from " + id);
        });
    }

    //calculate next question
    if (!prevQues) prevQues=0;
    let ques = prevQues + 1;

    if (ques > countQues) {
        res.send('Thanks for taking the test');
    }
    const coll=db.collection('ques');
    coll.findOne({pos: ques}, function(err, result) {
        if (err) throw err;
        let ques_text = 'Question ' + ques + '/' + countQues + '<br />' + result.text;
        let form = '<form method="get" action="/quiz">';
        form += '<input type="hidden" name="prev_ques" value=' + ques + ' />';
        form += '<input type="hidden" name="id" value=' + id + ' />';
        form += '<input type="text" name="answer" />';
        form += '<input type="submit" value="Next"/>';
        res.send(ques_text + form);
    });
});
app.listen(3000, () => console.log('App listening on port 3000!'));

module.exports = app;
