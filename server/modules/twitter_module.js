var twitter = require('ntwitter'),
	util = require('util')
    config = require('../config')
    events = require('events');

var subscribers  = [];

module.exports.twit = new twitter({
	consumer_key: config.params.CONSUMER_KEY,
    consumer_secret: config.params.CONSUMER_SECRET,
    access_token_key: config.params.ACCESS_TOKEN_KEY,
    access_token_secret: config.params.ACCESS_TOKEN_SECRET
});

module.exports.addSubscriber = function(stream){
    subscribers.push(stream);
}

module.exports.removeSubscriber = function(stream){
    subscribers.remove(stream);
}
module.exports.getSubscribersNumber =function(){
    return subscribers.length;
}

module.exports.consumeStream =  function(stream, params){
    console.log('consume stream');
    var pins = params.pins;
    stream.on('data', function(data){
        // console.log(data);
        if(data != 'undefined'){
            try{
                //console.log("sending tweet "+data.text);
                var htlength = data.entities.hashtags.length;
                for(var i = 0; i< htlength; i++){
                    var pin = 0;
                    var ht = data.entities.hashtags[i].text;

                    var pinlgt = pins.length;
                    for(var j = 0; j < pinlgt; j++){
                        if(pins[j].hashtag == ht.toLowerCase()){
                            pin = pins[j].pin;
                        }
                    }
                    if(pin > 0){
                       // console.log('sending '+data.text);
                        for(var k = 0; k < subscribers.length; k++){
                            subscribers[k].write(pin+'|'+data.text.length+'<');
                            //commented because  of errors.
                            // TODO find out what happened here
                            //subscribers[k].pipe(subscribers[i]);
                        }
                    }
                }

            }catch(err){
                console.log("error "+err );
            }
        }
    });

    stream.on('error', function(e){
        console.log('error '+ e);
        socket.write('an error occured');
        socket.pipe(socket);

    });
    stream.on('end', function(){
       console.log('Twitter stream API connection ended');
    });
};
