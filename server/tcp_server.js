var twitterModule = require('./modules/twitter_module.js'),
    net = require('net');

var PORT = 33333;
var HOST = '0.0.0.0';
var filters1 =
    [
        '#happy', '#fablab',
        '#3dprinting', '#relab',
        '#liege', '#sad',
        '#processing', '#lasercutting',
        'fabjamliege'
    ];
var filters2 = ['#sex', '#twitter', '#usa', '#ISmileWhen'];
var params = {};
var pins = [
    {hashtag:'happy', pin: 1},{hashtag:'fablab', pin: 2},{hashtag:'3dprinting', pin : 3},
    {hashtag:'relab', pin:4},{hashtag:'liege', pin: 5},{hashtag:'sad', pin: 6},
    {hashtag:'processing', pin : 7},{hashtag:'lasercutting', pin : 8},{hashtag:'fabjamliege', pin :9},
    {hashtag:'sex', pin:1},{hashtag:'twitter', pin:2},{hashtag:'usa', pin:3},{hashtag:'ISmileWhen', pin:4}
];

params.pins = pins;
params.filters1 = filters1;
params.filters2 = filters2;
filters = filters1.concat(filters2);

// var server = dgram.createSocket('udp4');

var subscribers = [];
var twit = twitterModule.twit;

var server = net.createServer();
server.listen(PORT, function(){
    log('server created');
    try{
        twit.stream('statuses/filter',{'track': filters}, function(str){twitterModule.consumeStream(str, params)});
    }catch(err){

        log("--- error "+err );
    }
});

server.on('connection', function(connex){

    log('client connected');
    connex.write("--- Welcome to relab's Hahstag Lamps Server --- "+"\r\n");
    connex.write("The hashtags actually filtered are  : "+"\r\n");
    for(var i = 0; i < filters.length; i++){
        connex.write("\t"+filters[i]+"\r\n");
    }
    connex.write("your type of client [1-2]~ ");

    connex.on('end', function(){
        twitterModule.removeSubscriber(connex);
        connex.end();
        log('Subscriber left: ' + twitterModule.getSubscribersNumber() + " total.\n");
    });

    connex.on('data', function(data){

        if(typeof connex.type != 'number'){
            var test = parseInt( data.toString());
            console.log(typeof test);
            switch(test){
                case 1: log("setting connection type 1");connex.type = 1; break;
                case 2: log("setting connection type 2");connex.type = 2; break;
                default: connex.type = false;
            }
        }
        log(connex.bound);
        if(connex.type && (typeof connex.bound == 'undefined' || connex.bound == false )){
            connex.bound = true;
            twitterModule.addSubscriber(connex);
            log('New subscriber: ' + twitterModule.getSubscribersNumber() + " total.\n");
        }

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
