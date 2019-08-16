var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');

//==========================================


const Discord = require("discord.js");
const config = require("./config_bot.json");




const bot = new Discord.Client();

var Alligator = null;
var voiceChannel = null;
var queue = [];

bot.on('ready', () => {
    // List servers the bot is connected to
    console.log("Servers:")
    bot.guilds.forEach((guild) => {
        console.log(" - " + guild.name);
        Alligator = guild;
    });
    //console.log(Alligator.channels.get('451111075400646657'));
    voiceChannel = Alligator.channels.get('451111075400646657');
    bot.on('message', async message =>{
	voiceChannel = message.member.voiceChannel;

		if(message.author.equals(bot.user)) return;

		if(!message.content.startsWith(config.prefix)) return;

		var args = message.content.substring(config.prefix.length).split(" ");
		switch (args[0].toLowerCase()){
			case "ping":
				message.channel.sendMessage("Pong!");
				break;
			case "info":
				message.channel.sendMessage("Я каменьшик. Работаю 3 дня. Без зарплаты.");
				break;
			case "skip":
				if(dispatcher) dispatcher.end();
				break;
			case "stop":
				if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
				break;
			case "queue":
				if(queue[0]){
					message.channel.sendMessage(queue);
				} else {
					message.channel.sendMessage("Queue is empty");	
				}
				break;
		}

		console.log(message.content);

		// voiceChannel.join().then(connection =>{
		// 	const dispatcher = connection.playFile('./pidoras.mp3');
		// 	dispatcher.on("end", end => {
		// 		voiceChannel.leave();
		// 	});

		// }).catch(err => console.log(err));
		if(message.content === "работай") playMusic();

	});



})


queue.addAudio = function(filename){
	queue.push(filename);
	console.log(queue);
}
queue.getAudio = function(){
	return queue[0];
}
queue.deleteFirstAudio = function(){
	queue.shift();
}

// queue.addAudio('./Belinda Carlisle - Circle in the Sand.mp3');

var dispatcher = null;
var playMusic = function(){
	voiceChannel.join().then(connection =>{
		dispatcher = connection.playFile(queue.getAudio());
		
		dispatcher.on("end", end => {
			queue.deleteFirstAudio();
			console.log('lenght: ' + queue.length);
			if(queue.length > 0){

				playMusic();

			}else{
				voiceChannel.leave();
			}
			
		});

	}).catch(err => console.log(err));
}

var request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var port = 8082;
 
var s = http.createServer();

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('request', function (req, res) {
    console.log(req)
});
const { parse } = require('querystring');
s.on('request', function(request, response) {
    response.writeHead(200);
    console.log(request.method);
    console.log(request.headers);
    console.log(request.url);
 
    var data = '';
    request.on('data', function(chunk) {
        data += chunk.toString();
    });
    request.on('end', function() {
    	data = parse(data);
        //console.log(data);
        response.write('hi');
        response.end();
        if(!voiceChannel) return;
		//console.log(data);
		if(data.url){
			//console.log("url - " + data.url);
			queue.addAudio(data.filename);
			console.log('lenght: ' + queue.length);
		}else{
			console.log("url - empty link");
			return null;
		}
		console.log(voiceChannel.name);
		if(voiceChannel){
		download(data.url, data.filename, function(){
			console.log('done');
			if(queue.length === 1) playMusic();
				
		});
		}
    });
 
});
 
s.listen(port);
console.log('Browse to http://127.0.0.1:' + port);

bot.login('NDY5ODkxODk4MDM5OTkyMzIx.XVchYQ.PPCIho3oMqvqpXWbGFiYXTDCs00');
