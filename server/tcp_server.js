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
    connex.on('listening', function(){
        log('listening on '+PORT);
    });
    connex.on('connection', function(){
        log('client connected');
        twitterModule.addSubscriber(connex);
        connex.write("--- Welcome to relab's Hahstag Lamps Server --- "+"\r\n");
        connex.write("The hashtags actually filtered are  : "+"\r\n");
        for(var i = 0; i < filters.length; i++){
            connex.write("\t"+filters[i]+"\r\n");
        }
        connex.pipe(connex);
        log('New subscriber: ' + twitterModule.getSubscribersNumber() + " total.\n");

    });

    connex.on('data', function(data){
       log('data received '+data);
    });

    connex.on('end', function(){
        twitterModule.removeSubscriber(connex);
    });

}

var server = net.createServer(onConnect);
server.listen(PORT, function(){
    log('server created');
    twit.stream('statuses/filter',{'track': filters}, function(str){twitterModule.consumeStream(str, params)});
});

server.on('connection', function(connex){

    log('client connected');
    twitterModule.addSubscriber(connex);
    connex.write("--- Welcome to relab's Hahstag Lamps Server --- "+"\r\n");
    connex.write("The hashtags actually filtered are  : "+"\r\n");
    for(var i = 0; i < filters.length; i++){
        connex.write("\t"+filters[i]+"\r\n");
    }
    connex.pipe(connex);
    log('New subscriber: ' + twitterModule.getSubscribersNumber() + " total.\n");


    connex.on('end', function(){
        twitterModule.removeSubscriber(connex);
        connex.end();
        log('Subscriber left: ' + twitterModule.getSubscribersNumber() + " total.\n");
    });

});

server.on('error', function(e){
    switch(e.code){
        case 'EADDRINUSE':{
            log('Address in use. Retrying...');
            setTimeout(function(){
                server.close();
                server.listen(PORT)
            },1000);
            break;
        }
        case 'EHOSTUNREACH':{
            log("Restarting server");
            setTimeout(function(){
                server.close();
                server.listen(PORT);
            }, 1000);
            break;
        }
        case 'ECONNRESET':{
            log(e.code+' ... Restarting server');
            setTimeout(function(){
                server.close();
                server.listen(PORT);
            }, 1000);
            break;
        }
        default :{
            log('Error '+ e.code);
            setTimeout(function(){
                server.close();
                server.listen(PORT);
            }, 1000);
            break;
        }
    }
});


function log(text){
    var logDate = new Date().toString().replace(/G.*/,'').replace(/[a-zA-Z]*\ /,'');
    console.log(logDate+'- '+text);
}

// server.maxConnections = 7000;
