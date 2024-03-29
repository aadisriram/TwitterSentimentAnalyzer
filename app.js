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

var port = process.env.PORT || 3000;

var server = http.createServer(app);

server.listen(3000);

var io = require('socket.io').listen(server);

//Using immortal-ntwitter to avoid twitter dropping the connection
//to affect our sentiment analyzers functioning.
var twitter = require('immortal-ntwitter');

//Creating the immortal-ntwitter client
var twit = twitter.create({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//The words that define the tweets to pull
var track_words = ['love', 'hate'];
var love_count = 0;
var hate_count = 0;

//Starting the stream with the track words mentioned to filter out
//unwanted tweets on the twitter server side itself.
twit.immortalStream('statuses/filter', {track: track_words}, function (stream) {
    stream.on('data', function (data) {
        if (data['text'].toLowerCase().indexOf(track_words[0]) > -1) {
            love_count++;
            var loveperc = getLovePerc();
            //Emitting here to enable multiple clients
            io.emit("tweet_love",
                {
                    name: data['user']['screen_name'],
                    tweet: data['text'],
                    hatecount: hate_count,
                    lovecount: love_count,
                    total: (hate_count + love_count),
                    loveperc: loveperc,
                    hateperc: (100 - loveperc).toFixed(2),
                    imageurl: data['user']['profile_image_url']
                });
        }
        if (data['text'].toLowerCase().indexOf(track_words[1]) > -1) {
            hate_count++;
            var loveperc = getLovePerc();
            //Emitting here to enable multiple clients
            io.emit("tweet_hate",
                {
                    name: data['user']['screen_name'],
                    tweet: data['text'],
                    hatecount: hate_count,
                    lovecount: love_count,
                    total: (hate_count + love_count),
                    loveperc: loveperc,
                    hateperc: (100 - loveperc).toFixed(2),
                    imageurl: data['user']['profile_image_url']
                });
        }
    });
});

//static global function to calculate the percentage of tweets
//with the word love in them.
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
