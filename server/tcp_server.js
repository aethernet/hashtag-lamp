var twitterModule = require('./modules/twitter_module.js'),
    net = require('net');

var PORT = 33333;
var HOST = '0.0.0.0';
var filters =
    [
        '#happy', '#fablab',
        '#3dprinting', '#relab',
        '#liege', '#sad',
        '#processing', '#lasercutting',
        'fabjamliege'
    ];
var params = {};
var pins = [
    {hashtag:'happy', pin: 1},{hashtag:'fablab', pin: 2},{hashtag:'3dprinting', pin : 3},
    {hashtag:'relab', pin:4},{hashtag:'liege', pin: 5},{hashtag:'sad', pin: 6},
    {hashtag:'processing', pin : 7},{hashtag:'lasercutting', pin : 8},{hashtag:'fabjamliege', pin :9},
];

params.pins = pins;

// var server = dgram.createSocket('udp4');



var subscribers = [];
var twit = twitterModule.twit;

var onConnect = function(connex){
    connex.on('listen', function(){
        console.log('listening on '+PORT);

    });
    connex.on('connect', function(){
        console.log('client connected');
        twitterModule.addSubscriber(connex);
        connex.write("--- Welcome to relab's Hahstag Lamps Server --- "+"\r\n");
        connex.write("The hashtags actually filtered are  : "+"\r\n");
        for(var i = 0; i < filters.length; i++){
            connex.write("\t"+filters[i]+"\r\n");
        }
        connex.write("\r\n");
        console.log('New subscriber: ' + twitterModule.getSubscribersNumber() + " total.\n");

    });
    connex.on('end', function(){
        twitterModule.removeSubscriber(connex);
        connex.end();
        console.log('Subscriber left: ' + twitterModule.getSubscribersNumber() + " total.\n");
    });



}


var server = net.createServer(onConnect);
server.listen(PORT, function(){
    console.log('server created');
    twit.stream('statuses/filter',{'track': filters}, function(str){twitterModule.consumeStream(str, params)});
});
server.on('error', function(e){
    switch(e.code){
        case 'EADDRINUSE':{
            console.log('Address in use. Retrying...');
            setTimeout(function(){
                server.close();
                server.listen(PORT)
            },1000);
            break;
        }
        case 'EHOSTUNREACH':{
            console.log("Restarting server");
            setTimeout(function(){
                server.close();
                server.listen(PORT);
            }, 1000);
            break;
        }
        case 'ECONNRESET':{
            console.log('Restarting server');
            setTimeout(function(){
                server.close();
                server.listen(PORT);
            }, 1000);
            break;
        }
        default :{
            console.log('Error '+ e.code);
        }
    }
});

// server.maxConnections = 7000;