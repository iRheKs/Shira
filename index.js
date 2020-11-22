const fs = require('fs');
const Discord = require("discord.js");
const config = require("./config.json");
const JSONreader = require('./Utils/JSONreader.js');

//global variables
var gameCh = 'general'; //game channel
const prefix = config.prefix; //command prefix
var serverList = new Array();
var newServer = 
{
    name: "",
    channelID: "",
    started: false,
}

// Initialize Discord Bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.login(config.token);

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    //read through command files to save them into a list
    const command = require(`./Commands/${file}`);
	bot.commands.set(command.name, command);
}

bot.on('ready', (evt) => {OnBotIsReady(evt);});

bot.on('message',  message => {OnMessageRecived(message);});

bot.on('channelCreate', channel => { OnChannelCreated(channel);});

function OnBotIsReady(evt){
    var guilds = bot.guilds.cache.array();

    console.log("Connected");
    console.log(`Logged in as: ${bot.user.tag}`);
    console.log(`Logged in guilds: ${guilds}`);

    JSONreader.jsonReader('./servers.json', (err, servers) => {
        if (err) {
            console.log(err);
            return;
        }
        serverList = servers.servers;
        /** when bot is ready we check if the guild is in the server list, 
         * in case is not that way, we include into the list
         * it will be included just with the guild name/id and setted to not started yet
         */
        guilds.forEach(guild => {
        var serverToCheck = serverList.find(s => s.name == guild.id);
        if(!serverToCheck) //CREO
        {
            newServer.name = guild.id;
            newServer.channelID = "";
            newServer.started = false;
            serverList.push(newServer);
        }
       });
       //if server lists have different lengths we should save the new servers added to the list
       if(servers.servers.length <= serverList.length)
       {
        servers.servers = serverList;
        fs.writeFile('./servers.json', JSON.stringify(servers, null, 2), (err) => {
            if (err) console.log('Error writing file:', err);
        })
       }
    })

    console.log('All servers updated');
}

function OnMessageRecived(message) {
    // Bot will listen to commands starting with prefix '+'
    const content = message.content; //save de content in a variable for legible purposes
    if (!content.startsWith(prefix) || message.author.bot) return;
    if (content.startsWith(prefix)) {
        var server = serverList.find(name=>name.name == message.guild.id);
        if(!server) return;//TODO: server not encountered error
        //we get the arguments of the command
        const args = content.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        
        if(message.channel.id != server.channelID && server.started) {message.react('🚫'); return;}
        const command = bot.commands.get(cmdName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));
        if (!command) return;
        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
            if (command.usage) {
            	reply += `\nThe proper usage would be: \`${prefix}${cmdName} ${command.usage}\``;
            }
            return message.channel.send(reply);
    	}
        try {
            if(!server.started && (cmdName === 'setup' || command.aliases.includes(cmdName)))
            { 
                command.execute(message, args);
            }else{
                if(!server.started){message.channel.send(`You need to set up the bot before start to use it.\n Use ${prefix}setup <channel name> to start playing.`);}
                else if(cmdName === 'setchannel' || command.aliases.includes(cmdName)){
                    var channelChanged = command.execute(message, args);
                    if(channelChanged)
                        server.channelID = args[0];
                }else
                    command.execute(message, args);
            }
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command');
        }
    }
}

function OnChannelCreated(channel){
    //if the channel wasn't created by the bot we don't update the channelID
    if(channel.client.user.tag != bot.user.tag) return;
    JSONreader.jsonReader('./servers.json', (err, servers) => {
        if (err) {
            console.log(err)
            return
        }
        var server = serverList.find(name=>name.name == channel.guild.id);
        if(server != undefined && server.name == channel.guild.id && !server.started){
            serverList.find(name=>name.name == channel.guild.id).channelID = channel.id; 
            serverList.find(name=>name.name == channel.guild.id).started = true;
            servers.servers = serverList;
            fs.writeFile('./servers.json', JSON.stringify(servers, null, 2), (err) => {
                if (err) console.log('Error writing file:', err)
            })
        }
    })
}


