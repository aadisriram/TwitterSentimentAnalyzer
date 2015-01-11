var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http = require('http');

var server = http.createServer(app);

server.listen(3000);

var io = require('socket.io').listen(server);

var twitter = require('ntwitter');

var twit = new twitter({
    consumer_key: 'v9BIUekmGglxjrty77VbNZdPM',
    consumer_secret: 'qD4mnlXLHPdhbDOrZvGSRJjv0UEzwxZD3cVbrSqQbWgMXRDn83',
    access_token_key: '25076520-1T97cLiNDmjqAgFcBDcnwPURkyxh1Ta6WQlTSZkpS',
    access_token_secret: 'NWnJflgeXljmeKtzkbei3oigd1ung2lahm3vYxJje7M60'
});

var track_words = ['love', 'hate'];
var love_count = 0;
var hate_count = 0;

io.sockets.on('connection', function (socket) {
    twit.stream('statuses/filter', {track: track_words}, function (stream) {
        stream.on('data', function (data) {
            if (data['text'].indexOf('love') > -1) {
                love_count++;
                var loveperc = getLovePerc();
                socket.volatile.emit("tweet_love",
                    {name:data['user']['screen_name'],
                        tweet:data['text'],
                        hatecount: hate_count,
                        lovecount: love_count,
                        total: (hate_count + love_count),
                        loveperc: loveperc,
                        hateperc: (100 - loveperc).toFixed(2)
                    });
            }
            if (data['text'].indexOf('hate') > -1) {
                hate_count++;
                var loveperc = getLovePerc();
                socket.volatile.emit("tweet_hate",
                    {name: data['user']['screen_name'],
                        tweet: data['text'],
                        hatecount: hate_count,
                        lovecount: love_count,
                        total: (hate_count + love_count),
                        loveperc: loveperc,
                        hateperc: (100 - loveperc).toFixed(2)
                    });
            }
        });
    });
});

function getLovePerc() {
    return (((love_count)/(love_count + hate_count))*100).toFixed(2);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
