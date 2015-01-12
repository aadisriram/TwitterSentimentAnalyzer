/**
 * Created by aadisriram on 1/10/15.
 */

var port = 3000;

var server_name = "http://localhost:" + port + "/";
var server = io.connect(server_name);

function updateData(msg) {
   $('#totalcount').text(msg.total);
   $('#counterlove').text(msg.lovecount);
   $('#counterhate').text(msg.hatecount);
   $('#perclove').text(msg.loveperc + '%');
   $('#perchate').text(msg.hateperc + '%');
   $('#proglove').css('width', msg.loveperc + '%').attr('aria-valuenow', msg.loveperc);
   $('#proghate').css('width', msg.hateperc + '%').attr('aria-valuenow', msg.hateperc);
}

server.on("tweet_love", function(msg) {

   updateData(msg);

   if($('#tweetlove li').size() > 10) {
      $('#tweetlove li:last').remove();
   }

   $('#tweetlove ul').prepend('<li class="list-group-item">' +
   '<img src="' + msg.imageurl + '" />' +
   '</div>' + msg.name + ' : ' + msg.tweet + '</li>');
});

server.on("tweet_hate", function(msg) {

   updateData(msg);

   if($('#tweethate li').size() > 10) {
      $('#tweethate li:last').remove();
   }
   $('#tweethate ul').prepend('<li class="list-group-item">' +
   '<img src="' + msg.imageurl + '" />' +
   '</div>' + msg.name + ' : ' + msg.tweet + '</li>');
});

console.log('Client: Connecting to server ' + server_name);